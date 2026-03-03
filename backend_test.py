#!/usr/bin/env python3
"""
BuildTrack Backend API Test Suite
Tests all priority endpoints systematically
"""

import asyncio
import aiohttp
import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

# Get backend URL from frontend .env
BACKEND_URL = "https://workflow-engine-83.preview.emergentagent.com/api"

class BuildTrackTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = None
        self.auth_token = None
        self.test_user_id = None
        self.test_project_id = None
        self.test_task_id = None
        self.test_budget_id = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> Dict[str, Any]:
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        
        # Add auth header if token exists
        if self.auth_token and headers is None:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
        elif self.auth_token and headers:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        
        try:
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response_text = await response.text()
                
                # Try to parse JSON
                try:
                    response_data = json.loads(response_text) if response_text else {}
                except json.JSONDecodeError:
                    response_data = {"raw_response": response_text}
                
                return {
                    "status": response.status,
                    "data": response_data,
                    "success": 200 <= response.status < 300
                }
        except Exception as e:
            return {
                "status": 0,
                "data": {"error": str(e)},
                "success": False
            }
    
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"    {details}")
        print()
    
    async def test_auth_flow(self) -> bool:
        """Test complete authentication flow"""
        print("=== TESTING AUTHENTICATION FLOW ===")
        
        # 1. Test user registration
        register_data = {
            "email": "testpm@buildtrack.com",
            "password": "test123",
            "full_name": "Test Project Manager",
            "role": "pm",
            "phone": "+1234567890",
            "company": "BuildTrack Test Co"
        }
        
        result = await self.make_request("POST", "/auth/register", register_data)
        
        if result["success"]:
            self.test_user_id = result["data"].get("id")
            self.log_test("User Registration", True, f"User ID: {self.test_user_id}")
        else:
            # User might already exist, try to continue
            if "already registered" in str(result["data"]):
                self.log_test("User Registration", True, "User already exists (continuing)")
            else:
                self.log_test("User Registration", False, f"Error: {result['data']}")
                return False
        
        # 2. Test user login
        login_data = {
            "email": "testpm@buildtrack.com",
            "password": "test123"
        }
        
        result = await self.make_request("POST", "/auth/login", login_data)
        
        if result["success"]:
            self.auth_token = result["data"].get("access_token")
            user_data = result["data"].get("user", {})
            self.test_user_id = user_data.get("id")
            self.log_test("User Login", True, f"Token received, User: {user_data.get('full_name')}")
        else:
            self.log_test("User Login", False, f"Error: {result['data']}")
            return False
        
        # 3. Test get current user
        result = await self.make_request("GET", "/auth/me")
        
        if result["success"]:
            user_info = result["data"]
            self.log_test("Get Current User", True, f"User: {user_info.get('full_name')} ({user_info.get('role')})")
        else:
            self.log_test("Get Current User", False, f"Error: {result['data']}")
            return False
        
        return True
    
    async def test_projects_api(self) -> bool:
        """Test Projects API endpoints"""
        print("=== TESTING PROJECTS API ===")
        
        # 1. Create a test project
        today = datetime.now()
        end_date = today + timedelta(days=30)
        
        project_data = {
            "name": "Test Construction Project",
            "description": "A comprehensive test project for BuildTrack",
            "budget": 100000.0,
            "start_date": today.isoformat(),
            "end_date": end_date.isoformat(),
            "status": "active",
            "location": {
                "lat": 40.7128,
                "lng": -74.0060,
                "address": "New York, NY"
            }
        }
        
        result = await self.make_request("POST", "/projects", project_data)
        
        if result["success"]:
            self.test_project_id = result["data"].get("id")
            self.log_test("Create Project", True, f"Project ID: {self.test_project_id}")
        else:
            self.log_test("Create Project", False, f"Error: {result['data']}")
            return False
        
        # 2. Get all projects
        result = await self.make_request("GET", "/projects")
        
        if result["success"]:
            projects = result["data"]
            self.log_test("Get All Projects", True, f"Found {len(projects)} projects")
        else:
            self.log_test("Get All Projects", False, f"Error: {result['data']}")
            return False
        
        # 3. Get specific project
        result = await self.make_request("GET", f"/projects/{self.test_project_id}")
        
        if result["success"]:
            project = result["data"]
            self.log_test("Get Specific Project", True, f"Project: {project.get('name')}")
        else:
            self.log_test("Get Specific Project", False, f"Error: {result['data']}")
            return False
        
        # 4. Update project completion
        update_data = {
            "completion_percentage": 25.0
        }
        
        result = await self.make_request("PUT", f"/projects/{self.test_project_id}", update_data)
        
        if result["success"]:
            updated_project = result["data"]
            completion = updated_project.get("completion_percentage")
            self.log_test("Update Project", True, f"Completion updated to {completion}%")
        else:
            self.log_test("Update Project", False, f"Error: {result['data']}")
            return False
        
        return True
    
    async def test_tasks_api(self) -> bool:
        """Test Tasks API endpoints"""
        print("=== TESTING TASKS API ===")
        
        if not self.test_project_id:
            self.log_test("Tasks API", False, "No project ID available")
            return False
        
        # 1. Create a test task
        task_data = {
            "title": "Foundation Excavation",
            "description": "Excavate foundation for main building",
            "project_id": self.test_project_id,
            "status": "in_progress",
            "priority": 5,
            "assigned_to": [self.test_user_id],
            "start_date": datetime.now().isoformat(),
            "end_date": (datetime.now() + timedelta(days=7)).isoformat(),
            "estimated_hours": 40.0
        }
        
        result = await self.make_request("POST", "/tasks", task_data)
        
        if result["success"]:
            self.test_task_id = result["data"].get("id")
            self.log_test("Create Task", True, f"Task ID: {self.test_task_id}")
        else:
            self.log_test("Create Task", False, f"Error: {result['data']}")
            return False
        
        # 2. Get tasks for project
        result = await self.make_request("GET", f"/tasks?project_id={self.test_project_id}")
        
        if result["success"]:
            tasks = result["data"]
            self.log_test("Get Project Tasks", True, f"Found {len(tasks)} tasks")
        else:
            self.log_test("Get Project Tasks", False, f"Error: {result['data']}")
            return False
        
        # 3. Update task status
        update_data = {
            "status": "completed",
            "actual_hours": 35.0
        }
        
        result = await self.make_request("PUT", f"/tasks/{self.test_task_id}", update_data)
        
        if result["success"]:
            updated_task = result["data"]
            status = updated_task.get("status")
            self.log_test("Update Task Status", True, f"Status updated to {status}")
        else:
            self.log_test("Update Task Status", False, f"Error: {result['data']}")
            return False
        
        return True
    
    async def test_budget_api(self) -> bool:
        """Test Budget API endpoints"""
        print("=== TESTING BUDGET API ===")
        
        if not self.test_project_id:
            self.log_test("Budget API", False, "No project ID available")
            return False
        
        # 1. Create budget for project
        budget_data = {
            "project_id": self.test_project_id,
            "items": [
                {
                    "category": "Materials",
                    "planned_amount": 50000.0,
                    "actual_amount": 45000.0,
                    "notes": "Concrete and steel"
                },
                {
                    "category": "Labor",
                    "planned_amount": 30000.0,
                    "actual_amount": 32000.0,
                    "notes": "Construction crew"
                }
            ],
            "contingency": 10000.0
        }
        
        result = await self.make_request("POST", "/budgets", budget_data)
        
        if result["success"]:
            self.test_budget_id = result["data"].get("id")
            self.log_test("Create Budget", True, f"Budget ID: {self.test_budget_id}")
        else:
            self.log_test("Create Budget", False, f"Error: {result['data']}")
            return False
        
        # 2. Get budget for project
        result = await self.make_request("GET", f"/budgets/{self.test_project_id}")
        
        if result["success"]:
            budget = result["data"]
            items_count = len(budget.get("items", []))
            self.log_test("Get Budget", True, f"Budget with {items_count} items")
        else:
            self.log_test("Get Budget", False, f"Error: {result['data']}")
            return False
        
        return True
    
    async def test_dashboard_api(self) -> bool:
        """Test Dashboard API"""
        print("=== TESTING DASHBOARD API ===")
        
        result = await self.make_request("GET", "/dashboard")
        
        if result["success"]:
            stats = result["data"]
            total_projects = stats.get("total_projects", 0)
            total_tasks = stats.get("total_tasks", 0)
            self.log_test("Dashboard Stats", True, f"Projects: {total_projects}, Tasks: {total_tasks}")
        else:
            self.log_test("Dashboard Stats", False, f"Error: {result['data']}")
            return False
        
        return True
    
    async def test_weather_api(self) -> bool:
        """Test Weather API"""
        print("=== TESTING WEATHER API ===")
        
        if not self.test_project_id:
            self.log_test("Weather API", False, "No project ID available")
            return False
        
        result = await self.make_request("GET", f"/weather/{self.test_project_id}")
        
        if result["success"]:
            weather = result["data"]
            if "error" in weather:
                self.log_test("Weather API", False, f"Weather service error: {weather['error']}")
                return False
            else:
                location = weather.get("location", "Unknown")
                forecasts = len(weather.get("forecasts", []))
                self.log_test("Weather Forecast", True, f"Location: {location}, Forecasts: {forecasts}")
        else:
            self.log_test("Weather API", False, f"Error: {result['data']}")
            return False
        
        return True
    
    async def test_ai_endpoints(self) -> bool:
        """Test AI endpoints for basic connectivity"""
        print("=== TESTING AI ENDPOINTS ===")
        
        if not self.test_project_id:
            self.log_test("AI Endpoints", False, "No project ID available")
            return False
        
        # 1. Test AI Risk Prediction
        risk_data = {"project_id": self.test_project_id}
        result = await self.make_request("POST", "/ai/risk-prediction", risk_data)
        
        if result["success"]:
            risk_result = result["data"]
            risk_score = risk_result.get("risk_score", 0)
            self.log_test("AI Risk Prediction", True, f"Risk Score: {risk_score}")
        else:
            self.log_test("AI Risk Prediction", False, f"Error: {result['data']}")
        
        # 2. Test AI Budget Analysis (need budget first)
        if self.test_budget_id:
            budget_data = {"project_id": self.test_project_id}
            result = await self.make_request("POST", "/ai/budget-analysis", budget_data)
            
            if result["success"]:
                budget_result = result["data"]
                alerts_count = len(budget_result.get("alerts", []))
                self.log_test("AI Budget Analysis", True, f"Generated {alerts_count} alerts")
            else:
                self.log_test("AI Budget Analysis", False, f"Error: {result['data']}")
        
        return True
    
    async def test_error_cases(self) -> bool:
        """Test error handling"""
        print("=== TESTING ERROR CASES ===")
        
        # 1. Test 401 without token
        old_token = self.auth_token
        self.auth_token = None
        
        result = await self.make_request("GET", "/projects")
        
        if result["status"] == 401:
            self.log_test("401 Without Token", True, "Correctly rejected unauthorized request")
        else:
            self.log_test("401 Without Token", False, f"Expected 401, got {result['status']}")
        
        # Restore token
        self.auth_token = old_token
        
        # 2. Test 404 for missing resource
        result = await self.make_request("GET", "/projects/nonexistent-id")
        
        if result["status"] == 404:
            self.log_test("404 Missing Resource", True, "Correctly returned 404 for missing project")
        else:
            self.log_test("404 Missing Resource", False, f"Expected 404, got {result['status']}")
        
        return True
    
    async def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🚀 Starting BuildTrack Backend API Tests")
        print("=" * 50)
        
        test_results = []
        
        # Run tests in sequence
        test_results.append(await self.test_auth_flow())
        test_results.append(await self.test_projects_api())
        test_results.append(await self.test_tasks_api())
        test_results.append(await self.test_budget_api())
        test_results.append(await self.test_dashboard_api())
        test_results.append(await self.test_weather_api())
        test_results.append(await self.test_ai_endpoints())
        test_results.append(await self.test_error_cases())
        
        # Summary
        passed = sum(test_results)
        total = len(test_results)
        
        print("=" * 50)
        print(f"🏁 TEST SUMMARY: {passed}/{total} test groups passed")
        
        if passed == total:
            print("🎉 ALL TESTS PASSED!")
        else:
            print("⚠️  Some tests failed - check details above")
        
        return passed == total

async def main():
    """Main test runner"""
    async with BuildTrackTester() as tester:
        success = await tester.run_all_tests()
        return success

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)