import React, { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Home, Target } from 'lucide-react'
import './JogControls.css'

const JogControls = ({ onJog, onHome, onSetOrigin, disabled = false }) => {
  const [selectedDistance, setSelectedDistance] = useState(10)
  const [feedRate, setFeedRate] = useState(1000)
  
  const distances = [0.1, 1, 10, 100]

  const handleJog = (axis, direction) => {
    if (disabled) return
    
    const distance = direction * selectedDistance
    onJog(axis, distance, feedRate)
  }

  const handleXYHome = () => {
    if (disabled) return
    onHome('XY')
  }

  const handleZHome = () => {
    if (disabled) return
    onHome('Z')
  }

  const handleSetXYOrigin = () => {
    if (disabled) return
    onSetOrigin('XY')
  }

  const handleSetZOrigin = () => {
    if (disabled) return
    onSetOrigin('Z')
  }

  return (
    <div className="jog-controls">
      <div className="control-sections">
        {/* XY Axis Section */}
        <div className="axis-section xy-section">
          <div className="section-header">
            <h4>X/Y AXIS</h4>
          </div>
          <div className="xy-controls">
            <div className="xy-jog-grid">
              <div className="jog-spacer"></div>
              <button 
                className="jog-btn xy-btn"
                onMouseDown={() => handleJog('Y', 1)}
                disabled={disabled}
              >
                <ChevronUp size={28} />
                <span>Y+</span>
              </button>
              <div className="jog-spacer"></div>

              <button 
                className="jog-btn xy-btn"
                onMouseDown={() => handleJog('X', -1)}
                disabled={disabled}
              >
                <ChevronLeft size={28} />
                <span>X-</span>
              </button>
              <button 
                className="jog-btn home-btn"
                onClick={handleXYHome}
                disabled={disabled}
              >
                <Home size={28} />
                <span>HOME</span>
              </button>
              <button 
                className="jog-btn xy-btn"
                onMouseDown={() => handleJog('X', 1)}
                disabled={disabled}
              >
                <ChevronRight size={28} />
                <span>X+</span>
              </button>

              <div className="jog-spacer"></div>
              <button 
                className="jog-btn xy-btn"
                onMouseDown={() => handleJog('Y', -1)}
                disabled={disabled}
              >
                <ChevronDown size={28} />
                <span>Y-</span>
              </button>
              <div className="jog-spacer"></div>
            </div>
          </div>
          <button 
            className="origin-btn"
            onClick={handleSetXYOrigin}
            disabled={disabled}
          >
            <Target size={24} />
            <span>SET ORIGIN</span>
          </button>
        </div>

        {/* Z Axis Section */}
        <div className="axis-section z-section">
          <div className="section-header">
            <h4>Z AXIS</h4>
          </div>
          <div className="z-controls">
            <div className="z-jog-buttons">
              <button 
                className="jog-btn z-btn"
                onMouseDown={() => handleJog('Z', 1)}
                disabled={disabled}
              >
                <ChevronUp size={28} />
                <span>Z+</span>
              </button>
              <button 
                className="jog-btn z-btn"
                onMouseDown={() => handleJog('Z', -1)}
                disabled={disabled}
              >
                <ChevronDown size={28} />
                <span>Z-</span>
              </button>
            </div>
            <button 
              className="action-btn home-btn"
              onClick={handleZHome}
              disabled={disabled}
            >
              <Home size={24} />
              <span>HOME</span>
            </button>
          </div>
          <button 
            className="origin-btn"
            onClick={handleSetZOrigin}
            disabled={disabled}
          >
            <Target size={24} />
            <span>SET ORIGIN</span>
          </button>
        </div>
      </div>

      <div className="bottom-controls">
        <div className="feed-rate-control">
          <label>FEED RATE</label>
          <input
            type="number"
            value={feedRate}
            onChange={(e) => setFeedRate(parseInt(e.target.value))}
            min="1"
            max="5000"
            step="100"
            disabled={disabled}
          />
          <span>mm/min</span>
        </div>

        <div className="distance-controls">
          <label>JOG DISTANCE</label>
          <div className="distance-buttons">
            {distances.map(distance => (
              <button
                key={distance}
                className={`distance-btn ${selectedDistance === distance ? 'active' : ''}`}
                onClick={() => setSelectedDistance(distance)}
                disabled={disabled}
              >
                {distance}mm
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default JogControls 