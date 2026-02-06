#!/usr/bin/env python3
"""
Detailed BuildTrack Backend API Test Suite
Tests specific issues found in initial testing
"""

import asyncio
import aiohttp
import json
import os
from datetime import datetime, timedelta

# Get backend URL from frontend .env
BACKEND_URL = "https://fieldmaster-app-3.preview.emergentagent.com/api"

async def test_auth_without_token():
    """Test authentication without token"""
    print("=== TESTING AUTH WITHOUT TOKEN ===")
    
    async with aiohttp.ClientSession() as session:
        # Test without any headers
        try:
            async with session.get(f"{BACKEND_URL}/projects") as response:
                print(f"Status without token: {response.status}")
                text = await response.text()
                print(f"Response: {text[:200]}")
        except Exception as e:
            print(f"Error: {e}")
        
        # Test with invalid token
        try:
            headers = {"Authorization": "Bearer invalid_token"}
            async with session.get(f"{BACKEND_URL}/projects", headers=headers) as response:
                print(f"Status with invalid token: {response.status}")
                text = await response.text()
                print(f"Response: {text[:200]}")
        except Exception as e:
            print(f"Error: {e}")

async def test_weather_api_detailed():
    """Test weather API with detailed error checking"""
    print("=== TESTING WEATHER API DETAILED ===")
    
    # First login to get token
    async with aiohttp.ClientSession() as session:
        login_data = {
            "email": "testpm@buildtrack.com",
            "password": "test123"
        }
        
        async with session.post(f"{BACKEND_URL}/auth/login", json=login_data) as response:
            if response.status == 200:
                login_result = await response.json()
                token = login_result.get("access_token")
                print(f"✅ Login successful, token: {token[:20]}...")
                
                # Create a project with location
                project_data = {
                    "name": "Weather Test Project",
                    "budget": 50000.0,
                    "start_date": datetime.now().isoformat(),
                    "end_date": (datetime.now() + timedelta(days=30)).isoformat(),
                    "location": {
                        "lat": 40.7128,
                        "lng": -74.0060,
                        "address": "New York, NY"
                    }
                }
                
                headers = {"Authorization": f"Bearer {token}"}
                async with session.post(f"{BACKEND_URL}/projects", json=project_data, headers=headers) as response:
                    if response.status == 201:
                        project = await response.json()
                        project_id = project.get("id")
                        print(f"✅ Project created: {project_id}")
                        
                        # Test weather API
                        async with session.get(f"{BACKEND_URL}/weather/{project_id}", headers=headers) as response:
                            weather_result = await response.json()
                            print(f"Weather API Status: {response.status}")
                            print(f"Weather Response: {json.dumps(weather_result, indent=2)}")
                    else:
                        print(f"❌ Project creation failed: {response.status}")
            else:
                print(f"❌ Login failed: {response.status}")

async def test_ai_service_detailed():
    """Test AI service with detailed error checking"""
    print("=== TESTING AI SERVICE DETAILED ===")
    
    # First login to get token
    async with aiohttp.ClientSession() as session:
        login_data = {
            "email": "testpm@buildtrack.com",
            "password": "test123"
        }
        
        async with session.post(f"{BACKEND_URL}/auth/login", json=login_data) as response:
            if response.status == 200:
                login_result = await response.json()
                token = login_result.get("access_token")
                
                # Get existing project
                headers = {"Authorization": f"Bearer {token}"}
                async with session.get(f"{BACKEND_URL}/projects", headers=headers) as response:
                    if response.status == 200:
                        projects = await response.json()
                        if projects:
                            project_id = projects[0]["id"]
                            print(f"✅ Using project: {project_id}")
                            
                            # Test AI Risk Prediction
                            risk_data = {"project_id": project_id}
                            async with session.post(f"{BACKEND_URL}/ai/risk-prediction", json=risk_data, headers=headers) as response:
                                risk_result = await response.json()
                                print(f"AI Risk Status: {response.status}")
                                print(f"AI Risk Response: {json.dumps(risk_result, indent=2)}")

async def test_backend_health():
    """Test backend health and basic connectivity"""
    print("=== TESTING BACKEND HEALTH ===")
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"{BACKEND_URL}/") as response:
                result = await response.json()
                print(f"Backend Health Status: {response.status}")
                print(f"Backend Response: {json.dumps(result, indent=2)}")
        except Exception as e:
            print(f"Backend Health Error: {e}")

async def main():
    """Run detailed tests"""
    print("🔍 Running Detailed BuildTrack Backend Tests")
    print("=" * 50)
    
    await test_backend_health()
    await test_auth_without_token()
    await test_weather_api_detailed()
    await test_ai_service_detailed()

if __name__ == "__main__":
    asyncio.run(main())