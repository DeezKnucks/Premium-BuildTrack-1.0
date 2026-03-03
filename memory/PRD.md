# BuildTrack - Product Requirements Document

## Project Overview
**Product Name:** BuildTrack  
**Version:** 1.0.0  
**Last Updated:** March 3, 2026  
**Founder:** Peter Martinez

BuildTrack is a mobile-first construction project management application designed for mid-market contractors ($5M-$500M projects). The app leverages AI to predict risks, optimize workflows, and unify fragmented construction tools into one comprehensive platform.

---

## Core Features (Implemented)

### 1. User Authentication
- ✅ Email/password registration and login
- ✅ JWT-based authentication
- ✅ Protected routes with role-based access
- **Test Credentials:** `demo@buildtrack.com` / `demo123`

### 2. Project Management
- ✅ Create, read, update projects
- ✅ Project status tracking (planning, active, on_hold, completed)
- ✅ Budget tracking with variance analysis
- ✅ Team member assignment
- ✅ Completion percentage tracking

### 3. Task Management
- ✅ Full CRUD operations for tasks
- ✅ Task assignment to team members
- ✅ Priority levels (low, medium, high, critical)
- ✅ Due date tracking
- ✅ Task dependencies

### 4. Media Capture
- ✅ Photo capture with GPS tagging
- ✅ Media gallery with project association
- ✅ Offline-capable capture (foundation ready)

### 5. AI Features (Integrated via Emergent LLM)
- ✅ Risk prediction engine
- ✅ Budget analysis with alerts
- ✅ Schedule optimization recommendations
- ✅ Compliance checking
- ✅ Vendor scouting

### 6. Dashboard & Analytics
- ✅ Overview metrics (active projects, task completion)
- ✅ Weekly progress bar charts
- ✅ Budget status tracking
- ✅ Performance donut chart
- ✅ Project carousel

### 7. Reporting
- ✅ Team reports
- ✅ Budget/financial reports
- ✅ Timeline reports
- ✅ Safety reports
- ✅ Materials reports
- ✅ Sustainability reports

### 8. Additional Features
- ✅ Vendor marketplace
- ✅ Chat interface (UI ready)
- ✅ Settings screen
- ✅ User profile editing
- ✅ Weather integration (OpenWeatherMap)

---

## UI/UX Implementation

### Design System
- **Primary Color:** #FF6B35 (Orange)
- **Secondary Color:** #1E3A8A (Navy Blue)
- **Background:** #0F0F23 (Dark Navy)
- **Premium glassmorphism effects**
- **Custom icons in tab navigation**
- **Animated splash screen**

### Screens Implemented
1. Splash Screen (animated, 2-second display)
2. Onboarding (personalized with founder info)
3. Login/Register
4. Dashboard (with charts)
5. Projects list
6. Tasks list
7. Media capture
8. AI Insights
9. More menu
10. Marketplace
11. Reports (6 report types)
12. Settings
13. Chat
14. Edit Profile

---

## Patent Documentation Created

Three detailed, patent-ready technical documents have been created:

### 1. Predictive Risk Scoring Algorithm (PRSA)
- `/app/docs/patents/01_PREDICTIVE_RISK_SCORING_ALGORITHM.md`
- Temporal Risk Decay Function (TRDF)
- Contextual Weight Adjustment Matrix (CWAM)
- Multi-dimensional risk analysis

### 2. Data Normalization Engine (DNE)
- `/app/docs/patents/02_DATA_NORMALIZATION_ENGINE.md`
- Semantic Construction Ontology (SCO)
- Adaptive Schema Mapping (ASM)
- Confidence-Weighted Data Fusion (CWDF)

### 3. Workflow Optimization Engine (WOE)
- `/app/docs/patents/03_WORKFLOW_OPTIMIZATION_ENGINE.md`
- Dynamic Constraint Propagation (DCP)
- Multi-Objective Resource Leveling (MORL)
- Adaptive Learning Feedback Loops (ALFL)

---

## Technical Architecture

### Frontend
- **Framework:** React Native + Expo
- **State Management:** Zustand + React Query
- **Navigation:** Expo Router
- **UI Components:** Custom + LinearGradient
- **Charts:** Custom web-compatible components

### Backend
- **Framework:** FastAPI
- **Database:** MongoDB (motor async driver)
- **Authentication:** JWT
- **AI Integration:** emergentintegrations library (OpenAI GPT-5.2)

### APIs
- `/api/health` - Health check
- `/api/auth/*` - Authentication
- `/api/projects/*` - Project CRUD
- `/api/tasks/*` - Task CRUD
- `/api/media/*` - Media management
- `/api/ai/*` - AI features
- `/api/reports/*` - Report generation
- `/api/chat/*` - Chat functionality

---

## Environment Configuration

### Frontend (.env)
```
EXPO_PUBLIC_BACKEND_URL=https://workflow-engine-83.preview.emergentagent.com
```

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
EMERGENT_LLM_KEY=sk-emergent-****
OPENWEATHER_API_KEY=909d24524cb5985ec0f7972e512ed203
JWT_SECRET=buildtrack_super_secret_key_change_in_production_2025
```

---

## Known Issues (Resolved in This Session)

1. ✅ Server errors (syntax, imports) - FIXED
2. ✅ Navigation bug on initial login - FIXED (proper state management)
3. ✅ Splash screen not integrated - FIXED (now shows animated splash)
4. ✅ Dashboard charts removed - FIXED (new web-compatible charts added)
5. ✅ Health endpoint missing - FIXED
6. ✅ Onboarding showing placeholder name - FIXED (now shows Peter Martinez)
7. ✅ OpenWeather API key invalid - VERIFIED WORKING

---

## Future Enhancements (Backlog)

### P1 - High Priority
- [ ] Gantt chart visualization for project timelines
- [ ] Real-time chat with WebSocket integration
- [ ] Push notifications

### P2 - Medium Priority
- [ ] Full offline sync with SQLite
- [ ] Admin panel for role management
- [ ] Document upload and storage

### P3 - Lower Priority
- [ ] QuickBooks integration
- [ ] Procore data sync
- [ ] Mobile app deployment (App Store / Play Store)

---

## Testing

### Test Credentials
- Email: `demo@buildtrack.com`
- Password: `demo123`

### API Testing
```bash
# Health check
curl https://workflow-engine-83.preview.emergentagent.com/api/health

# Login
curl -X POST https://workflow-engine-83.preview.emergentagent.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@buildtrack.com","password":"demo123"}'
```

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| Mar 3, 2026 | 1.0.0 | Full app implementation, patent docs, bug fixes |
| Feb 6, 2026 | 0.9.0 | Initial MVP |

---

*BuildTrack - Crush Overruns with AI*
