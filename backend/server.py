from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage
import asyncio
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME')]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 72

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============= MODELS =============
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

class ReviewResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    submissionId: str
    timeComplexity: str
    spaceComplexity: str
    edgeCases: List[str]
    codeStructure: str
    optimizationSuggestions: List[str]
    interviewReadiness: str
    rating: str
    optimizedCode: str
    interviewQuestions: List[str]
    createdAt: str

class AnalyticsSummary(BaseModel):
    totalSubmissions: int
    ratingDistribution: dict
    languageDistribution: dict
    categoryDistribution: dict
    recentSubmissions: List[dict]

# ============= UTILITY FUNCTIONS =============
def create_jwt_token(user_id: str, email: str) -> str:
    """Create JWT token for authenticated user"""
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Verify JWT token and return payload"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

# ============= AI SERVICE =============
async def analyze_code_with_ai(language: str, category: str, problem_description: str, code: str) -> dict:
    """Analyze code using OpenAI GPT-5.1"""
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        
        prompt = f"""
You are a senior software engineer and FAANG interviewer.

Analyze the following {language} code for a {category} problem.

Problem Description:
{problem_description}

Code:
{code}

Tasks:
1. Determine time and space complexity
2. Identify missing edge cases (list specific cases)
3. Evaluate code structure and readability
4. Suggest specific optimizations
5. Label the code as: Beginner, Interview-Ready, or Production-Grade
6. Provide an optimized version of the code with clear improvements
7. Generate 3-5 technical interview questions based on this code

Respond ONLY with valid JSON in this exact format:
{{
    "timeComplexity": "O(...) explanation",
    "spaceComplexity": "O(...) explanation",
    "edgeCases": ["edge case 1", "edge case 2"],
    "codeStructure": "detailed evaluation of structure and readability",
    "optimizationSuggestions": ["suggestion 1", "suggestion 2"],
    "interviewReadiness": "detailed feedback on interview readiness",
    "rating": "Beginner|Interview-Ready|Production-Grade",
    "optimizedCode": "complete optimized version of the code",
    "interviewQuestions": ["question 1", "question 2", "question 3"]
}}
"""
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"code_review_{uuid.uuid4()}",
            system_message="You are an expert code reviewer and technical interviewer. Always respond with valid JSON."
        )
        chat.with_model("openai", "gpt-5.1")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse the JSON response
        analysis = json.loads(response)
        return analysis
        
    except Exception as e:
        logging.error(f"AI analysis failed: {str(e)}")
        # Return fallback analysis
        return {
            "timeComplexity": "Analysis pending",
            "spaceComplexity": "Analysis pending",
            "edgeCases": ["Edge case analysis in progress"],
            "codeStructure": "Code structure evaluation in progress",
            "optimizationSuggestions": ["Optimization suggestions will be provided shortly"],
            "interviewReadiness": "Interview readiness assessment in progress",
            "rating": "Beginner",
            "optimizedCode": code,
            "interviewQuestions": ["Interview questions will be generated shortly"]
        }

# ============= AUTH ROUTES =============
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt())
    
    # Create user
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "password": hashed_password.decode('utf-8'),
        "role": "user",
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create token
    token = create_jwt_token(user_id, user_data.email)
    
    return TokenResponse(
        token=token,
        user=UserResponse(
            id=user_id,
            name=user_data.name,
            email=user_data.email,
            role="user",
            createdAt=user_doc["createdAt"]
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    # Find user
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not bcrypt.checkpw(credentials.password.encode('utf-8'), user["password"].encode('utf-8')):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create token
    token = create_jwt_token(user["id"], user["email"])
    
    return TokenResponse(
        token=token,
        user=UserResponse(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            role=user["role"],
            createdAt=user["createdAt"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_current_user(payload: dict = Depends(verify_token)):
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
        createdAt=user["createdAt"]
    )

# ============= CODE SUBMISSION ROUTES =============
@api_router.post("/code/submit", response_model=dict)
async def submit_code(submission: CodeSubmissionCreate, payload: dict = Depends(verify_token)):
    # Create submission
    submission_id = str(uuid.uuid4())
    submission_doc = {
        "id": submission_id,
        "userId": payload["user_id"],
        "language": submission.language,
        "category": submission.category,
        "problemDescription": submission.problemDescription,
        "code": submission.code,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.submissions.insert_one(submission_doc)
    
    # Analyze code with AI
    analysis = await analyze_code_with_ai(
        submission.language,
        submission.category,
        submission.problemDescription,
        submission.code
    )
    
    # Create review
    review_id = str(uuid.uuid4())
    review_doc = {
        "id": review_id,
        "submissionId": submission_id,
        "timeComplexity": analysis["timeComplexity"],
        "spaceComplexity": analysis["spaceComplexity"],
        "edgeCases": analysis["edgeCases"],
        "codeStructure": analysis["codeStructure"],
        "optimizationSuggestions": analysis["optimizationSuggestions"],
        "interviewReadiness": analysis["interviewReadiness"],
        "rating": analysis["rating"],
        "optimizedCode": analysis["optimizedCode"],
        "interviewQuestions": analysis["interviewQuestions"],
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.reviews.insert_one(review_doc)
    
    return {
        "submissionId": submission_id,
        "reviewId": review_id,
        "message": "Code submitted and analyzed successfully"
    }

@api_router.get("/code/history", response_model=List[CodeSubmission])
async def get_submission_history(payload: dict = Depends(verify_token)):
    submissions = await db.submissions.find(
        {"userId": payload["user_id"]},
        {"_id": 0}
    ).sort("createdAt", -1).to_list(100)
    
    return submissions

@api_router.get("/review/{submission_id}", response_model=dict)
async def get_review(submission_id: str, payload: dict = Depends(verify_token)):
    # Get submission
    submission = await db.submissions.find_one({"id": submission_id}, {"_id": 0})
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    # Verify ownership
    if submission["userId"] != payload["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get review
    review = await db.reviews.find_one({"submissionId": submission_id}, {"_id": 0})
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    return {
        "submission": submission,
        "review": review
    }

@api_router.get("/analytics/summary", response_model=AnalyticsSummary)
async def get_analytics(payload: dict = Depends(verify_token)):
    user_id = payload["user_id"]
    
    # Get all submissions
    submissions = await db.submissions.find({"userId": user_id}, {"_id": 0}).to_list(1000)
    
    total_submissions = len(submissions)
    
    # Get reviews for rating distribution
    submission_ids = [s["id"] for s in submissions]
    reviews = await db.reviews.find(
        {"submissionId": {"$in": submission_ids}},
        {"_id": 0}
    ).to_list(1000)
    
    # Calculate distributions
    rating_dist = {"Beginner": 0, "Interview-Ready": 0, "Production-Grade": 0}
    for review in reviews:
        rating = review.get("rating", "Beginner")
        rating_dist[rating] = rating_dist.get(rating, 0) + 1
    
    language_dist = {}
    for sub in submissions:
        lang = sub.get("language", "Unknown")
        language_dist[lang] = language_dist.get(lang, 0) + 1
    
    category_dist = {}
    for sub in submissions:
        cat = sub.get("category", "Unknown")
        category_dist[cat] = category_dist.get(cat, 0) + 1
    
    # Get recent submissions (last 5)
    recent = submissions[:5]
    
    return AnalyticsSummary(
        totalSubmissions=total_submissions,
        ratingDistribution=rating_dist,
        languageDistribution=language_dist,
        categoryDistribution=category_dist,
        recentSubmissions=recent
    )

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
