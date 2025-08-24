# Maslow CNC Serial Interface

A modern, reliable serial-based interface for your Maslow CNC machine. No more WiFi connection issues!

## 🚀 Quick Start

1. **Run the interface:**
   ```bash
   ./start_maslow.py
   ```

2. **That's it!** The script will:
   - Check and install dependencies
   - Find your Maslow's serial port
   - Start the backend server
   - Launch the frontend
   - Open your browser automatically

## 📋 Requirements

- **Python 3.8+** (for the backend)
- **Node.js 16+** (for the frontend)
- **Maslow CNC** connected via USB serial

## 🔧 What This Interface Provides

### ✅ All Original Maslow Commands
- **Retract All** - Retract all anchor chains
- **Extend All** - Extend all anchor chains  
- **Apply Tension** - Apply tension to chains
- **Release Tension** - Release chain tension
- **Find Anchor Locations** - Calibration routine
- **Stop** - Emergency stop
- **Test** - System test routines
- **Set Z-Stop** - Set Z-axis bottom limit

### ✅ Modern Features
- **Real-time WebSocket communication** - No polling, instant updates
- **Responsive design** - Works on desktop, tablet, and mobile
- **Dark CNC theme** - Easy on the eyes, professional look
- **File management** - Upload and manage G-code files
- **Live position display** - Real-time X, Y, Z coordinates
- **Configuration editor** - Edit `maslow.yaml` from the web interface
- **Serial console** - Direct access to machine communication

### ✅ Reliability Improvements
- **No WiFi dependency** - Direct serial connection
- **Automatic reconnection** - Handles serial port disconnections
- **Error handling** - Clear error messages and recovery
- **Process monitoring** - Automatic restart of failed services

## 📁 Project Structure

```
maslow/
├── start_maslow.py              # 🚀 Main startup script
├── backend/                     # Python FastAPI server
│   ├── maslow_serial_server.py  # Main server code
│   └── requirements.txt         # Python dependencies
├── frontend/                    # React + Vite interface
│   ├── src/                     # Source code
│   ├── package.json             # Node.js dependencies
│   └── vite.config.js           # Build configuration
└── config/                      # Your existing config files
    ├── maslow.yaml              # Machine configuration
    └── preferences.json         # UI preferences
```

## 🎨 Interface Design

The interface features a **flat, dark design** reminiscent of classic CNC control panels:

- **Color Scheme**: Dark backgrounds with high-contrast elements
- **Typography**: Monospace fonts for technical data
- **Layout**: Grid-based, functional design
- **Controls**: Large, tactile-feeling buttons
- **Status Indicators**: Clear LED-style status lights

## 🔌 Connection Details

- **Backend Server**: `http://localhost:8000`
- **Frontend Interface**: `http://localhost:3000`
- **WebSocket**: `ws://localhost:8000/ws`
- **Serial Port**: Auto-detected (usually `/dev/cu.usbmodem12201`)

## 🛠️ Manual Setup (if needed)

If you want to run components separately:

### Backend Only:
```bash
cd backend
pip install -r requirements.txt
uvicorn maslow_serial_server:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Only:
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Troubleshooting

### Serial Port Issues
- Make sure your Maslow is connected via USB
- Check that no other software is using the serial port
- Try unplugging and reconnecting the USB cable

### Dependencies
- **Python issues**: Make sure you have Python 3.8 or later
- **Node.js issues**: Install Node.js from [nodejs.org](https://nodejs.org)
- **Permission issues**: Run `chmod +x start_maslow.py`

### Port Conflicts
If ports 3000 or 8000 are in use:
- Edit `frontend/vite.config.js` to change the frontend port
- Edit `backend/maslow_serial_server.py` to change the backend port

## 📊 Monitoring

The startup script provides real-time monitoring:
- **[BACKEND]** - Server logs and API requests
- **[FRONTEND]** - Build output and hot reload status
- **Serial connection status** - Connection state and errors

## 🚪 Stopping the Interface

Press **Ctrl+C** in the terminal running `start_maslow.py`. This will:
- Gracefully shut down both servers
- Close the serial connection
- Clean up all processes

## 🆚 vs WiFi Interface

| Feature | WiFi Interface | Serial Interface |
|---------|----------------|------------------|
| Connection | Unreliable | Rock solid |
| Speed | Variable | Consistent |
| Setup | Complex | One command |
| Debugging | Difficult | Easy |
| Mobile | Limited | Full support |
| Modern UI | No | Yes |

## 🔄 Migration from WiFi

Your existing configuration is preserved:
- `maslow.yaml` settings are automatically loaded
- `preferences.json` is respected
- All calibration data is maintained
- No need to reconfigure your machine

---

**Enjoy your reliable, modern Maslow interface!** 🎉 