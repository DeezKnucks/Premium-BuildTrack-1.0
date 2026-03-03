# BuildTrack - Product Requirements Document

## Project Overview
**Product Name:** BuildTrack  
**Version:** 1.1.0  
**Last Updated:** March 3, 2026  
**Founder:** Peter Martinez

BuildTrack is a mobile-first construction project management application designed for mid-market contractors ($5M-$500M projects). The app leverages AI to predict risks, optimize workflows, and unify fragmented construction tools. **NEW:** Now includes smartphone sensor integration for safety monitoring.

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
- ✅ **NEW: Project Creation Wizard** with AI-assisted budget estimation

### 3. Task Management
- ✅ Full CRUD operations for tasks
- ✅ Task assignment to team members
- ✅ Priority levels (low, medium, high, critical)
- ✅ Due date tracking, task dependencies

### 4. Media Capture
- ✅ Photo capture with GPS tagging
- ✅ Media gallery with project association

### 5. AI Features (Integrated via Emergent LLM)
- ✅ Risk prediction engine
- ✅ Budget analysis with alerts
- ✅ Schedule optimization recommendations
- ✅ **NEW: AI Budget Estimation** - Calculates project costs based on type, location, and size

### 6. Dashboard & Analytics
- ✅ Overview metrics (active projects, task completion)
- ✅ Weekly progress bar charts
- ✅ Budget status tracking
- ✅ Performance donut chart

### 7. **NEW: Safety Monitoring System**
- ✅ **Smartphone Sensor Integration** - Uses device accelerometer, gyroscope, barometer, GPS
- ✅ **Fall Detection Algorithm** - Detects free-fall patterns followed by impact
- ✅ **Impact Detection** - Alerts on high-G impacts
- ✅ **Prolonged Stillness Detection** - Monitors for no movement periods
- ✅ **Activity Tracking** - Steps, distance, floors climbed, calories
- ✅ **Geofencing** - Job site boundary monitoring
- ✅ **Rapid Descent Detection** - Monitors altitude changes (barometer)
- ✅ **Emergency SOS Button** - Quick alert to emergency contacts

### 8. Reporting
- ✅ Team reports, Budget/financial reports
- ✅ Timeline, Safety, Materials, Sustainability reports

### 9. Additional Features
- ✅ Vendor marketplace
- ✅ Chat interface, Settings screen
- ✅ User profile editing
- ✅ Weather integration (OpenWeatherMap)
- ✅ Animated splash screen

---

## Patent Documentation Created

Three detailed, patent-ready technical documents:

1. **Predictive Risk Scoring Algorithm (PRSA)** - `/app/docs/patents/01_PREDICTIVE_RISK_SCORING_ALGORITHM.md`
2. **Data Normalization Engine (DNE)** - `/app/docs/patents/02_DATA_NORMALIZATION_ENGINE.md`
3. **Workflow Optimization Engine (WOE)** - `/app/docs/patents/03_WORKFLOW_OPTIMIZATION_ENGINE.md`

---

## New Files Created This Session

### Frontend
- `/app/frontend/services/SensorService.ts` - Comprehensive sensor monitoring service
- `/app/frontend/app/project-wizard.tsx` - AI-assisted project creation wizard
- `/app/frontend/app/safety-monitor.tsx` - Safety monitoring dashboard
- `/app/frontend/components/Charts.tsx` - Web-compatible chart components

### Backend Endpoints Added
- `POST /api/ai/budget-estimate` - AI budget estimation
- `POST /api/safety/sensor-data` - Sensor data submission
- `POST /api/safety/alert` - Safety alert submission
- `GET /api/safety/alerts` - Get safety alerts
- `PUT /api/safety/alerts/{id}/acknowledge` - Acknowledge alerts

---

## Technical Architecture

### Sensor Integration (SensorService.ts)
```typescript
// Available Sensors Used:
- Accelerometer (10Hz) - Fall/impact detection
- Gyroscope (10Hz) - Rotation tracking
- Barometer - Altitude/pressure monitoring
- GPS - Location tracking, geofencing
- Pedometer - Step counting
- Device Motion - Orientation

// Safety Features:
- Fall Detection: Free-fall + impact pattern recognition
- Impact Threshold: 35 m/s² (severe impact alert)
- Stillness Detection: 5-minute inactivity alerts
- Rapid Descent: 3+ m/s altitude change alerts
```

### Project Wizard Flow
1. **Basics** - Name, description, project type
2. **Location** - GPS or manual address entry
3. **Timeline** - Start/end date selection
4. **Budget** - AI estimation or manual entry
5. **Team** - Owner assignment
6. **Review** - Confirmation and creation

---

## API Endpoints Summary

### Authentication
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`

### Projects & Tasks
- CRUD operations at `/api/projects/*`, `/api/tasks/*`

### AI & Safety
- `POST /api/ai/budget-estimate` - Budget estimation
- `POST /api/safety/sensor-data` - Sensor data
- `POST /api/safety/alert` - Submit safety alert
- `GET /api/safety/alerts` - Get alerts

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

## Future Enhancements (Backlog)

### P1 - High Priority
- [ ] Wearable device integration (Apple Watch, Galaxy Watch via HealthKit/Samsung Health)
- [ ] Real-time WebSocket chat
- [ ] Push notifications for safety alerts

### P2 - Medium Priority
- [ ] Gantt chart visualization
- [ ] Full offline sync with SQLite
- [ ] Voice commands for hands-free operation

### P3 - Lower Priority
- [ ] QuickBooks/Procore integration
- [ ] Admin panel for role management
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

# AI Budget Estimate
curl -X POST https://workflow-engine-83.preview.emergentagent.com/api/ai/budget-estimate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"projectType":"commercial","squareFootage":5000,"location":{"city":"Houston","state":"TX"}}'
```

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| Mar 3, 2026 | 1.1.0 | Added sensor integration, safety monitoring, project wizard |
| Mar 3, 2026 | 1.0.0 | Full app implementation, patent docs, bug fixes |
| Feb 6, 2026 | 0.9.0 | Initial MVP |

---

*BuildTrack - Crush Overruns with AI*
