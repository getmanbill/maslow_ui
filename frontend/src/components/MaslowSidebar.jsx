import React, { useState } from 'react'
import { Settings, X } from 'lucide-react'
import MaslowControls from './MaslowControls'
import './MaslowSidebar.css'

const MaslowSidebar = ({ onCommand, disabled, loading }) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Toggle Button */}
      <button 
        className={`sidebar-toggle ${isOpen ? 'open' : ''}`}
        onClick={toggleSidebar}
        title={isOpen ? 'Close Maslow Controls' : 'Open Maslow Controls'}
      >
        <span className="toggle-icon">
          {isOpen ? <X size={18} /> : <Settings size={18} />}
        </span>
        <span className="toggle-text">
          {isOpen ? 'CLOSE' : 'MASLOW'}
        </span>
      </button>

      {/* Sidebar */}
      <div className={`maslow-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>MASLOW CONTROLS</h3>
          <button 
            className="close-btn"
            onClick={toggleSidebar}
            title="Close Sidebar"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="sidebar-content">
          <MaslowControls
            onCommand={onCommand}
            disabled={disabled}
            loading={loading}
          />
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={toggleSidebar}
        />
      )}
    </>
  )
}

export default MaslowSidebar 