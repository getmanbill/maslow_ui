import React from 'react'
import { 
  ArrowDown, 
  ArrowUp, 
  ArrowLeftRight, 
  RotateCcw, 
  Target, 
  Zap, 
  Minus,
  Unlock
} from 'lucide-react'
import './MaslowControls.css'

const MaslowControls = ({ onCommand, disabled = false }) => {
  const handleCommand = (commandName, apiCall) => {
    if (disabled) return
    onCommand(commandName, apiCall)
  }

  const commands = [
    {
      id: 'retract_all',
      label: 'RETRACT ALL',
      description: 'Retract all anchor chains',
      className: 'maslow-btn retract',
      icon: ArrowDown
    },
    {
      id: 'extend_all', 
      label: 'EXTEND ALL',
      description: 'Extend all anchor chains',
      className: 'maslow-btn extend',
      icon: ArrowUp
    },
    {
      id: 'apply_tension',
      label: 'APPLY TENSION',
      description: 'Apply tension to chains',
      className: 'maslow-btn tension',
      icon: ArrowLeftRight
    },
    {
      id: 'release_tension',
      label: 'RELEASE TENSION', 
      description: 'Release chain tension',
      className: 'maslow-btn release',
      icon: RotateCcw
    },
    {
      id: 'find_anchors',
      label: 'FIND ANCHORS',
      description: 'Calibration routine',
      className: 'maslow-btn calibrate',
      icon: Target
    },
    {
      id: 'test',
      label: 'TEST',
      description: 'Run system tests',
      className: 'maslow-btn test',
      icon: Zap
    },
    {
      id: 'set_z_stop',
      label: 'SET Z-STOP',
      description: 'Set Z-axis bottom limit',
      className: 'maslow-btn z-stop',
      icon: Minus
    }
  ]

  const emergencyCommands = [
    {
      id: 'unlock',
      label: 'UNLOCK',
      description: 'Clear alarms ($X)',
      className: 'emergency-btn unlock', 
      icon: Unlock
    }
  ]

  return (
    <div className="maslow-controls">
      <div className="controls-header">
        <h3>MASLOW COMMANDS</h3>
      </div>
      
      {/* Maslow-specific commands */}
      <div className="command-grid">
        {commands.map(cmd => {
          const IconComponent = cmd.icon
          return (
            <button
              key={cmd.id}
              className={`${cmd.className}`}
              onClick={() => handleCommand(cmd.id, cmd.id)}
              disabled={disabled}
              title={cmd.description}
            >
              <span className="cmd-icon">
                <IconComponent size={18} />
              </span>
              <span className="cmd-label">{cmd.label}</span>
            </button>
          )
        })}
      </div>

      {/* Emergency controls */}
      <div className="emergency-section">
        <div className="section-divider">
          <span>EMERGENCY CONTROLS</span>
        </div>
        <div className="emergency-grid">
          {emergencyCommands.map(cmd => {
            const IconComponent = cmd.icon
            return (
              <button
                key={cmd.id}
                className={`${cmd.className}`}
                onClick={() => handleCommand(cmd.id, cmd.id)}
                disabled={false}
                title={cmd.description}
              >
                <span className="cmd-icon">
                  <IconComponent size={18} />
                </span>
                <span className="cmd-label">{cmd.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default MaslowControls 