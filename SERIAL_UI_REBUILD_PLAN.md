# Maslow CNC Serial UI Rebuild Plan

## 🎯 **Project Overview**
Rebuild the Maslow CNC web interface to use direct serial communication instead of unreliable WiFi, with a modern Vite + React frontend and Python FastAPI backend.

## 📋 **Current Situation Analysis**

### Hardware & Firmware
- **Machine**: Maslow CNC (500mm × 500mm work area)
- **Controller**: ESP32-S3 running FluidNC v3.0.x
- **Serial Connection**: `/dev/cu.usbmodem12201` at 115200 baud
- **Current Issues**: WiFi connection drops, SSID truncation, web interface getting stuck

### Existing Assets
- Excellent serial communication scripts in `/scripts/serial/`
- Configuration files: `maslow.yaml`, `preferences.json`
- Current UI has specific Maslow commands that must be preserved

## 🏗️ **Architecture: Vite Frontend + Python Backend**

### Technology Stack
- **Backend**: Python FastAPI server with WebSocket support
- **Frontend**: Vite + React with modern, responsive UI
- **Communication Flow**: Serial (USB) → Python Backend → WebSocket → Frontend
- **UI Style**: Flat, dark theme reminiscent of classic CNC control panels

### Key Benefits
- ✅ Rock-solid serial connection reliability
- ✅ No WiFi dependency
- ✅ Modern, responsive UI
- ✅ Real-time communication via WebSocket
- ✅ Mobile-friendly design
- ✅ Easy to extend and customize

## 🔧 **Core Components**

### 1. Python Serial Server (`maslow_serial_server.py`)
- FastAPI backend with WebSocket endpoints
- Serial communication handler using existing patterns
- G-code file upload and streaming
- Real-time position/status monitoring
- Configuration management (reads/writes `maslow.yaml` and `preferences.json`)
- API endpoints for all CNC operations

### 2. Vite Frontend (`frontend/`)
- Modern React application with Vite build system
- Real-time WebSocket connection to backend
- Flat, dark UI theme inspired by classic CNC machines
- Responsive design that works on desktop, tablet, and mobile
- Component-based architecture for maintainability

### 3. Startup Script (`start_maslow.py`)
- One-command launch of the entire system
- Automatic serial port detection
- Launches backend server and opens browser to frontend
- Handles graceful shutdown

## 📱 **Features to Preserve & Enhance**

### Critical Maslow-Specific Commands
- **Retract All** - Retract all anchor chains
- **Extend All** - Extend all anchor chains  
- **Apply Tension** - Apply tension to chains
- **Release Tension** - Release chain tension
- **Find Anchor Locations** - Calibration routine
- **Stop** - Emergency stop
- **Test** - System test routines
- **Set Z-Stop** - Set Z-axis bottom limit

### Manual Control Features
- XYZ jog controls with intuitive button layout
- Distance presets (0.1, 1, 10, 100mm)
- Home all axes ($H)
- Unlock machine ($X)
- Emergency stop functionality

### File Management
- G-code file upload via drag-and-drop
- File browser for stored G-code files
- File preview and basic G-code visualization
- Job progress tracking during execution

### Real-time Monitoring
- Live position display (X, Y, Z coordinates)
- Machine status updates
- Console output stream
- Connection status indicator
- Real-time feed rate and spindle speed

### Configuration Management
- Web-based editor for `maslow.yaml` settings
- Preferences management (`preferences.json`)
- Calibration settings access
- Network and system configuration

### Advanced Features
- Job queue management
- Basic G-code editing capabilities
- Machine diagnostics panel
- Log file viewer
- Backup/restore configuration

## 🚀 **Implementation Plan**

### Phase 1: Backend Foundation
1. Create FastAPI server with serial communication
2. Implement WebSocket for real-time updates
3. Add all Maslow-specific command endpoints
4. Configuration file management
5. G-code file handling

### Phase 2: Frontend Core
1. Set up Vite + React project
2. Create flat, dark UI theme
3. Implement WebSocket client
4. Build manual control interface
5. Add real-time status display

### Phase 3: File Management
1. G-code upload functionality
2. File browser interface
3. Job execution controls
4. Progress monitoring

### Phase 4: Configuration & Advanced Features
1. Configuration editor interface
2. Diagnostics and logging
3. Mobile responsiveness
4. Testing and refinement

## 📁 **Project Structure**
```
maslow/
├── SERIAL_UI_REBUILD_PLAN.md          # This file
├── maslow_serial_server.py            # Python FastAPI backend
├── start_maslow.py                    # Startup script
├── requirements.txt                   # Python dependencies
├── frontend/                          # React frontend
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── styles/
│   │   └── utils/
│   └── public/
├── config/                            # Existing config files
│   ├── maslow.yaml
│   └── preferences.json
└── scripts/                           # Existing utility scripts
    └── serial/
```

## 🎨 **UI Design Philosophy**

### Visual Style
- **Color Scheme**: Dark background with high-contrast elements
- **Typography**: Monospace fonts for technical data
- **Layout**: Grid-based, functional design
- **Controls**: Large, tactile-feeling buttons
- **Indicators**: Clear status lights and readouts

### Inspiration
- Classic CNC control panels
- Industrial control interfaces  
- Retro computing aesthetics
- Functional, no-nonsense design

### User Experience
- Immediate visual feedback for all actions
- Clear hierarchy of information
- Minimal cognitive load
- Touch-friendly controls
- Consistent interaction patterns

## 🔌 **Communication Protocol**

### Serial Commands (Preserved)
- Standard G-code commands
- FluidNC-specific commands (`$ESP420`, `$ESP410`, etc.)
- Maslow-specific calibration commands
- Real-time status queries (`?`)
- Settings commands (`$$`, `$#`)

### WebSocket Messages
- Real-time position updates
- Status changes
- Console output
- Error notifications
- Job progress updates

## 🧪 **Testing Strategy**
- Unit tests for backend API endpoints
- Integration tests for serial communication
- Frontend component testing
- End-to-end testing with actual hardware
- Performance testing for real-time updates

## 🚀 **Deployment**
- Single-command startup script
- Automatic dependency installation
- Configuration validation
- Graceful error handling
- Logging and debugging support

---

**Target Completion**: Fully functional serial-based interface replacing WiFi dependency

**Success Criteria**: 
- ✅ Reliable serial communication
- ✅ All existing functionality preserved
- ✅ Modern, responsive UI
- ✅ Easy to use and maintain
- ✅ Better performance than WiFi-based interface 