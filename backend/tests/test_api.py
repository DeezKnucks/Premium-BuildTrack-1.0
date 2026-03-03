import pytest
import requests
import os
import uuid
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://workflow-engine-83.preview.emergentagent.com')


class TestHealthEndpoint:
    """Test health check endpoint"""
    
    def test_health_check_returns_200(self):
        """Health endpoint should return 200 OK"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
    def test_health_check_response_structure(self):
        """Health endpoint should return proper structure"""
        response = requests.get(f"{BASE_URL}/api/health")
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
        assert "service" in data
        assert data["service"] == "BuildTrack API"
        assert "version" in data
        assert "timestamp" in data


class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_login_with_valid_credentials(self):
        """Login with demo credentials should succeed"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@buildtrack.com",
            "password": "demo123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        
    def test_login_with_invalid_credentials(self):
        """Login with invalid credentials should fail"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        
    def test_login_response_contains_user_data(self):
        """Login should return user information"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@buildtrack.com",
            "password": "demo123"
        })
        data = response.json()
        user = data.get("user", {})
        assert "email" in user
        assert user["email"] == "demo@buildtrack.com"
        assert "full_name" in user
        
    def test_auth_me_without_token(self):
        """Auth me endpoint without token should fail"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code in [401, 403]


class TestProjectsEndpoints:
    """Test projects endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@buildtrack.com",
            "password": "demo123"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
        
    def test_get_projects_without_auth(self):
        """Get projects without auth should fail"""
        response = requests.get(f"{BASE_URL}/api/projects")
        assert response.status_code in [401, 403]
        
    def test_get_projects_with_auth(self, auth_token):
        """Get projects with auth should succeed"""
        response = requests.get(
            f"{BASE_URL}/api/projects",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
    def test_projects_response_structure(self, auth_token):
        """Projects should have proper structure"""
        response = requests.get(
            f"{BASE_URL}/api/projects",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        data = response.json()
        if len(data) > 0:
            project = data[0]
            assert "id" in project
            assert "name" in project
            assert "budget" in project
            assert "status" in project


class TestTasksEndpoints:
    """Test tasks endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@buildtrack.com",
            "password": "demo123"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
        
    def test_get_tasks_without_auth(self):
        """Get tasks without auth should fail"""
        response = requests.get(f"{BASE_URL}/api/tasks")
        assert response.status_code in [401, 403]
        
    def test_get_tasks_with_auth(self, auth_token):
        """Get tasks with auth should succeed"""
        response = requests.get(
            f"{BASE_URL}/api/tasks",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestDashboardEndpoint:
    """Test dashboard endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@buildtrack.com",
            "password": "demo123"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
        
    def test_get_dashboard_without_auth(self):
        """Dashboard without auth should fail"""
        response = requests.get(f"{BASE_URL}/api/dashboard")
        assert response.status_code in [401, 403]
        
    def test_get_dashboard_with_auth(self, auth_token):
        """Dashboard with auth should succeed"""
        response = requests.get(
            f"{BASE_URL}/api/dashboard",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        
    def test_dashboard_response_structure(self, auth_token):
        """Dashboard should have proper structure"""
        response = requests.get(
            f"{BASE_URL}/api/dashboard",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        data = response.json()
        assert "total_projects" in data
        assert "active_projects" in data
        assert "total_tasks" in data
        assert "completed_tasks" in data
        assert "budget_variance" in data


class TestAIEndpoints:
    """Test AI endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@buildtrack.com",
            "password": "demo123"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
        
    @pytest.fixture
    def project_id(self, auth_token):
        """Get a project ID for testing"""
        response = requests.get(
            f"{BASE_URL}/api/projects",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        if response.status_code == 200:
            projects = response.json()
            if len(projects) > 0:
                return projects[0]["id"]
        pytest.skip("No projects available for AI testing")
        
    def test_ai_risk_prediction_without_auth(self):
        """AI risk prediction without auth should fail"""
        response = requests.post(
            f"{BASE_URL}/api/ai/risk-prediction",
            json={"project_id": "test-project-id"}
        )
        assert response.status_code in [401, 403]
        
    def test_ai_risk_prediction_with_auth(self, auth_token, project_id):
        """AI risk prediction should succeed with valid project"""
        response = requests.post(
            f"{BASE_URL}/api/ai/risk-prediction",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"project_id": project_id}
        )
        # Note: This may take time due to AI processing
        assert response.status_code in [200, 404]  # 404 if no project found
        

class TestReportsEndpoints:
    """Test reports endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@buildtrack.com",
            "password": "demo123"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
        
    @pytest.fixture
    def project_id(self, auth_token):
        """Get a project ID for testing"""
        response = requests.get(
            f"{BASE_URL}/api/projects",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        if response.status_code == 200:
            projects = response.json()
            if len(projects) > 0:
                return projects[0]["id"]
        pytest.skip("No projects available for reports testing")
        
    def test_budget_report_without_auth(self):
        """Budget report without auth should fail"""
        response = requests.get(f"{BASE_URL}/api/reports/budget/test-id")
        assert response.status_code in [401, 403]
        
    def test_budget_report_with_auth(self, auth_token, project_id):
        """Budget report should succeed with valid project"""
        response = requests.get(
            f"{BASE_URL}/api/reports/budget/{project_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "project_name" in data
        assert "total_budget" in data
        
    def test_timeline_report_with_auth(self, auth_token, project_id):
        """Timeline report should succeed with valid project"""
        response = requests.get(
            f"{BASE_URL}/api/reports/timeline/{project_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "project_name" in data
        assert "milestones" in data


class TestFeedbackEndpoints:
    """Test feedback endpoints"""
    
    def test_contact_form_submission(self):
        """Contact form should accept submissions"""
        response = requests.post(
            f"{BASE_URL}/api/feedback/contact",
            json={
                "name": "Test User",
                "email": "test@example.com",
                "phone": "555-1234",
                "message": "Test message",
                "type": "General Inquiry"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "id" in data
        
    def test_feature_request_submission(self):
        """Feature request should accept submissions"""
        response = requests.post(
            f"{BASE_URL}/api/feedback/feature",
            json={
                "feature_request": "Test feature request"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "id" in data
