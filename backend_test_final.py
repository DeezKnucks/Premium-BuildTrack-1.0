#!/usr/bin/env python3
"""
Final comprehensive BuildTrack Backend API Test Suite
"""

import asyncio
import aiohttp
import json
from datetime import datetime, timedelta

BACKEND_URL = "https://buildwiz-4.preview.emergentagent.com/api"

class BuildTrackTester:
    def __init__(self):
        self.session = None
        self.auth_token = None
        self.test_project_id = None
        self.test_task_id = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def make_request(self, method: str, endpoint: str, data: dict = None):
        """Make authenticated request"""
        url = f"{BACKEND_URL}{endpoint}"
        headers = {}
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        
        try:
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response_text = await response.text()
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
            return {"status": 0, "data": {"error": str(e)}, "success": False}
    
    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"    {details}")
    
    async def test_complete_flow(self):
        """Test complete API flow"""
        print("🚀 BuildTrack Backend API Comprehensive Test")
        print("=" * 60)
        
        # 1. Authentication Flow
        print("\n=== AUTHENTICATION FLOW ===")
        
        # Register/Login
        login_data = {"email": "testpm@buildtrack.com", "password": "test123"}
        result = await self.make_request("POST", "/auth/login", login_data)
        
        if result["success"]:
            self.auth_token = result["data"].get("access_token")
            user = result["data"].get("user", {})
            self.log_result("Authentication", True, f"User: {user.get('full_name')} ({user.get('role')})")
        else:
            self.log_result("Authentication", False, f"Login failed: {result['data']}")
            return False
        
        # 2. Projects API
        print("\n=== PROJECTS API ===")
        
        # Create project
        project_data = {
            "name": "BuildTrack Test Project",
            "description": "Comprehensive API testing project",
            "budget": 100000.0,
            "start_date": datetime.now().isoformat(),
            "end_date": (datetime.now() + timedelta(days=30)).isoformat(),
            "status": "active",
            "location": {"lat": 40.7128, "lng": -74.0060, "address": "New York, NY"}
        }
        
        result = await self.make_request("POST", "/projects", project_data)
        if result["success"]:
            self.test_project_id = result["data"].get("id")
            self.log_result("Create Project", True, f"Project ID: {self.test_project_id}")
        else:
            self.log_result("Create Project", False, f"Error: {result['data']}")
            return False
        
        # List projects
        result = await self.make_request("GET", "/projects")
        if result["success"]:
            projects = result["data"]
            self.log_result("List Projects", True, f"Found {len(projects)} projects")
        else:
            self.log_result("List Projects", False, f"Error: {result['data']}")
        
        # Get specific project
        result = await self.make_request("GET", f"/projects/{self.test_project_id}")
        if result["success"]:
            project = result["data"]
            self.log_result("Get Project", True, f"Retrieved: {project.get('name')}")
        else:
            self.log_result("Get Project", False, f"Error: {result['data']}")
        
        # Update project
        update_data = {"completion_percentage": 25.0}
        result = await self.make_request("PUT", f"/projects/{self.test_project_id}", update_data)
        if result["success"]:
            self.log_result("Update Project", True, "Completion updated to 25%")
        else:
            self.log_result("Update Project", False, f"Error: {result['data']}")
        
        # 3. Tasks API
        print("\n=== TASKS API ===")
        
        # Create task
        task_data = {
            "title": "Foundation Work",
            "description": "Excavate and pour foundation",
            "project_id": self.test_project_id,
            "status": "in_progress",
            "priority": 5,
            "start_date": datetime.now().isoformat(),
            "end_date": (datetime.now() + timedelta(days=7)).isoformat(),
            "estimated_hours": 40.0
        }
        
        result = await self.make_request("POST", "/tasks", task_data)
        if result["success"]:
            self.test_task_id = result["data"].get("id")
            self.log_result("Create Task", True, f"Task ID: {self.test_task_id}")
        else:
            self.log_result("Create Task", False, f"Error: {result['data']}")
        
        # Get tasks for project
        result = await self.make_request("GET", f"/tasks?project_id={self.test_project_id}")
        if result["success"]:
            tasks = result["data"]
            self.log_result("Get Project Tasks", True, f"Found {len(tasks)} tasks")
        else:
            self.log_result("Get Project Tasks", False, f"Error: {result['data']}")
        
        # Update task
        if self.test_task_id:
            update_data = {"status": "completed", "actual_hours": 35.0}
            result = await self.make_request("PUT", f"/tasks/{self.test_task_id}", update_data)
            if result["success"]:
                self.log_result("Update Task", True, "Status updated to completed")
            else:
                self.log_result("Update Task", False, f"Error: {result['data']}")
        
        # 4. Budget API
        print("\n=== BUDGET API ===")
        
        # Create budget
        budget_data = {
            "project_id": self.test_project_id,
            "items": [
                {"category": "Materials", "planned_amount": 50000.0, "actual_amount": 45000.0},
                {"category": "Labor", "planned_amount": 30000.0, "actual_amount": 32000.0}
            ],
            "contingency": 10000.0
        }
        
        result = await self.make_request("POST", "/budgets", budget_data)
        if result["success"]:
            self.log_result("Create Budget", True, "Budget created successfully")
        else:
            self.log_result("Create Budget", False, f"Error: {result['data']}")
        
        # Get budget
        result = await self.make_request("GET", f"/budgets/{self.test_project_id}")
        if result["success"]:
            budget = result["data"]
            items_count = len(budget.get("items", []))
            self.log_result("Get Budget", True, f"Budget with {items_count} items")
        else:
            self.log_result("Get Budget", False, f"Error: {result['data']}")
        
        # 5. Dashboard API
        print("\n=== DASHBOARD API ===")
        
        result = await self.make_request("GET", "/dashboard")
        if result["success"]:
            stats = result["data"]
            self.log_result("Dashboard Stats", True, 
                          f"Projects: {stats.get('total_projects')}, Tasks: {stats.get('total_tasks')}")
        else:
            self.log_result("Dashboard Stats", False, f"Error: {result['data']}")
        
        # 6. Weather API
        print("\n=== WEATHER API ===")
        
        result = await self.make_request("GET", f"/weather/{self.test_project_id}")
        if result["success"]:
            weather = result["data"]
            if "error" in weather:
                self.log_result("Weather API", False, f"Weather service error: {weather['error']}")
            else:
                forecasts = len(weather.get("forecasts", []))
                self.log_result("Weather API", True, f"Retrieved {forecasts} forecasts")
        else:
            self.log_result("Weather API", False, f"Error: {result['data']}")
        
        # 7. AI Endpoints
        print("\n=== AI ENDPOINTS ===")
        
        # AI Risk Prediction
        risk_data = {"project_id": self.test_project_id}
        result = await self.make_request("POST", "/ai/risk-prediction", risk_data)
        if result["success"]:
            risk_result = result["data"]
            risk_score = risk_result.get("risk_score", 0)
            self.log_result("AI Risk Prediction", True, f"Risk Score: {risk_score}")
        else:
            self.log_result("AI Risk Prediction", False, f"Error: {result['data']}")
        
        # AI Budget Analysis
        budget_data = {"project_id": self.test_project_id}
        result = await self.make_request("POST", "/ai/budget-analysis", budget_data)
        if result["success"]:
            budget_result = result["data"]
            alerts = len(budget_result.get("alerts", []))
            self.log_result("AI Budget Analysis", True, f"Generated {alerts} alerts")
        else:
            self.log_result("AI Budget Analysis", False, f"Error: {result['data']}")
        
        # 8. Error Handling Tests
        print("\n=== ERROR HANDLING ===")
        
        # Test 401 without token
        old_token = self.auth_token
        self.auth_token = None
        result = await self.make_request("GET", "/projects")
        
        if result["status"] == 403:  # FastAPI returns 403 for missing auth
            self.log_result("401/403 Without Token", True, "Correctly rejected unauthorized request")
        else:
            self.log_result("401/403 Without Token", False, f"Expected 403, got {result['status']}")
        
        self.auth_token = old_token
        
        # Test 404 for missing resource
        result = await self.make_request("GET", "/projects/nonexistent-id")
        if result["status"] == 404:
            self.log_result("404 Missing Resource", True, "Correctly returned 404")
        else:
            self.log_result("404 Missing Resource", False, f"Expected 404, got {result['status']}")
        
        print("\n" + "=" * 60)
        print("🏁 BuildTrack Backend API Testing Complete")
        
        return True

async def main():
    """Run comprehensive tests"""
    async with BuildTrackTester() as tester:
        await tester.test_complete_flow()

if __name__ == "__main__":
    asyncio.run(main())