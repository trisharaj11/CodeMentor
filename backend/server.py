from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import logging
from pathlib import Path
from pydantic import BaseModel, ConfigDict, EmailStr
from typing import List
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import json

# ================== OPTIONAL EMERGENT IMPORT ==================
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
except ImportError:
    LlmChat = None
    UserMessage = None

# ================== ENV LOADING ==================
ROOT_DIR = Path(__file__).parent

# Load .env ONLY in local development
if os.getenv("ENV") != "production":
    load_dotenv(ROOT_DIR / ".env")

# ================== DATABASE ==================
mongo_url = os.environ.get("MONGO_URL")
db_name = os.environ.get("DB_NAME")

if not mongo_url or not db_name:
    raise RuntimeError("MONGO_URL and DB_NAME must be set")

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# ================== JWT CONFIG ==================
JWT_SECRET = os.environ.get("JWT_SECRET", "change-this-secret")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 72

security = HTTPBearer()

# ================== APP ==================
app = FastAPI(title="CodeMentor AI Backend")
api_router = APIRouter(prefix="/api")

# ================== MODELS ==================
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    role: str = "user"
    createdAt: str

class TokenResponse(BaseModel):
    token: str
    user: UserResponse

class CodeSubmissionCreate(BaseModel):
    language: str
    category: str
    problemDescription: str
    code: str

class CodeSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    userId: str
    language: str
    category: str
    problemDescription: str
    code: str
    createdAt: str

class AnalyticsSummary(BaseModel):
    totalSubmissions: int
    ratingDistribution: dict
    languageDistribution: dict
    categoryDistribution: dict
    recentSubmissions: List[dict]

# ================== JWT UTILS ==================
def create_jwt_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        return jwt.decode(
            credentials.credentials,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ================== AI ANALYSIS ==================
async def analyze_code_with_ai(language, category, problem_description, code):
    # 🔴 If Emergent lib is not available, disable AI safely
    if LlmChat is None or UserMessage is None:
        return {
            "timeComplexity": "AI disabled in production",
            "spaceComplexity": "AI disabled in production",
            "edgeCases": [],
            "codeStructure": "AI disabled",
            "optimizationSuggestions": [],
            "interviewReadiness": "AI disabled",
            "rating": "Beginner",
            "optimizedCode": code,
            "interviewQuestions": []
        }

    try:
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            raise RuntimeError("EMERGENT_LLM_KEY not set")

        prompt = f"""
You are a senior software engineer and interviewer.

Analyze this {language} code for a {category} problem.

Problem:
{problem_description}

Code:
{code}

Respond ONLY in valid JSON with:
timeComplexity, spaceComplexity, edgeCases,
codeStructure, optimizationSuggestions,
interviewReadiness, rating,
optimizedCode, interviewQuestions
"""

        chat = LlmChat(
            api_key=api_key,
            session_id=f"review_{uuid.uuid4()}",
            system_message="Always respond with valid JSON only."
        ).with_model("openai", "gpt-5.1")

        response = await chat.send_message(UserMessage(text=prompt))
        return json.loads(response)

    except Exception as e:
        logging.error(f"AI error: {e}")
        return {
            "timeComplexity": "Pending",
            "spaceComplexity": "Pending",
            "edgeCases": [],
            "codeStructure": "Pending",
            "optimizationSuggestions": [],
            "interviewReadiness": "Pending",
            "rating": "Beginner",
            "optimizedCode": code,
            "interviewQuestions": []
        }

# ================== AUTH ROUTES ==================
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user: UserRegister):
    if await db.users.find_one({"email": user.email}):
        raise HTTPException(400, "Email already exists")

    hashed = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()
    user_id = str(uuid.uuid4())

    doc = {
        "id": user_id,
        "name": user.name,
        "email": user.email,
        "password": hashed,
        "role": "user",
        "createdAt": datetime.now(timezone.utc).isoformat()
    }

    await db.users.insert_one(doc)

    return TokenResponse(
        token=create_jwt_token(user_id, user.email),
        user=UserResponse(**doc)
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email})
    if not user or not bcrypt.checkpw(
        data.password.encode(), user["password"].encode()
    ):
        raise HTTPException(401, "Invalid credentials")

    return TokenResponse(
        token=create_jwt_token(user["id"], user["email"]),
        user=UserResponse(**user)
    )

# ================== CODE ROUTES ==================
@api_router.post("/code/submit")
async def submit_code(
    submission: CodeSubmissionCreate,
    payload=Depends(verify_token)
):
    submission_id = str(uuid.uuid4())

    doc = {
        "id": submission_id,
        "userId": payload["user_id"],
        "language": submission.language,
        "category": submission.category,
        "problemDescription": submission.problemDescription,
        "code": submission.code,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }

    await db.submissions.insert_one(doc)

    analysis = await analyze_code_with_ai(
        submission.language,
        submission.category,
        submission.problemDescription,
        submission.code
    )

    await db.reviews.insert_one({
        "id": str(uuid.uuid4()),
        "submissionId": submission_id,
        **analysis,
        "createdAt": datetime.now(timezone.utc).isoformat()
    })

    return {"message": "Code analyzed successfully"}

# ================== ANALYTICS ==================
@api_router.get("/analytics/summary", response_model=AnalyticsSummary)
async def analytics(payload=Depends(verify_token)):
    subs = await db.submissions.find(
        {"userId": payload["user_id"]}, {"_id": 0}
    ).to_list(1000)

    reviews = await db.reviews.find(
        {"submissionId": {"$in": [s["id"] for s in subs]}},
        {"_id": 0}
    ).to_list(1000)

    rating_dist = {}
    for r in reviews:
        rating_dist[r.get("rating", "Beginner")] = (
            rating_dist.get(r.get("rating", "Beginner"), 0) + 1
        )

    return AnalyticsSummary(
        totalSubmissions=len(subs),
        ratingDistribution=rating_dist,
        languageDistribution={},
        categoryDistribution={},
        recentSubmissions=subs[:5]
    )

# ================== MIDDLEWARE ==================
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

# ================== SHUTDOWN ==================
@app.on_event("shutdown")
async def shutdown():
    client.close()

# ================== STARTUP ==================
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("server:app", host="0.0.0.0", port=port)
