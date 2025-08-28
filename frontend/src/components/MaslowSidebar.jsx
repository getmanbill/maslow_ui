import React, { useState } from 'react'
import { Settings, X, Wrench, Sliders } from 'lucide-react'
import MaslowControls from './MaslowControls'
import MaslowSetup from './MaslowSetup'
import './MaslowSidebar.css'

const MaslowSidebar = ({ onCommand, disabled, api }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('controls')

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const tabs = [
    { id: 'controls', label: 'Controls', icon: Wrench },
    { id: 'setup', label: 'Setup', icon: Sliders }
  ]

  return (
    <>
      {/* Toggle Button */}
      <button 
        className={`sidebar-toggle ${isOpen ? 'open' : ''}`}
        onClick={toggleSidebar}
        title={isOpen ? 'Close Maslow Panel' : 'Open Maslow Panel'}
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
          <h3>MASLOW PANEL</h3>
          <button 
            className="close-btn"
            onClick={toggleSidebar}
            title="Close Sidebar"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="sidebar-tabs">
          {tabs.map(tab => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
              >
                <IconComponent size={16} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
        
        <div className="sidebar-content">
          {activeTab === 'controls' && (
            <MaslowControls
              onCommand={onCommand}
              disabled={disabled}
            />
          )}
          
          {activeTab === 'setup' && (
            <MaslowSetup
              api={api}
              disabled={disabled}
            />
          )}
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