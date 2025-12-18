import requests
import sys
import json
from datetime import datetime

class CodeMentorAPITester:
    def __init__(self, base_url="https://codereviewer-4.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}. Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_user = {
            "name": f"Test User {timestamp}",
            "email": f"test{timestamp}@example.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_data = response['user']
            return True
        return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        if not self.user_data:
            return False
            
        login_data = {
            "email": self.user_data['email'],
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST", 
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            return True
        return False

    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_code_submission(self):
        """Test code submission"""
        code_data = {
            "language": "javascript",
            "category": "DSA",
            "problemDescription": "Test problem: Find the maximum element in an array",
            "code": "function findMax(arr) {\n    return Math.max(...arr);\n}"
        }
        
        success, response = self.run_test(
            "Code Submission",
            "POST",
            "code/submit",
            200,
            data=code_data
        )
        
        if success and 'submissionId' in response:
            self.submission_id = response['submissionId']
            return True
        return False

    def test_get_submission_history(self):
        """Test getting submission history"""
        success, response = self.run_test(
            "Get Submission History",
            "GET",
            "code/history",
            200
        )
        return success

    def test_get_review(self):
        """Test getting review for submission"""
        if not hasattr(self, 'submission_id'):
            self.log_test("Get Review", False, "No submission ID available")
            return False
            
        success, response = self.run_test(
            "Get Review",
            "GET",
            f"review/{self.submission_id}",
            200
        )
        return success

    def test_get_analytics(self):
        """Test getting analytics summary"""
        success, response = self.run_test(
            "Get Analytics Summary",
            "GET",
            "analytics/summary",
            200
        )
        return success

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        invalid_data = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        
        success, response = self.run_test(
            "Invalid Login (Should Fail)",
            "POST",
            "auth/login",
            401,
            data=invalid_data
        )
        return success

    def test_unauthorized_access(self):
        """Test accessing protected endpoint without token"""
        # Temporarily remove token
        temp_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Unauthorized Access (Should Fail)",
            "GET",
            "auth/me",
            401
        )
        
        # Restore token
        self.token = temp_token
        return success

def main():
    print("🚀 Starting CodeMentor AI Backend API Tests")
    print("=" * 50)
    
    tester = CodeMentorAPITester()
    
    # Test sequence
    tests = [
        ("Registration Flow", tester.test_user_registration),
        ("Login Flow", tester.test_user_login),
        ("Get Current User", tester.test_get_current_user),
        ("Code Submission", tester.test_code_submission),
        ("Get Submission History", tester.test_get_submission_history),
        ("Get Review", tester.test_get_review),
        ("Get Analytics", tester.test_get_analytics),
        ("Invalid Login", tester.test_invalid_login),
        ("Unauthorized Access", tester.test_unauthorized_access)
    ]
    
    for test_name, test_func in tests:
        print(f"\n🔍 Running {test_name}...")
        try:
            test_func()
        except Exception as e:
            tester.log_test(test_name, False, f"Exception during test: {str(e)}")
    
    # Print summary
    print("\n" + "=" * 50)
    print(f"📊 Test Summary: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed. Check the details above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())