# BuildTrack - Product Requirements Document

## Project Overview
**Product Name:** BuildTrack  
**Version:** 2.0.0  
**Last Updated:** March 3, 2026  
**Founder:** Peter Martinez

BuildTrack is a comprehensive, mobile-first construction project management application designed for mid-market contractors ($5M-$500M projects). The app leverages AI for risk prediction, workflow optimization, and includes full hardware sensor integration for worker safety monitoring.

---

## Complete Feature Set

### 1. Authentication & User Management
- ✅ Email/password registration and login
- ✅ JWT-based authentication
- ✅ Protected routes with role-based access
- **Test Credentials:** `demo@buildtrack.com` / `demo123`

### 2. Project Management
- ✅ Full CRUD operations for projects
- ✅ Project status tracking
- ✅ Budget tracking with variance analysis
- ✅ **Project Creation Wizard** with AI-assisted budget estimation
- ✅ Team member assignment

### 3. Task Management
- ✅ Full CRUD operations for tasks
- ✅ Task assignment and dependencies
- ✅ Priority levels and due dates

### 4. AI Features (Emergent LLM Integration)
- ✅ Risk prediction engine
- ✅ **AI Budget Estimation** - Calculates costs based on project type, location, size
- ✅ Schedule optimization recommendations
- ✅ Compliance checking, Vendor scouting

### 5. Safety Monitoring System (COMPLETE)
- ✅ **Smartphone Sensor Integration**
  - Accelerometer (10Hz) - Fall/impact detection
  - Gyroscope - Rotation tracking
  - Barometer - Altitude/pressure monitoring
  - GPS - Location tracking, geofencing
  - Pedometer - Step counting
- ✅ **Fall Detection Algorithm** - Free-fall + impact pattern recognition
- ✅ **Impact Detection** - Alerts on high-G impacts (>35 m/s²)
- ✅ **Prolonged Stillness Detection** - 5-minute inactivity alerts
- ✅ **Rapid Descent Detection** - Altitude change monitoring
- ✅ **Activity Tracking** - Steps, distance, floors, calories
- ✅ **Geofencing** - Job site boundary monitoring
- ✅ **Emergency SOS Button**

### 6. Wearable Integration (NEW)
- ✅ **Apple Watch Support** - HealthKit integration
- ✅ **Galaxy Watch Support** - Health Connect integration
- ✅ **Health Data Sync** - Heart rate, blood oxygen, body temp
- ✅ **Workout Tracking** - Activity and exercise logging
- ✅ **Safety Thresholds** - Automatic alerts for abnormal vitals

### 7. Voice Commands (NEW)
- ✅ **Hands-Free Operation** - Navigation by voice
- ✅ **Safety Commands** - Emergency, start/stop monitoring
- ✅ **Project Commands** - Create project, status check
- ✅ **Task Commands** - Create, complete, status
- ✅ **Text-to-Speech** - Audio feedback and alerts

### 8. Offline Sync (NEW)
- ✅ **SQLite Local Database** - Full offline support
- ✅ **Automatic Sync Queue** - Changes sync when online
- ✅ **Data Caching** - Projects, tasks, user profile
- ✅ **Conflict Resolution** - Smart merge strategies
- ✅ **Network Status Monitoring** - Auto-sync on reconnect

### 9. Push Notifications (NEW)
- ✅ **Safety Alerts** - Critical, high-priority notifications
- ✅ **Task Reminders** - Deadline approaching alerts
- ✅ **Project Updates** - Team activity notifications
- ✅ **Weather Alerts** - Work site conditions
- ✅ **Budget Warnings** - Financial threshold alerts
- ✅ **Quiet Hours** - Configurable notification schedule
- ✅ **Per-Type Toggle** - Granular notification control

### 10. Dashboard & Analytics
- ✅ Overview metrics, Weekly progress charts
- ✅ Budget status tracking, Performance donut chart

### 11. Reporting
- ✅ Team, Budget/Financial, Timeline, Safety, Materials, Sustainability reports

### 12. Additional Features
- ✅ Vendor marketplace
- ✅ Team chat interface
- ✅ Settings screen
- ✅ Weather integration (OpenWeatherMap)
- ✅ Animated splash screen
- ✅ Personalized onboarding (Peter Martinez)

---

## Patent Documentation

Three patent-ready technical documents created:

1. **Predictive Risk Scoring Algorithm (PRSA)** - `/app/docs/patents/01_PREDICTIVE_RISK_SCORING_ALGORITHM.md`
2. **Data Normalization Engine (DNE)** - `/app/docs/patents/02_DATA_NORMALIZATION_ENGINE.md`
3. **Workflow Optimization Engine (WOE)** - `/app/docs/patents/03_WORKFLOW_OPTIMIZATION_ENGINE.md`

---

## New Services Created

### Frontend Services
| Service | File | Purpose |
|---------|------|---------|
| SensorService | `/app/frontend/services/SensorService.ts` | Device sensor monitoring, fall detection |
| WearableIntegrationService | `/app/frontend/services/WearableIntegrationService.ts` | Apple Watch, Galaxy Watch integration |
| VoiceCommandService | `/app/frontend/services/VoiceCommandService.ts` | Voice commands, text-to-speech |
| OfflineSyncService | `/app/frontend/services/OfflineSyncService.ts` | SQLite storage, sync queue |
| PushNotificationService | `/app/frontend/services/PushNotificationService.ts` | Push notifications management |

### New Screens
| Screen | File | Purpose |
|--------|------|---------|
| Project Wizard | `/app/frontend/app/project-wizard.tsx` | 6-step project creation |
| Safety Monitor | `/app/frontend/app/safety-monitor.tsx` | Live sensor dashboard |
| Wearables | `/app/frontend/app/wearables.tsx` | Device pairing, health data |
| Voice Commands | `/app/frontend/app/voice-commands.tsx` | Command testing, list |
| Offline Sync | `/app/frontend/app/offline-sync.tsx` | Sync status, management |
| Notification Settings | `/app/frontend/app/notification-settings.tsx` | Notification preferences |

### Backend Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ai/budget-estimate` | POST | AI budget calculation |
| `/api/safety/sensor-data` | POST | Sensor data storage |
| `/api/safety/alert` | POST | Safety alert submission |
| `/api/safety/alerts` | GET | Get safety alerts |
| `/api/safety/alerts/{id}/acknowledge` | PUT | Acknowledge alert |

---

## Technical Architecture

```
/app
├── backend/
│   ├── server.py              # FastAPI main app (1200+ lines)
│   ├── ai_service.py          # AI/LLM integration
│   ├── models.py              # Pydantic models
│   └── auth.py                # JWT authentication
└── frontend/
    ├── app/                   # Expo Router screens (30+ screens)
    ├── components/            # UI components
    │   ├── Charts.tsx         # Custom chart components
    │   ├── GlassCard.tsx      # Glassmorphism cards
    │   └── CustomIcons.tsx    # Tab bar icons
    ├── services/              # Business logic
    │   ├── api.ts             # API client
    │   ├── SensorService.ts   # Sensor monitoring
    │   ├── WearableIntegrationService.ts
    │   ├── VoiceCommandService.ts
    │   ├── OfflineSyncService.ts
    │   └── PushNotificationService.ts
    └── contexts/              # React contexts
```

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

## Testing

### Test Credentials
- Email: `demo@buildtrack.com`
- Password: `demo123`

### API Testing
```bash
# Health check
curl https://workflow-engine-83.preview.emergentagent.com/api/health

# AI Budget Estimate (requires auth token)
curl -X POST https://workflow-engine-83.preview.emergentagent.com/api/ai/budget-estimate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"projectType":"commercial","squareFootage":5000,"location":{"city":"Houston","state":"TX"}}'
```

---

## Device Requirements

### Sensor Features (Require Physical Device)
- Fall Detection
- Impact Detection
- Activity Tracking
- Geofencing

### Wearable Features (Require Paired Device)
- Apple Watch (iOS with HealthKit)
- Galaxy Watch (Android with Health Connect)

### Works on Web Preview
- Voice Commands (text input mode)
- Offline Sync (simulated)
- Push Notifications (requires device for actual delivery)

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| Mar 3, 2026 | 2.0.0 | Wearable integration, voice commands, offline sync, push notifications |
| Mar 3, 2026 | 1.1.0 | Sensor integration, safety monitoring, project wizard |
| Mar 3, 2026 | 1.0.0 | Full app implementation, patent docs, bug fixes |
| Feb 6, 2026 | 0.9.0 | Initial MVP |

---

## All Features Complete ✅

The BuildTrack app now includes:
1. ✅ Project Creation Wizard with AI budget estimation
2. ✅ Safety Monitoring with smartphone sensors
3. ✅ Wearable Device Integration (Apple Watch, Galaxy Watch)
4. ✅ Voice Commands for hands-free operation
5. ✅ Full Offline Sync with SQLite
6. ✅ Push Notifications with granular controls
7. ✅ Patent Documentation (3 algorithms)
8. ✅ Premium UI across all screens

---

*BuildTrack - Crush Overruns with AI*
