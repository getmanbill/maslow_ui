import React, { useEffect } from 'react'
import { Unlock } from 'lucide-react'
import './StatusDisplay.css'

const StatusDisplay = ({ status, position, feedRate, onUnlock, loading }) => {
  // Add logging to track status updates
  useEffect(() => {
    console.log('StatusDisplay - Props updated:', {
      status,
      position,
      feedRate,
      timestamp: new Date().toISOString()
    })
  }, [status, position, feedRate])

  const formatPosition = (value) => {
    return typeof value === 'number' ? value.toFixed(3) : '0.000'
  }

  const getStatusColor = (status) => {
    console.log('StatusDisplay - Getting color for status:', status)
    switch (status?.toLowerCase()) {
      case 'idle':
        return 'status-idle'
      case 'run':
        return 'status-running'
      case 'hold':
        return 'status-hold'
      case 'alarm':
        return 'status-alarm'
      case 'connected':
        return 'status-connected'
      default:
        console.log('StatusDisplay - Unknown status, using default:', status)
        return 'status-unknown'
    }
  }

  const isAlarmState = status?.toLowerCase() === 'alarm'

  return (
    <div className="status-display">
      <div className="status-header">
        <h3>MACHINE STATUS</h3>
        <div className={`machine-state ${getStatusColor(status)}`}>
          {status || 'UNKNOWN'}
        </div>
      </div>

      {/* Alarm Unlock Button */}
      {isAlarmState && (
        <div className="alarm-section">
          <div className="alarm-message">
            <span>⚠️ Machine is in alarm state and needs to be unlocked</span>
          </div>
          <button 
            className={`unlock-btn ${loading ? 'loading' : ''}`}
            onClick={onUnlock}
            disabled={loading}
            title="Send $X command to clear alarm state"
          >
            <Unlock size={16} />
            <span>UNLOCK MACHINE</span>
          </button>
        </div>
      )}
      
      {/* Position Display */}
      <div className="position-section">
        <div className="section-title">POSITION (mm)</div>
        <div className="position-grid">
          <div className="axis-display">
            <span className="axis-label">X</span>
            <span className="axis-value">{formatPosition(position?.x)}</span>
          </div>
          <div className="axis-display">
            <span className="axis-label">Y</span>
            <span className="axis-value">{formatPosition(position?.y)}</span>
          </div>
          <div className="axis-display">
            <span className="axis-label">Z</span>
            <span className="axis-value">{formatPosition(position?.z)}</span>
          </div>
        </div>
      </div>

      {/* Feed Rate */}
      <div className="rates-section">
        <div className="section-title">FEED RATE</div>
        <div className="rates-grid">
          <div className="rate-display">
            <span className="rate-label">FEED</span>
            <span className="rate-value">{feedRate || 0}</span>
            <span className="rate-unit">mm/min</span>
          </div>
        </div>
      </div>

      {/* Work Coordinates Display */}
      <div className="coordinates-section">
        <div className="section-title">WORK COORDINATES</div>
        <div className="coord-info">
          <div className="coord-item">
            <span>Work Area:</span>
            <span>500 × 500 mm</span>
          </div>
          <div className="coord-item">
            <span>Origin:</span>
            <span>Bottom Left</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatusDisplay 