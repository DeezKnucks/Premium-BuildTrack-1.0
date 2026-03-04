from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    PM = "pm"
    CREW = "crew"
    SUB = "sub"

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"

class ProjectStatus(str, Enum):
    PLANNING = "planning"
    ACTIVE = "active"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class MediaType(str, Enum):
    PHOTO = "photo"
    VIDEO = "video"
    DOCUMENT = "document"
    VOICE = "voice"

class AlertType(str, Enum):
    BUDGET_VARIANCE = "budget_variance"
    SCHEDULE_DELAY = "schedule_delay"
    WEATHER_WARNING = "weather_warning"
    COMPLIANCE_ISSUE = "compliance_issue"
    RISK_PREDICTION = "risk_prediction"

# User Models
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole
    phone: Optional[str] = None
    company: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    role: Optional[UserRole] = None

# Project Models
class Location(BaseModel):
    lat: float
    lng: float
    address: Optional[str] = None

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: Optional[Location] = None
    budget: float
    start_date: datetime
    end_date: datetime
    status: ProjectStatus = ProjectStatus.PLANNING

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: str
    owner_id: str
    team_members: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    actual_cost: float = 0.0
    completion_percentage: float = 0.0

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[Location] = None
    budget: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[ProjectStatus] = None
    actual_cost: Optional[float] = None
    completion_percentage: Optional[float] = None

# Task Models
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: str
    assigned_to: Optional[List[str]] = []
    status: TaskStatus = TaskStatus.PENDING
    priority: int = 1  # 1-5, 5 being highest
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: str
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    checklist: List[Dict[str, Any]] = []
    dependencies: List[str] = []

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[List[str]] = None
    status: Optional[TaskStatus] = None
    priority: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    checklist: Optional[List[Dict[str, Any]]] = None

# Media Models
class MediaBase(BaseModel):
    project_id: str
    task_id: Optional[str] = None
    media_type: MediaType
    file_data: str  # base64 encoded
    thumbnail: Optional[str] = None
    location: Optional[Location] = None
    notes: Optional[str] = None
    tags: List[str] = []

class MediaCreate(MediaBase):
    pass

class Media(MediaBase):
    id: str
    uploaded_by: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    transcription: Optional[str] = None  # For voice notes

# Budget Models
class BudgetItem(BaseModel):
    category: str
    planned_amount: float
    actual_amount: float = 0.0
    notes: Optional[str] = None

class BudgetBase(BaseModel):
    project_id: str
    items: List[BudgetItem] = []
    contingency: float = 0.0

class BudgetCreate(BudgetBase):
    pass

class Budget(BudgetBase):
    id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Vendor Models
class VendorBase(BaseModel):
    name: str
    company: str
    email: EmailStr
    phone: str
    services: List[str] = []
    rating: float = 0.0
    total_projects: int = 0
    on_time_delivery: float = 0.0
    compliance_docs: List[str] = []

class VendorCreate(VendorBase):
    pass

class Vendor(VendorBase):
    id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Alert Models
class AlertBase(BaseModel):
    project_id: str
    alert_type: AlertType
    severity: str  # low, medium, high, critical
    title: str
    message: str
    data: Optional[Dict[str, Any]] = None

class AlertCreate(AlertBase):
    pass

class Alert(AlertBase):
    id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_read: bool = False
    is_resolved: bool = False

# Chat Models
class MessageBase(BaseModel):
    room_id: str
    content: str
    attachments: List[str] = []

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: str
    sender_id: str
    sender_name: str
    sent_at: datetime = Field(default_factory=datetime.utcnow)

class ChatRoom(BaseModel):
    id: str
    project_id: str
    name: str
    members: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

# AI Request/Response Models
class AIRiskRequest(BaseModel):
    project_id: str

class AIRiskResponse(BaseModel):
    risk_score: float
    risk_factors: List[Dict[str, Any]]
    recommendations: List[str]

class AIBudgetRequest(BaseModel):
    project_id: str

class AIScheduleRequest(BaseModel):
    project_id: str

class VoiceTranscriptionRequest(BaseModel):
    audio_data: str  # base64

class VoiceTranscriptionResponse(BaseModel):
    text: str
    confidence: float

# Dashboard Models
class DashboardStats(BaseModel):
    total_projects: int
    active_projects: int
    total_tasks: int
    completed_tasks: int
    budget_variance: float
    recent_alerts: List[Alert]
    upcoming_deadlines: List[Dict[str, Any]]

# Subscription Models
class SubscriptionPlan(str, Enum):
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"

class Subscription(BaseModel):
    user_id: str
    plan: SubscriptionPlan
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None

# Financial Models
class ExpenseCategory(str, Enum):
    LABOR = "labor"
    MATERIALS = "materials"
    EQUIPMENT = "equipment"
    PERMITS = "permits"
    SUBCONTRACTORS = "subcontractors"
    UTILITIES = "utilities"
    OTHER = "other"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"

class ExpenseBase(BaseModel):
    project_id: str
    category: ExpenseCategory
    description: str
    amount: float
    vendor_name: Optional[str] = None
    receipt_url: Optional[str] = None
    expense_date: datetime
    notes: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: str
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class InvoiceStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"

class InvoiceItemBase(BaseModel):
    description: str
    quantity: float
    unit_price: float
    total: float

class InvoiceBase(BaseModel):
    project_id: str
    invoice_number: str
    client_name: str
    client_email: Optional[str] = None
    client_address: Optional[str] = None
    items: List[InvoiceItemBase]
    subtotal: float
    tax_rate: float = 0.0
    tax_amount: float = 0.0
    total: float
    issue_date: datetime
    due_date: datetime
    status: InvoiceStatus = InvoiceStatus.DRAFT
    notes: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    pass

class Invoice(InvoiceBase):
    id: str
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    paid_date: Optional[datetime] = None

class FinancialSummary(BaseModel):
    total_revenue: float
    total_expenses: float
    net_profit: float
    outstanding_invoices: float
    paid_invoices: float

# Video Call Models
class CallType(str, Enum):
    ONE_ON_ONE = "one_on_one"
    GROUP = "group"
    CONFERENCE = "conference"

class CallStatus(str, Enum):
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    ENDED = "ended"
    CANCELLED = "cancelled"

class VideoCallBase(BaseModel):
    project_id: Optional[str] = None
    call_type: CallType
    title: str
    scheduled_time: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    participants: List[str] = []  # user IDs
    meeting_link: Optional[str] = None
    notes: Optional[str] = None

class VideoCallCreate(VideoCallBase):
    pass

class VideoCall(VideoCallBase):
    id: str
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: CallStatus = CallStatus.SCHEDULED
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
