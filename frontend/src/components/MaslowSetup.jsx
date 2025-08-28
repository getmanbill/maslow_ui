import React, { useState, useEffect } from 'react'
import { Save, RotateCcw, Settings2, RotateCw } from 'lucide-react'
import './MaslowSetup.css'

const MaslowSetup = ({ api, disabled = false }) => {
  const [config, setConfig] = useState({
    // Orientation
    Maslow_vertical: false,
    
    // Frame Anchor Positions (in mm)
    Maslow_blX: 0,      // Bottom-left X
    Maslow_blY: 0,      // Bottom-left Y  
    Maslow_brX: 500,    // Bottom-right X
    Maslow_brY: 0,      // Bottom-right Y
    Maslow_tlX: 0,      // Top-left X
    Maslow_tlY: 500,    // Top-left Y
    Maslow_trX: 500,    // Top-right X
    Maslow_trY: 500,    // Top-right Y
    
    // Calibration Grid Settings
    maslow_calibration_grid_width_mm_X: 450.0,
    maslow_calibration_grid_height_mm_Y: 450.0,
    maslow_calibration_grid_size: 9,
    
    // Force Settings
    Maslow_Retract_Current_Threshold: 1300,
    Maslow_Calibration_Current_Threshold: 1300,
    
    // Extend Distance (this might need to be added to config)
    extend_distance: 100.0
  })
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  // Load current config on mount
  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    if (!api?.getConfig) return
    
    try {
      setLoading(true)
      const result = await api.getConfig()
      if (result.success && result.config) {
        setConfig(prev => ({
          ...prev,
          ...result.config
        }))
      }
    } catch (error) {
      console.error('Failed to load config:', error)
      setMessage('Failed to load configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
    setHasChanges(true)
    setMessage('')
  }

  const handleSave = async () => {
    if (!api?.updateConfig) return
    
    try {
      setLoading(true)
      const result = await api.updateConfig(config)
      if (result.success) {
        setMessage('✅ Configuration saved successfully!')
        setHasChanges(false)
      } else {
        setMessage('❌ Failed to save configuration')
      }
    } catch (error) {
      console.error('Failed to save config:', error)
      setMessage('❌ Error saving configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    loadConfig()
    setHasChanges(false)
    setMessage('Configuration reset to current values')
  }

  const handlePresetLargeFrame = () => {
    setConfig(prev => ({
      ...prev,
      // Set frame for 145cm x 139cm
      Maslow_blX: 0,
      Maslow_blY: 0,
      Maslow_brX: 1450,
      Maslow_brY: 0,
      Maslow_tlX: 0,
      Maslow_tlY: 1390,
      Maslow_trX: 1450,
      Maslow_trY: 1390,
      // Set calibration grid for 129cm x 61cm spoilboard
      maslow_calibration_grid_width_mm_X: 1200,
      maslow_calibration_grid_height_mm_Y: 500,
      // Keep vertical orientation
      Maslow_vertical: true
    }))
    setHasChanges(true)
    setMessage('Preset applied for 145cm x 139cm frame with 129cm x 61cm spoilboard')
  }

  const handleRestart = async () => {
    if (!api?.maslowCommands?.restart) return
    
    try {
      setLoading(true)
      const result = await api.maslowCommands.restart()
      if (result.success) {
        setMessage('✅ Maslow restarted successfully!')
      } else {
        setMessage('❌ Failed to restart Maslow')
      }
    } catch (error) {
      console.error('Failed to restart Maslow:', error)
      setMessage('❌ Error restarting Maslow')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="maslow-setup">
      <div className="setup-header">
        <Settings2 size={20} />
        <h3>MASLOW SETUP & CALIBRATION</h3>
      </div>

      {message && (
        <div className={`setup-message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="setup-sections">
        
        {/* Orientation Section */}
        <div className="setup-section">
          <h4>Orientation</h4>
          <div className="form-group">
            <label>
              <input
                type="radio"
                name="orientation"
                checked={!config.Maslow_vertical}
                onChange={() => handleInputChange('Maslow_vertical', false)}
                disabled={disabled || loading}
              />
              <span>Horizontal (flat on floor)</span>
            </label>
            <label>
              <input
                type="radio"
                name="orientation"
                checked={config.Maslow_vertical}
                onChange={() => handleInputChange('Maslow_vertical', true)}
                disabled={disabled || loading}
              />
              <span>Vertical (upright against wall)</span>
            </label>
          </div>
        </div>

        {/* Frame Dimensions Section */}
        <div className="setup-section">
          <h4>Frame Anchor Positions</h4>
          <div className="form-group">
            <div className="frame-grid">
              <div className="anchor-group">
                <span className="anchor-label">Top-Left (TL)</span>
                <div className="coordinate-inputs">
                  <label>
                    X: <input
                      type="number"
                      value={config.Maslow_tlX}
                      onChange={(e) => handleInputChange('Maslow_tlX', parseFloat(e.target.value) || 0)}
                      disabled={disabled || loading}
                      min="0"
                      step="10"
                    />
                  </label>
                  <label>
                    Y: <input
                      type="number"
                      value={config.Maslow_tlY}
                      onChange={(e) => handleInputChange('Maslow_tlY', parseFloat(e.target.value) || 0)}
                      disabled={disabled || loading}
                      min="0"
                      step="10"
                    />
                  </label>
                </div>
              </div>
              
              <div className="anchor-group">
                <span className="anchor-label">Top-Right (TR)</span>
                <div className="coordinate-inputs">
                  <label>
                    X: <input
                      type="number"
                      value={config.Maslow_trX}
                      onChange={(e) => handleInputChange('Maslow_trX', parseFloat(e.target.value) || 0)}
                      disabled={disabled || loading}
                      min="0"
                      step="10"
                    />
                  </label>
                  <label>
                    Y: <input
                      type="number"
                      value={config.Maslow_trY}
                      onChange={(e) => handleInputChange('Maslow_trY', parseFloat(e.target.value) || 0)}
                      disabled={disabled || loading}
                      min="0"
                      step="10"
                    />
                  </label>
                </div>
              </div>
              
              <div className="anchor-group">
                <span className="anchor-label">Bottom-Left (BL)</span>
                <div className="coordinate-inputs">
                  <label>
                    X: <input
                      type="number"
                      value={config.Maslow_blX}
                      onChange={(e) => handleInputChange('Maslow_blX', parseFloat(e.target.value) || 0)}
                      disabled={disabled || loading}
                      min="0"
                      step="10"
                    />
                  </label>
                  <label>
                    Y: <input
                      type="number"
                      value={config.Maslow_blY}
                      onChange={(e) => handleInputChange('Maslow_blY', parseFloat(e.target.value) || 0)}
                      disabled={disabled || loading}
                      min="0"
                      step="10"
                    />
                  </label>
                </div>
              </div>
              
              <div className="anchor-group">
                <span className="anchor-label">Bottom-Right (BR)</span>
                <div className="coordinate-inputs">
                  <label>
                    X: <input
                      type="number"
                      value={config.Maslow_brX}
                      onChange={(e) => handleInputChange('Maslow_brX', parseFloat(e.target.value) || 0)}
                      disabled={disabled || loading}
                      min="0"
                      step="10"
                    />
                  </label>
                  <label>
                    Y: <input
                      type="number"
                      value={config.Maslow_brY}
                      onChange={(e) => handleInputChange('Maslow_brY', parseFloat(e.target.value) || 0)}
                      disabled={disabled || loading}
                      min="0"
                      step="10"
                    />
                  </label>
                </div>
              </div>
            </div>
            <p className="field-description">
              Physical positions of your frame anchor points in millimeters. For your 145cm x 139cm frame:
              TL(0,1390), TR(1450,1390), BL(0,0), BR(1450,0)
            </p>
          </div>
        </div>

        {/* Extend Distance Section */}
        <div className="setup-section">
          <h4>Extend Distance</h4>
          <div className="form-group">
            <label>
              Distance (mm):
              <input
                type="number"
                value={config.extend_distance}
                onChange={(e) => handleInputChange('extend_distance', parseFloat(e.target.value) || 0)}
                disabled={disabled || loading}
                min="0"
                step="1"
              />
            </label>
            <p className="field-description">
              Distance the belts extend during setup and calibration
            </p>
          </div>
        </div>

        {/* Calibration Grid Section */}
        <div className="setup-section">
          <h4>Calibration Grid</h4>
          <div className="form-group">
            <label>
              Grid Width (mm):
              <input
                type="number"
                value={config.maslow_calibration_grid_width_mm_X}
                onChange={(e) => handleInputChange('maslow_calibration_grid_width_mm_X', parseFloat(e.target.value) || 0)}
                disabled={disabled || loading}
                min="100"
                step="10"
              />
            </label>
            <label>
              Grid Height (mm):
              <input
                type="number"
                value={config.maslow_calibration_grid_height_mm_Y}
                onChange={(e) => handleInputChange('maslow_calibration_grid_height_mm_Y', parseFloat(e.target.value) || 0)}
                disabled={disabled || loading}
                min="100"
                step="10"
              />
            </label>
            <p className="field-description">
              Size of calibration grid. Should fit entirely within safe movement area.
              Smaller grids are faster, larger grids potentially more precise.
            </p>
          </div>
        </div>

        {/* Grid Size Section */}
        <div className="setup-section">
          <h4>Grid Resolution</h4>
          <div className="form-group">
            <label>
              Measurement Points:
              <select
                value={config.maslow_calibration_grid_size}
                onChange={(e) => handleInputChange('maslow_calibration_grid_size', parseInt(e.target.value))}
                disabled={disabled || loading}
              >
                <option value={4}>4 points (2x2 - fastest)</option>
                <option value={9}>9 points (3x3 - balanced)</option>
                <option value={16}>16 points (4x4 - precise)</option>
                <option value={25}>25 points (5x5 - most precise)</option>
              </select>
            </label>
            <p className="field-description">
              Number of measurement points for calibration. More points = slower but potentially more accurate.
            </p>
          </div>
        </div>

        {/* Force Settings Section */}
        <div className="setup-section">
          <h4>Force Settings</h4>
          <div className="form-group">
            <label>
              Retraction Force:
              <input
                type="number"
                value={config.Maslow_Retract_Current_Threshold}
                onChange={(e) => handleInputChange('Maslow_Retract_Current_Threshold', parseInt(e.target.value) || 0)}
                disabled={disabled || loading}
                min="500"
                max="3000"
                step="50"
              />
            </label>
            <p className="field-description">
              How hard the machine pulls when retracting belts for storage.
              Increase if belts don't retract reliably. Too high can strain the machine.
            </p>
            
            <label>
              Calibration Force:
              <input
                type="number"
                value={config.Maslow_Calibration_Current_Threshold}
                onChange={(e) => handleInputChange('Maslow_Calibration_Current_Threshold', parseInt(e.target.value) || 0)}
                disabled={disabled || loading}
                min="500"
                max="3000"
                step="50"
              />
            </label>
            <p className="field-description">
              Belt tension during calibration measurements. Lower values may be more precise
              but must be high enough for accurate measurements.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="setup-actions">
        <button
          className="setup-btn preset"
          onClick={handlePresetLargeFrame}
          disabled={disabled || loading}
          title="Apply preset for 145cm x 139cm frame"
        >
          <Settings2 size={16} />
          Large Frame Preset
        </button>
        
        <button
          className="setup-btn reset"
          onClick={handleReset}
          disabled={disabled || loading || !hasChanges}
          title="Reset to current saved values"
        >
          <RotateCcw size={16} />
          Reset
        </button>
        
        <button
          className="setup-btn save"
          onClick={handleSave}
          disabled={disabled || loading || !hasChanges}
          title="Save configuration changes"
        >
          <Save size={16} />
          {loading ? 'Saving...' : 'Save Config'}
        </button>
        
        <button
          className="setup-btn restart"
          onClick={handleRestart}
          disabled={disabled || loading}
          title="Restart Maslow to reload current configuration"
        >
          <RotateCw size={16} />
          Restart Maslow
        </button>
      </div>
    </div>
  )
}

export default MaslowSetup 