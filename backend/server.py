from fastapi import FastAPI, APIRouter, HTTPException, Depends, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
from datetime import datetime, timedelta
from typing import List, Optional
import uuid
import aiohttp
from bson import ObjectId

# Import models and services
from models import *
from auth import *
from ai_service import ai_service

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Collections
users_collection = db.users
projects_collection = db.projects
tasks_collection = db.tasks
media_collection = db.media
budgets_collection = db.budgets
vendors_collection = db.vendors
alerts_collection = db.alerts
chat_rooms_collection = db.chat_rooms
messages_collection = db.messages
subscriptions_collection = db.subscriptions
expenses_collection = db.expenses
invoices_collection = db.invoices

# Create app
app = FastAPI(title="BuildTrack API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Helper functions
def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable format"""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
    if isinstance(doc, dict):
        doc = dict(doc)
        if '_id' in doc:
            doc['id'] = str(doc['_id'])
            del doc['_id']
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                doc[key] = str(value)
            elif isinstance(value, datetime):
                doc[key] = value.isoformat()
            elif isinstance(value, dict) or isinstance(value, list):
                doc[key] = serialize_doc(value)
        return doc
    return doc

# Weather Service
async def get_weather_forecast(lat: float, lng: float) -> dict:
    """Fetch weather forecast from OpenWeatherMap"""
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        return {"error": "Weather API key not configured"}
    
    url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lng}&appid={api_key}&units=imperial"
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "location": data.get("city", {}).get("name", "Unknown"),
                        "forecasts": [
                            {
                                "date": item["dt_txt"],
                                "temp": item["main"]["temp"],
                                "description": item["weather"][0]["description"],
                                "rain_probability": item.get("pop", 0) * 100
                            }
                            for item in data.get("list", [])[:10]  # Next 10 periods
                        ]
                    }
                else:
                    return {"error": "Failed to fetch weather data"}
    except Exception as e:
        logger.error(f"Weather API error: {str(e)}")
        return {"error": str(e)}

# ============ HEALTH ENDPOINT ============

@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "BuildTrack API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

# ============ AUTH ENDPOINTS ============

@api_router.post("/auth/register", response_model=User)
async def register(user_data: UserCreate):
    """Register a new user"""
    # Check if user exists
    existing = await users_collection.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user
    user_dict = user_data.dict()
    del user_dict['password']
    user_dict['hashed_password'] = hashed_password
    user_dict['id'] = str(uuid.uuid4())
    user_dict['created_at'] = datetime.utcnow()
    user_dict['is_active'] = True
    
    await users_collection.insert_one(user_dict)
    
    return User(**user_dict)

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    """Login and get access token"""
    user = await users_collection.find_one({"email": credentials.email})
    
    if not user or not verify_password(credentials.password, user['hashed_password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user.get('is_active'):
        raise HTTPException(status_code=403, detail="Account is inactive")
    
    # Create access token
    token_data = {
        "user_id": user['id'],
        "email": user['email'],
        "role": user['role']
    }
    token = create_access_token(token_data)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": serialize_doc(user)
    }

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    user = await users_collection.find_one({"id": current_user['user_id']})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**serialize_doc(user))

# ============ PROJECT ENDPOINTS ============

@api_router.post("/projects", response_model=Project)
async def create_project(project: ProjectCreate, current_user: dict = Depends(get_current_user)):
    """Create a new project"""
    project_dict = project.dict()
    project_dict['id'] = str(uuid.uuid4())
    project_dict['owner_id'] = current_user['user_id']
    project_dict['team_members'] = [current_user['user_id']]
    project_dict['created_at'] = datetime.utcnow()
    project_dict['updated_at'] = datetime.utcnow()
    project_dict['actual_cost'] = 0.0
    project_dict['completion_percentage'] = 0.0
    
    await projects_collection.insert_one(project_dict)
    return Project(**project_dict)

@api_router.get("/projects", response_model=List[Project])
async def get_projects(current_user: dict = Depends(get_current_user)):
    """Get all projects for current user"""
    # Users can see projects they own or are team members of
    projects = await projects_collection.find({
        "$or": [
            {"owner_id": current_user['user_id']},
            {"team_members": current_user['user_id']}
        ]
    }).to_list(1000)
    
    return [Project(**serialize_doc(p)) for p in projects]

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific project"""
    project = await projects_collection.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check access
    if current_user['user_id'] not in [project['owner_id']] + project.get('team_members', []):
        raise HTTPException(status_code=403, detail="Access denied")
    
    return Project(**serialize_doc(project))

@api_router.put("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, updates: ProjectUpdate, current_user: dict = Depends(get_current_user)):
    """Update a project"""
    project = await projects_collection.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check permissions (owner or admin)
    if project['owner_id'] != current_user['user_id'] and current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    update_dict = {k: v for k, v in updates.dict(exclude_unset=True).items() if v is not None}
    update_dict['updated_at'] = datetime.utcnow()
    
    await projects_collection.update_one({"id": project_id}, {"$set": update_dict})
    
    updated_project = await projects_collection.find_one({"id": project_id})
    return Project(**serialize_doc(updated_project))

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a project (admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await projects_collection.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Also delete related data
    await tasks_collection.delete_many({"project_id": project_id})
    await media_collection.delete_many({"project_id": project_id})
    await budgets_collection.delete_many({"project_id": project_id})
    
    return {"message": "Project deleted successfully"}

# ============ TASK ENDPOINTS ============

@api_router.post("/tasks", response_model=Task)
async def create_task(task: TaskCreate, current_user: dict = Depends(get_current_user)):
    """Create a new task"""
    task_dict = task.dict()
    task_dict['id'] = str(uuid.uuid4())
    task_dict['created_by'] = current_user['user_id']
    task_dict['created_at'] = datetime.utcnow()
    task_dict['updated_at'] = datetime.utcnow()
    task_dict['checklist'] = []
    task_dict['dependencies'] = []
    
    await tasks_collection.insert_one(task_dict)
    return Task(**task_dict)

@api_router.get("/tasks", response_model=List[Task])
async def get_tasks(project_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Get tasks (optionally filtered by project)"""
    query = {}
    if project_id:
        query['project_id'] = project_id
    
    tasks = await tasks_collection.find(query).to_list(1000)
    return [Task(**serialize_doc(t)) for t in tasks]

@api_router.get("/tasks/{task_id}", response_model=Task)
async def get_task(task_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific task"""
    task = await tasks_collection.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return Task(**serialize_doc(task))

@api_router.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, updates: TaskUpdate, current_user: dict = Depends(get_current_user)):
    """Update a task"""
    update_dict = {k: v for k, v in updates.dict(exclude_unset=True).items() if v is not None}
    update_dict['updated_at'] = datetime.utcnow()
    
    result = await tasks_collection.update_one({"id": task_id}, {"$set": update_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    updated_task = await tasks_collection.find_one({"id": task_id})
    return Task(**serialize_doc(updated_task))

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a task"""
    result = await tasks_collection.delete_one({"id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}

# ============ MEDIA ENDPOINTS ============

@api_router.post("/media", response_model=Media)
async def upload_media(media: MediaCreate, current_user: dict = Depends(get_current_user)):
    """Upload media (photo/video/document)"""
    media_dict = media.dict()
    media_dict['id'] = str(uuid.uuid4())
    media_dict['uploaded_by'] = current_user['user_id']
    media_dict['uploaded_at'] = datetime.utcnow()
    
    await media_collection.insert_one(media_dict)
    return Media(**media_dict)

@api_router.get("/media", response_model=List[Media])
async def get_media(project_id: Optional[str] = None, task_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Get media (filtered by project or task)"""
    query = {}
    if project_id:
        query['project_id'] = project_id
    if task_id:
        query['task_id'] = task_id
    
    media_items = await media_collection.find(query).sort("uploaded_at", -1).to_list(1000)
    return [Media(**serialize_doc(m)) for m in media_items]

@api_router.get("/media/{media_id}", response_model=Media)
async def get_media_item(media_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific media item"""
    media = await media_collection.find_one({"id": media_id})
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    return Media(**serialize_doc(media))

@api_router.delete("/media/{media_id}")
async def delete_media(media_id: str, current_user: dict = Depends(get_current_user)):
    """Delete media"""
    media = await media_collection.find_one({"id": media_id})
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    
    # Check if user owns it or is admin
    if media['uploaded_by'] != current_user['user_id'] and current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Access denied")
    
    await media_collection.delete_one({"id": media_id})
    return {"message": "Media deleted successfully"}

# ============ BUDGET ENDPOINTS ============

@api_router.post("/budgets", response_model=Budget)
async def create_budget(budget: BudgetCreate, current_user: dict = Depends(get_current_user)):
    """Create budget for a project"""
    budget_dict = budget.dict()
    budget_dict['id'] = str(uuid.uuid4())
    budget_dict['created_at'] = datetime.utcnow()
    budget_dict['updated_at'] = datetime.utcnow()
    
    await budgets_collection.insert_one(budget_dict)
    return Budget(**budget_dict)

@api_router.get("/budgets/{project_id}", response_model=Budget)
async def get_budget(project_id: str, current_user: dict = Depends(get_current_user)):
    """Get budget for a project"""
    budget = await budgets_collection.find_one({"project_id": project_id})
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    return Budget(**serialize_doc(budget))

@api_router.put("/budgets/{project_id}", response_model=Budget)
async def update_budget(project_id: str, budget: BudgetBase, current_user: dict = Depends(get_current_user)):
    """Update budget"""
    budget_dict = budget.dict()
    budget_dict['updated_at'] = datetime.utcnow()
    
    result = await budgets_collection.update_one(
        {"project_id": project_id},
        {"$set": budget_dict},
        upsert=True
    )
    
    updated_budget = await budgets_collection.find_one({"project_id": project_id})
    return Budget(**serialize_doc(updated_budget))

# ============ VENDOR ENDPOINTS ============

@api_router.post("/vendors", response_model=Vendor)
async def create_vendor(vendor: VendorCreate, current_user: dict = Depends(get_current_user)):
    """Create a vendor profile"""
    vendor_dict = vendor.dict()
    vendor_dict['id'] = str(uuid.uuid4())
    vendor_dict['created_at'] = datetime.utcnow()
    
    await vendors_collection.insert_one(vendor_dict)
    return Vendor(**vendor_dict)

@api_router.get("/vendors", response_model=List[Vendor])
async def get_vendors(service: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Get all vendors, optionally filtered by service"""
    query = {}
    if service:
        query['services'] = service
    
    vendors = await vendors_collection.find(query).sort("rating", -1).to_list(1000)
    return [Vendor(**serialize_doc(v)) for v in vendors]

@api_router.get("/vendors/{vendor_id}", response_model=Vendor)
async def get_vendor(vendor_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific vendor"""
    vendor = await vendors_collection.find_one({"id": vendor_id})
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return Vendor(**serialize_doc(vendor))

# ============ ALERT ENDPOINTS ============

@api_router.post("/alerts", response_model=Alert)
async def create_alert(alert: AlertCreate, current_user: dict = Depends(get_current_user)):
    """Create an alert"""
    alert_dict = alert.dict()
    alert_dict['id'] = str(uuid.uuid4())
    alert_dict['created_at'] = datetime.utcnow()
    alert_dict['is_read'] = False
    alert_dict['is_resolved'] = False
    
    await alerts_collection.insert_one(alert_dict)
    return Alert(**alert_dict)

@api_router.get("/alerts", response_model=List[Alert])
async def get_alerts(project_id: Optional[str] = None, unread_only: bool = False, current_user: dict = Depends(get_current_user)):
    """Get alerts"""
    query = {}
    if project_id:
        query['project_id'] = project_id
    if unread_only:
        query['is_read'] = False
    
    alerts = await alerts_collection.find(query).sort("created_at", -1).to_list(1000)
    return [Alert(**serialize_doc(a)) for a in alerts]

@api_router.put("/alerts/{alert_id}/read")
async def mark_alert_read(alert_id: str, current_user: dict = Depends(get_current_user)):
    """Mark alert as read"""
    result = await alerts_collection.update_one(
        {"id": alert_id},
        {"$set": {"is_read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert marked as read"}

# ============ CHAT ENDPOINTS ============

@api_router.post("/chat/rooms")
async def create_chat_room(room_data: dict, current_user: dict = Depends(get_current_user)):
    """Create a chat room"""
    room = {
        "id": str(uuid.uuid4()),
        "project_id": room_data.get("project_id"),
        "name": room_data.get("name"),
        "members": room_data.get("members", [current_user['user_id']]),
        "created_at": datetime.utcnow()
    }
    
    await chat_rooms_collection.insert_one(room)
    return serialize_doc(room)

@api_router.get("/chat/rooms")
async def get_chat_rooms(project_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Get chat rooms for user"""
    query = {"members": current_user['user_id']}
    if project_id:
        query['project_id'] = project_id
    
    rooms = await chat_rooms_collection.find(query).to_list(1000)
    return [serialize_doc(r) for r in rooms]

@api_router.post("/chat/messages", response_model=Message)
async def send_message(message: MessageCreate, current_user: dict = Depends(get_current_user)):
    """Send a chat message"""
    user = await users_collection.find_one({"id": current_user['user_id']})
    
    message_dict = message.dict()
    message_dict['id'] = str(uuid.uuid4())
    message_dict['sender_id'] = current_user['user_id']
    message_dict['sender_name'] = user.get('full_name', 'Unknown')
    message_dict['sent_at'] = datetime.utcnow()
    
    await messages_collection.insert_one(message_dict)
    return Message(**message_dict)

@api_router.get("/chat/messages/{room_id}", response_model=List[Message])
async def get_messages(room_id: str, limit: int = 100, current_user: dict = Depends(get_current_user)):
    """Get messages for a room"""
    messages = await messages_collection.find({"room_id": room_id}).sort("sent_at", -1).limit(limit).to_list(limit)
    return [Message(**serialize_doc(m)) for m in reversed(messages)]

# ============ AI ENDPOINTS ============

@api_router.post("/ai/risk-prediction")
async def predict_risks(request: AIRiskRequest, current_user: dict = Depends(get_current_user)):
    """AI Risk Engine: Predict project risks"""
    project = await projects_collection.find_one({"id": request.project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get weather data if location available
    weather_data = {}
    if project.get('location'):
        loc = project['location']
        weather_data = await get_weather_forecast(loc.get('lat', 0), loc.get('lng', 0))
    
    # Call AI service
    result = await ai_service.predict_risks(serialize_doc(project), weather_data)
    
    # Create alert if high risk
    if result.get('risk_score', 0) > 70:
        await create_alert(AlertCreate(
            project_id=request.project_id,
            alert_type=AlertType.RISK_PREDICTION,
            severity="high",
            title="High Risk Detected",
            message=f"AI detected high risk score: {result['risk_score']}/100",
            data=result
        ), current_user)
    
    return result

@api_router.post("/ai/budget-analysis")
async def analyze_budget(request: AIBudgetRequest, current_user: dict = Depends(get_current_user)):
    """AI Budget Guardian: Analyze budget"""
    project = await projects_collection.find_one({"id": request.project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    budget = await budgets_collection.find_one({"project_id": request.project_id})
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    result = await ai_service.analyze_budget(serialize_doc(budget), serialize_doc(project))
    
    # Create alerts for high severity issues
    for alert_data in result.get('alerts', []):
        if alert_data.get('severity') == 'high':
            await create_alert(AlertCreate(
                project_id=request.project_id,
                alert_type=AlertType.BUDGET_VARIANCE,
                severity="high",
                title=f"Budget Alert: {alert_data.get('category')}",
                message=alert_data.get('message'),
                data=alert_data
            ), current_user)
    
    return result

@api_router.post("/ai/schedule-optimization")
async def optimize_schedule(request: AIScheduleRequest, current_user: dict = Depends(get_current_user)):
    """AI Schedule Optimizer"""
    project = await projects_collection.find_one({"id": request.project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    tasks = await tasks_collection.find({"project_id": request.project_id}).to_list(1000)
    
    weather_data = {}
    if project.get('location'):
        loc = project['location']
        weather_data = await get_weather_forecast(loc.get('lat', 0), loc.get('lng', 0))
    
    result = await ai_service.optimize_schedule(
        [serialize_doc(t) for t in tasks],
        weather_data
    )
    
    return result

@api_router.post("/ai/transcribe")
async def transcribe_voice(request: VoiceTranscriptionRequest, current_user: dict = Depends(get_current_user)):
    """Transcribe voice notes"""
    result = await ai_service.transcribe_voice(request.audio_data)
    return result

@api_router.post("/ai/compliance-check")
async def check_compliance(project_id: str, current_user: dict = Depends(get_current_user)):
    """AI Compliance Bot"""
    project = await projects_collection.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get vendor compliance docs
    vendors = await vendors_collection.find({}).to_list(1000)
    all_docs = []
    for v in vendors:
        all_docs.extend(v.get('compliance_docs', []))
    
    result = await ai_service.check_compliance(serialize_doc(project), all_docs)
    
    # Create alert if not compliant
    if not result.get('compliant', True):
        await create_alert(AlertCreate(
            project_id=project_id,
            alert_type=AlertType.COMPLIANCE_ISSUE,
            severity="high",
            title="Compliance Issues Detected",
            message=f"Missing documents: {', '.join(result.get('missing_documents', []))}",
            data=result
        ), current_user)
    
    return result

@api_router.post("/ai/vendor-scout")
async def scout_vendors(requirements: dict, current_user: dict = Depends(get_current_user)):
    """AI Vendor Scout"""
    result = await ai_service.scout_vendors(requirements)
    return {"recommended_vendors": result}

# ============ REPORTS ENDPOINTS ============

@api_router.get("/reports/budget/{project_id}")
async def get_budget_report(project_id: str, current_user: dict = Depends(get_current_user)):
    """Generate detailed budget report for a project"""
    project = await projects_collection.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    tasks = await tasks_collection.find({"project_id": project_id}).to_list(1000)
    
    # Calculate budget breakdown by category
    total_budget = project.get('budget', 0)
    spent = sum(t.get('actual_cost', 0) for t in tasks)
    
    categories = {
        "Labor": {"budget": total_budget * 0.4, "spent": spent * 0.35, "items": []},
        "Materials": {"budget": total_budget * 0.35, "spent": spent * 0.40, "items": []},
        "Equipment": {"budget": total_budget * 0.15, "spent": spent * 0.15, "items": []},
        "Permits & Fees": {"budget": total_budget * 0.05, "spent": spent * 0.05, "items": []},
        "Contingency": {"budget": total_budget * 0.05, "spent": spent * 0.05, "items": []}
    }
    
    # Monthly spending trend (mock data)
    monthly_trend = [
        {"month": "Jan", "planned": total_budget * 0.1, "actual": spent * 0.08},
        {"month": "Feb", "planned": total_budget * 0.15, "actual": spent * 0.12},
        {"month": "Mar", "planned": total_budget * 0.2, "actual": spent * 0.18},
        {"month": "Apr", "planned": total_budget * 0.25, "actual": spent * 0.22},
        {"month": "May", "planned": total_budget * 0.3, "actual": spent * 0.28},
    ]
    
    return {
        "project_name": project.get('name'),
        "total_budget": total_budget,
        "total_spent": spent,
        "remaining": total_budget - spent,
        "variance_percentage": ((spent - total_budget) / total_budget * 100) if total_budget > 0 else 0,
        "categories": categories,
        "monthly_trend": monthly_trend,
        "forecast": {
            "projected_total": spent * 1.2,
            "projected_variance": ((spent * 1.2) - total_budget) / total_budget * 100 if total_budget > 0 else 0,
            "recommendation": "On track" if spent <= total_budget else "Review spending in Materials category"
        },
        "generated_at": datetime.utcnow().isoformat()
    }

@api_router.get("/reports/timeline/{project_id}")
async def get_timeline_report(project_id: str, current_user: dict = Depends(get_current_user)):
    """Generate timeline/schedule report for a project"""
    project = await projects_collection.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    tasks = await tasks_collection.find({"project_id": project_id}).to_list(1000)
    
    completed = len([t for t in tasks if t.get('status') == 'completed'])
    in_progress = len([t for t in tasks if t.get('status') == 'in_progress'])
    pending = len([t for t in tasks if t.get('status') == 'pending'])
    blocked = len([t for t in tasks if t.get('status') == 'blocked'])
    
    start_date = datetime.fromisoformat(project.get('start_date', datetime.utcnow().isoformat()).replace('Z', ''))
    end_date = datetime.fromisoformat(project.get('end_date', (datetime.utcnow() + timedelta(days=90)).isoformat()).replace('Z', ''))
    
    total_days = (end_date - start_date).days
    elapsed_days = (datetime.utcnow() - start_date).days
    progress = (elapsed_days / total_days * 100) if total_days > 0 else 0
    
    # Milestones
    milestones = [
        {"name": "Project Kickoff", "date": start_date.isoformat(), "status": "completed"},
        {"name": "Foundation Complete", "date": (start_date + timedelta(days=int(total_days*0.2))).isoformat(), "status": "completed" if progress > 20 else "pending"},
        {"name": "Structural Framework", "date": (start_date + timedelta(days=int(total_days*0.4))).isoformat(), "status": "completed" if progress > 40 else "in_progress" if progress > 30 else "pending"},
        {"name": "MEP Installation", "date": (start_date + timedelta(days=int(total_days*0.6))).isoformat(), "status": "completed" if progress > 60 else "pending"},
        {"name": "Interior Finishing", "date": (start_date + timedelta(days=int(total_days*0.8))).isoformat(), "status": "pending"},
        {"name": "Final Inspection", "date": end_date.isoformat(), "status": "pending"},
    ]
    
    return {
        "project_name": project.get('name'),
        "start_date": project.get('start_date'),
        "end_date": project.get('end_date'),
        "total_days": total_days,
        "elapsed_days": elapsed_days,
        "remaining_days": total_days - elapsed_days,
        "schedule_progress": min(progress, 100),
        "task_summary": {
            "total": len(tasks),
            "completed": completed,
            "in_progress": in_progress,
            "pending": pending,
            "blocked": blocked
        },
        "milestones": milestones,
        "on_schedule": progress <= (completed / len(tasks) * 100) if tasks else True,
        "projected_completion": (start_date + timedelta(days=int(total_days * 1.1))).isoformat() if blocked > 0 else end_date.isoformat(),
        "generated_at": datetime.utcnow().isoformat()
    }

@api_router.get("/reports/team/{project_id}")
async def get_team_report(project_id: str, current_user: dict = Depends(get_current_user)):
    """Generate team productivity report"""
    project = await projects_collection.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    tasks = await tasks_collection.find({"project_id": project_id}).to_list(1000)
    team_members = project.get('team_members', [])
    
    # Get team member details
    team_stats = []
    for member_id in team_members[:10]:  # Limit to 10 members
        user = await users_collection.find_one({"id": member_id})
        if user:
            member_tasks = [t for t in tasks if member_id in t.get('assigned_to', [])]
            completed_tasks = len([t for t in member_tasks if t.get('status') == 'completed'])
            team_stats.append({
                "id": member_id,
                "name": user.get('full_name', 'Unknown'),
                "role": user.get('role', 'crew'),
                "tasks_assigned": len(member_tasks),
                "tasks_completed": completed_tasks,
                "completion_rate": (completed_tasks / len(member_tasks) * 100) if member_tasks else 0,
                "hours_logged": len(member_tasks) * 8,  # Mock hours
                "productivity_score": min(100, (completed_tasks / max(len(member_tasks), 1)) * 100 + 20)
            })
    
    return {
        "project_name": project.get('name'),
        "total_team_members": len(team_members),
        "team_stats": team_stats,
        "overall_productivity": sum(m['productivity_score'] for m in team_stats) / len(team_stats) if team_stats else 0,
        "total_hours_logged": sum(m['hours_logged'] for m in team_stats),
        "top_performers": sorted(team_stats, key=lambda x: x['productivity_score'], reverse=True)[:3],
        "generated_at": datetime.utcnow().isoformat()
    }

@api_router.get("/reports/materials/{project_id}")
async def get_materials_report(project_id: str, current_user: dict = Depends(get_current_user)):
    """Generate materials/inventory report"""
    project = await projects_collection.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    budget = project.get('budget', 100000)
    
    # Mock materials data
    materials = [
        {"name": "Concrete (cubic yards)", "ordered": 500, "delivered": 450, "used": 400, "unit_cost": 150, "status": "in_stock"},
        {"name": "Rebar (tons)", "ordered": 50, "delivered": 45, "used": 40, "unit_cost": 800, "status": "in_stock"},
        {"name": "Lumber (board feet)", "ordered": 10000, "delivered": 8000, "used": 7500, "unit_cost": 3, "status": "low_stock"},
        {"name": "Electrical Wire (feet)", "ordered": 5000, "delivered": 5000, "used": 3500, "unit_cost": 2, "status": "in_stock"},
        {"name": "Plumbing Pipes (feet)", "ordered": 2000, "delivered": 2000, "used": 1800, "unit_cost": 5, "status": "in_stock"},
        {"name": "Drywall (sheets)", "ordered": 500, "delivered": 300, "used": 200, "unit_cost": 15, "status": "pending_delivery"},
        {"name": "Roofing Materials (sq ft)", "ordered": 3000, "delivered": 0, "used": 0, "unit_cost": 4, "status": "ordered"},
    ]
    
    total_cost = sum(m['used'] * m['unit_cost'] for m in materials)
    
    return {
        "project_name": project.get('name'),
        "materials": materials,
        "summary": {
            "total_items": len(materials),
            "in_stock": len([m for m in materials if m['status'] == 'in_stock']),
            "low_stock": len([m for m in materials if m['status'] == 'low_stock']),
            "pending": len([m for m in materials if m['status'] in ['pending_delivery', 'ordered']])
        },
        "total_materials_cost": total_cost,
        "budget_allocation": budget * 0.35,
        "variance": total_cost - (budget * 0.35),
        "alerts": [
            {"item": "Lumber", "message": "Stock running low - reorder recommended", "severity": "warning"},
            {"item": "Drywall", "message": "Delivery pending - ETA 3 days", "severity": "info"}
        ],
        "generated_at": datetime.utcnow().isoformat()
    }

@api_router.get("/reports/safety/{project_id}")
async def get_safety_report(project_id: str, current_user: dict = Depends(get_current_user)):
    """Generate safety/incident report"""
    project = await projects_collection.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Mock safety data
    return {
        "project_name": project.get('name'),
        "reporting_period": "Last 30 days",
        "incident_summary": {
            "total_incidents": 3,
            "near_misses": 5,
            "first_aid_cases": 2,
            "recordable_incidents": 1,
            "lost_time_incidents": 0
        },
        "incidents": [
            {"date": "2025-01-15", "type": "Near Miss", "description": "Unsecured ladder reported", "severity": "low", "status": "resolved"},
            {"date": "2025-01-20", "type": "First Aid", "description": "Minor cut from material handling", "severity": "low", "status": "resolved"},
            {"date": "2025-01-25", "type": "Near Miss", "description": "Tool dropped from height", "severity": "medium", "status": "under_review"}
        ],
        "safety_metrics": {
            "days_without_incident": 12,
            "safety_training_completion": 95,
            "ppe_compliance": 98,
            "safety_inspection_score": 92
        },
        "compliance_status": {
            "osha_compliant": True,
            "last_inspection_date": "2025-01-10",
            "next_inspection_due": "2025-04-10",
            "open_citations": 0
        },
        "recommendations": [
            "Schedule refresher training on ladder safety",
            "Review material handling procedures",
            "Conduct tool tethering awareness session"
        ],
        "generated_at": datetime.utcnow().isoformat()
    }

@api_router.get("/reports/sustainability/{project_id}")
async def get_sustainability_report(project_id: str, current_user: dict = Depends(get_current_user)):
    """Generate sustainability/environmental report"""
    project = await projects_collection.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {
        "project_name": project.get('name'),
        "environmental_metrics": {
            "carbon_footprint_tons": 125.5,
            "energy_usage_kwh": 45000,
            "water_usage_gallons": 125000,
            "waste_generated_tons": 85,
            "waste_diverted_percentage": 72
        },
        "certifications": {
            "leed_target": "Gold",
            "current_points": 52,
            "required_points": 60,
            "categories": [
                {"name": "Energy & Atmosphere", "points": 18, "max": 33},
                {"name": "Water Efficiency", "points": 8, "max": 10},
                {"name": "Materials & Resources", "points": 10, "max": 13},
                {"name": "Indoor Environmental Quality", "points": 12, "max": 16},
                {"name": "Innovation", "points": 4, "max": 6}
            ]
        },
        "recycling_summary": {
            "concrete": {"recycled": 85, "unit": "tons"},
            "metal": {"recycled": 12, "unit": "tons"},
            "wood": {"recycled": 8, "unit": "tons"},
            "cardboard": {"recycled": 2, "unit": "tons"}
        },
        "green_initiatives": [
            {"name": "Solar Panel Installation", "status": "planned", "impact": "30% energy reduction"},
            {"name": "Rainwater Harvesting", "status": "in_progress", "impact": "40% water savings"},
            {"name": "LED Lighting Throughout", "status": "completed", "impact": "50% lighting energy savings"}
        ],
        "generated_at": datetime.utcnow().isoformat()
    }

# ============ USER PROFILE ENDPOINTS ============

@api_router.put("/users/profile")
async def update_user_profile(profile_data: dict, current_user: dict = Depends(get_current_user)):
    """Update current user's profile"""
    allowed_fields = ['full_name', 'phone', 'company', 'job_title', 'avatar_url', 'notification_preferences']
    update_data = {k: v for k, v in profile_data.items() if k in allowed_fields}
    update_data['updated_at'] = datetime.utcnow()
    
    result = await users_collection.update_one(
        {"id": current_user['user_id']},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = await users_collection.find_one({"id": current_user['user_id']})
    return serialize_doc(updated_user)

@api_router.get("/users/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user's profile"""
    user = await users_collection.find_one({"id": current_user['user_id']})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return serialize_doc(user)

# ============ WEATHER ENDPOINT ============

@api_router.get("/weather/{project_id}")
async def get_project_weather(project_id: str, current_user: dict = Depends(get_current_user)):
    """Get weather forecast for project location"""
    project = await projects_collection.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not project.get('location'):
        raise HTTPException(status_code=400, detail="Project has no location set")
    
    loc = project['location']
    weather_data = await get_weather_forecast(loc.get('lat'), loc.get('lng'))
    
    return weather_data

# ============ DASHBOARD ENDPOINT ============

@api_router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics"""
    # Get user's projects
    projects = await projects_collection.find({
        "$or": [
            {"owner_id": current_user['user_id']},
            {"team_members": current_user['user_id']}
        ]
    }).to_list(1000)
    
    project_ids = [p['id'] for p in projects]
    
    # Get tasks for these projects
    all_tasks = await tasks_collection.find({"project_id": {"$in": project_ids}}).to_list(10000)
    
    # Get recent alerts
    recent_alerts = await alerts_collection.find({
        "project_id": {"$in": project_ids}
    }).sort("created_at", -1).limit(10).to_list(10)
    
    # Calculate stats
    active_projects = [p for p in projects if p.get('status') == 'active']
    completed_tasks = [t for t in all_tasks if t.get('status') == 'completed']
    
    # Budget variance
    total_budget = sum(p.get('budget', 0) for p in projects)
    total_actual = sum(p.get('actual_cost', 0) for p in projects)
    budget_variance = ((total_actual / total_budget) - 1) * 100 if total_budget > 0 else 0
    
    # Upcoming deadlines
    upcoming = []
    for task in all_tasks:
        if task.get('end_date') and task.get('status') != 'completed':
            end_date = task['end_date'] if isinstance(task['end_date'], datetime) else datetime.fromisoformat(task['end_date'])
            if end_date > datetime.utcnow():
                upcoming.append({
                    "task_id": task['id'],
                    "title": task['title'],
                    "project_id": task['project_id'],
                    "due_date": end_date.isoformat(),
                    "days_until_due": (end_date - datetime.utcnow()).days
                })
    
    upcoming.sort(key=lambda x: x['days_until_due'])
    
    return DashboardStats(
        total_projects=len(projects),
        active_projects=len(active_projects),
        total_tasks=len(all_tasks),
        completed_tasks=len(completed_tasks),
        budget_variance=budget_variance,
        recent_alerts=[Alert(**serialize_doc(a)) for a in recent_alerts],
        upcoming_deadlines=upcoming[:10]
    )

# ============ FEEDBACK ENDPOINTS ============

@api_router.post("/feedback/contact")
async def submit_contact_form(contact_data: dict):
    """Submit contact form"""
    feedback_dict = {
        "id": str(uuid.uuid4()),
        "type": "contact",
        "name": contact_data.get("name"),
        "email": contact_data.get("email"),
        "phone": contact_data.get("phone"),
        "message": contact_data.get("message"),
        "inquiry_type": contact_data.get("type", "General Inquiry"),
        "created_at": datetime.utcnow(),
        "status": "new"
    }
    
    await db.feedback.insert_one(feedback_dict)
    
    # TODO: Send email notification to founder@buildtrack.com
    # You can integrate SendGrid or similar service here
    
    return {"message": "Contact form submitted successfully", "id": feedback_dict["id"]}

@api_router.post("/feedback/feature")
async def submit_feature_request(feature_data: dict):
    """Submit feature request"""
    feedback_dict = {
        "id": str(uuid.uuid4()),
        "type": "feature_request",
        "feature_request": feature_data.get("feature_request"),
        "created_at": datetime.utcnow(),
        "status": "new",
        "votes": 0
    }
    
    await db.feedback.insert_one(feedback_dict)
    
    return {"message": "Feature request submitted successfully", "id": feedback_dict["id"]}

@api_router.get("/feedback")
async def get_all_feedback(current_user: dict = Depends(get_current_user)):
    """Get all feedback (admin only)"""
    if current_user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    feedback_items = await db.feedback.find({}).sort("created_at", -1).to_list(1000)
    return [serialize_doc(f) for f in feedback_items]

# ============ AI BUDGET ESTIMATION ============

@api_router.post("/ai/budget-estimate")
async def get_ai_budget_estimate(data: dict, current_user: dict = Depends(get_current_user)):
    """Get AI-powered budget estimation for a project"""
    project_type = data.get("projectType", "commercial")
    square_footage = data.get("squareFootage", 5000)
    location = data.get("location", {})
    timeline = data.get("timeline", {})
    
    # Base cost per square foot by project type
    BASE_COSTS = {
        "residential": 150,
        "commercial": 200,
        "industrial": 120,
        "renovation": 100,
        "infrastructure": 250,
    }
    
    # Regional cost adjustments (simplified)
    REGIONAL_MULTIPLIERS = {
        "CA": 1.35,  # California - high cost
        "NY": 1.30,  # New York - high cost
        "TX": 0.95,  # Texas - moderate
        "FL": 1.05,  # Florida - moderate
        "WA": 1.20,  # Washington - higher
        "default": 1.0
    }
    
    base_cost = BASE_COSTS.get(project_type, 150)
    regional_multiplier = REGIONAL_MULTIPLIERS.get(location.get("state", "default"), 1.0)
    
    # Calculate base estimate
    base_estimate = square_footage * base_cost * regional_multiplier
    
    # Add contingency (15% for new construction, 20% for renovation)
    contingency_rate = 0.20 if project_type == "renovation" else 0.15
    contingency = base_estimate * contingency_rate
    
    # Add permits and fees (approximately 3-5%)
    permits_fees = base_estimate * 0.04
    
    # Calculate total
    total_estimate = base_estimate + contingency + permits_fees
    
    # Generate breakdown
    breakdown = f"""Budget Breakdown:
- Base Construction: ${base_estimate:,.0f}
- Contingency ({int(contingency_rate*100)}%): ${contingency:,.0f}
- Permits & Fees (4%): ${permits_fees:,.0f}

Estimate based on {project_type} project in {location.get('city', 'your area')}, {location.get('state', 'US')}
at ${base_cost * regional_multiplier:.0f}/sq ft."""

    return {
        "estimatedBudget": round(total_estimate, -3),  # Round to nearest thousand
        "breakdown": breakdown,
        "confidence": 0.85,
        "factors": {
            "baseCostPerSqFt": base_cost,
            "regionalMultiplier": regional_multiplier,
            "contingencyRate": contingency_rate,
        }
    }

# ============ SENSOR DATA / SAFETY MONITORING ============

@api_router.post("/safety/sensor-data")
async def submit_sensor_data(data: dict, current_user: dict = Depends(get_current_user)):
    """Submit sensor data from mobile device for AI safety analysis"""
    sensor_doc = {
        "user_id": str(current_user["_id"]),
        "timestamp": datetime.utcnow(),
        "device_info": data.get("deviceInfo"),
        "location": data.get("location"),
        "environmental": data.get("environmental"),
        "activity_metrics": data.get("activityMetrics"),
        "motion_data": data.get("currentMotion"),
    }
    
    await db.sensor_logs.insert_one(sensor_doc)
    
    # Analyze for safety concerns using AI
    alerts = []
    
    # Check for concerning patterns
    activity = data.get("activityMetrics", {})
    if activity.get("lastActivityType") == "stationary" and activity.get("restMinutes", 0) > 10:
        alerts.append({
            "type": "prolonged_stillness_warning",
            "severity": "low",
            "message": "Extended period of inactivity detected"
        })
    
    return {
        "status": "recorded",
        "alerts": alerts,
        "timestamp": datetime.utcnow().isoformat()
    }

@api_router.post("/safety/alert")
async def submit_safety_alert(alert_data: dict, current_user: dict = Depends(get_current_user)):
    """Submit a safety alert from the mobile device"""
    alert_doc = {
        "id": str(uuid.uuid4()),
        "user_id": str(current_user["_id"]),
        "user_name": current_user.get("full_name", "Unknown"),
        "alert_type": alert_data.get("type"),
        "severity": alert_data.get("severity"),
        "message": alert_data.get("message"),
        "location": alert_data.get("location"),
        "device_data": alert_data.get("data"),
        "created_at": datetime.utcnow(),
        "acknowledged": False,
        "acknowledged_by": None,
        "acknowledged_at": None,
    }
    
    await db.safety_alerts.insert_one(alert_doc)
    
    # In production: Send push notifications to supervisors/safety team
    # In production: Trigger emergency response if severity is critical
    
    return {"status": "alert_recorded", "alert_id": alert_doc["id"]}

@api_router.get("/safety/alerts")
async def get_safety_alerts(current_user: dict = Depends(get_current_user)):
    """Get recent safety alerts"""
    # Get alerts for this user or all if admin/supervisor
    query = {}
    if current_user.get("role") not in ["admin", "supervisor"]:
        query["user_id"] = str(current_user["_id"])
    
    alerts = await db.safety_alerts.find(query).sort("created_at", -1).limit(50).to_list(50)
    return [serialize_doc(a) for a in alerts]

@api_router.put("/safety/alerts/{alert_id}/acknowledge")
async def acknowledge_safety_alert(alert_id: str, current_user: dict = Depends(get_current_user)):
    """Acknowledge a safety alert"""
    result = await db.safety_alerts.update_one(
        {"id": alert_id},
        {
            "$set": {
                "acknowledged": True,
                "acknowledged_by": str(current_user["_id"]),
                "acknowledged_at": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return {"status": "acknowledged"}

# ============ FINANCIAL ENDPOINTS ============

@api_router.post("/expenses", response_model=Expense)
async def create_expense(expense: ExpenseCreate, current_user: dict = Depends(get_current_user)):
    """Create a project expense"""
    expense_dict = expense.dict()
    expense_dict['id'] = str(uuid.uuid4())
    expense_dict['created_by'] = current_user['user_id']
    expense_dict['created_at'] = datetime.utcnow()
    
    await expenses_collection.insert_one(expense_dict)
    return Expense(**expense_dict)

@api_router.get("/expenses/{project_id}", response_model=List[Expense])
async def get_project_expenses(project_id: str, current_user: dict = Depends(get_current_user)):
    """Get all expenses for a project"""
    expenses = await expenses_collection.find({"project_id": project_id}).sort("expense_date", -1).to_list(1000)
    return [Expense(**serialize_doc(e)) for e in expenses]

@api_router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str, current_user: dict = Depends(get_current_user)):
    """Delete an expense"""
    result = await expenses_collection.delete_one({"id": expense_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted successfully"}

@api_router.post("/invoices", response_model=Invoice)
async def create_invoice(invoice: InvoiceCreate, current_user: dict = Depends(get_current_user)):
    """Create a client invoice"""
    invoice_dict = invoice.dict()
    invoice_dict['id'] = str(uuid.uuid4())
    invoice_dict['created_by'] = current_user['user_id']
    invoice_dict['created_at'] = datetime.utcnow()
    
    await invoices_collection.insert_one(invoice_dict)
    return Invoice(**invoice_dict)

@api_router.get("/invoices/{project_id}", response_model=List[Invoice])
async def get_project_invoices(project_id: str, current_user: dict = Depends(get_current_user)):
    """Get all invoices for a project"""
    invoices = await invoices_collection.find({"project_id": project_id}).sort("issue_date", -1).to_list(1000)
    return [Invoice(**serialize_doc(i)) for i in invoices]

@api_router.put("/invoices/{invoice_id}/status")
async def update_invoice_status(invoice_id: str, status: str, current_user: dict = Depends(get_current_user)):
    """Update invoice status"""
    update_data = {"status": status}
    if status == "paid":
        update_data["paid_date"] = datetime.utcnow()
    
    result = await invoices_collection.update_one({"id": invoice_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"message": "Invoice updated successfully"}

@api_router.get("/financial/summary/{project_id}")
async def get_financial_summary(project_id: str, current_user: dict = Depends(get_current_user)):
    """Get financial summary for a project"""
    expenses = await expenses_collection.find({"project_id": project_id}).to_list(1000)
    invoices = await invoices_collection.find({"project_id": project_id}).to_list(1000)
    
    total_expenses = sum(e.get('amount', 0) for e in expenses)
    total_revenue = sum(i.get('total', 0) for i in invoices if i.get('status') == 'paid')
    outstanding = sum(i.get('total', 0) for i in invoices if i.get('status') in ['sent', 'overdue'])
    
    return {
        "total_revenue": total_revenue,
        "total_expenses": total_expenses,
        "net_profit": total_revenue - total_expenses,
        "outstanding_invoices": outstanding,
        "paid_invoices": total_revenue,
        "expense_breakdown": {
            "labor": sum(e['amount'] for e in expenses if e.get('category') == 'labor'),
            "materials": sum(e['amount'] for e in expenses if e.get('category') == 'materials'),
            "equipment": sum(e['amount'] for e in expenses if e.get('category') == 'equipment'),
            "other": sum(e['amount'] for e in expenses if e.get('category') not in ['labor', 'materials', 'equipment'])
        }
    }

@api_router.get("/financial/export/{project_id}")
async def export_financial_data(project_id: str, format: str = "csv", current_user: dict = Depends(get_current_user)):
    """Export financial data in various formats (CSV, IIF, JSON)"""
    project = await projects_collection.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    expenses = await expenses_collection.find({"project_id": project_id}).to_list(1000)
    invoices = await invoices_collection.find({"project_id": project_id}).to_list(1000)
    
    if format == "csv":
        # CSV format for Excel
        csv_data = "Type,Date,Description,Category,Amount,Status\n"
        for exp in expenses:
            csv_data += f"Expense,{exp['expense_date']},{exp['description']},{exp['category']},{exp['amount']},Paid\n"
        for inv in invoices:
            csv_data += f"Invoice,{inv['issue_date']},{inv['client_name']},Revenue,{inv['total']},{inv['status']}\n"
        return {"format": "csv", "data": csv_data, "filename": f"{project['name']}_financials.csv"}
    
    elif format == "iif":
        # IIF format for QuickBooks import
        iif_data = "!TRNS\tTRNSID\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT\tMEMO\n"
        iif_data += "!SPL\tSPLID\tTRNSTYPE\tDATE\tACCNT\tAMOUNT\tMEMO\n"
        iif_data += "!ENDTRNS\n"
        
        for exp in expenses:
            iif_data += f"TRNS\t{exp['id']}\tCHECK\t{exp['expense_date']}\tExpenses\t{exp.get('vendor_name', 'Vendor')}\t-{exp['amount']}\t{exp['description']}\n"
            iif_data += f"SPL\t{exp['id']}\tCHECK\t{exp['expense_date']}\t{exp['category'].title()}\t{exp['amount']}\t{exp['description']}\n"
            iif_data += "ENDTRNS\n"
        
        for inv in invoices:
            iif_data += f"TRNS\t{inv['id']}\tINVOICE\t{inv['issue_date']}\tAccounts Receivable\t{inv['client_name']}\t{inv['total']}\tInvoice {inv['invoice_number']}\n"
            iif_data += f"SPL\t{inv['id']}\tINVOICE\t{inv['issue_date']}\tIncome\t-{inv['total']}\t{inv['invoice_number']}\n"
            iif_data += "ENDTRNS\n"
        
        return {"format": "iif", "data": iif_data, "filename": f"{project['name']}_qb_import.iif"}
    
    else:
        # JSON format
        return {
            "format": "json",
            "data": {
                "project": serialize_doc(project),
                "expenses": [serialize_doc(e) for e in expenses],
                "invoices": [serialize_doc(i) for i in invoices]
            },
            "filename": f"{project['name']}_financials.json"
        }

# ============ GANTT CHART DATA ENDPOINT ============

@api_router.get("/gantt/{project_id}")
async def get_gantt_data(project_id: str, current_user: dict = Depends(get_current_user)):
    """Get Gantt chart data for a project"""
    project = await projects_collection.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    tasks = await tasks_collection.find({"project_id": project_id}).to_list(1000)
    
    # Transform tasks into Gantt format
    gantt_tasks = []
    for task in tasks:
        start_date = task.get('start_date')
        end_date = task.get('end_date')
        
        if isinstance(start_date, str):
            start_date = datetime.fromisoformat(start_date.replace('Z', ''))
        if isinstance(end_date, str):
            end_date = datetime.fromisoformat(end_date.replace('Z', ''))
        
        gantt_tasks.append({
            "id": task['id'],
            "name": task['title'],
            "start": start_date.isoformat() if start_date else datetime.utcnow().isoformat(),
            "end": end_date.isoformat() if end_date else (datetime.utcnow() + timedelta(days=7)).isoformat(),
            "progress": 100 if task.get('status') == 'completed' else (50 if task.get('status') == 'in_progress' else 0),
            "status": task.get('status', 'pending'),
            "assignees": task.get('assigned_to', []),
            "dependencies": task.get('dependencies', []),
            "priority": task.get('priority', 1),
            "description": task.get('description', '')
        })
    
    return {
        "project_id": project_id,
        "project_name": project.get('name'),
        "project_start": project.get('start_date'),
        "project_end": project.get('end_date'),
        "tasks": gantt_tasks,
        "milestones": [
            {"date": project.get('start_date'), "name": "Project Start"},
            {"date": project.get('end_date'), "name": "Project End"}
        ]
    }

# ============ ROOT ENDPOINT ============

@api_router.get("/")
async def root():
    return {
        "app": "BuildTrack API",
        "version": "1.0.0",
        "status": "operational"
    }

# Include router
app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
