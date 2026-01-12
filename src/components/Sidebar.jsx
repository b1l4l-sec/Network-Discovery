import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Settings, 
  Download, 
  RefreshCw, 
  Radar,
  Network,
  Shield,
  Activity,
  Terminal,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

const Sidebar = ({ 
  isScanning, 
  onStartScan, 
  onStopScan,
  ipRange, 
  setIpRange, 
  portRange, 
  setPortRange,
  onExport,
  onRefresh,
  scanResults,
  isCollapsed,
  setIsCollapsed,
  isMobile
}) => {
  const [advancedSettings, setAdvancedSettings] = useState(false);
  const [scanType, setScanType] = useState('quick');
  const [timing, setTiming] = useState('normal');

  const presetRanges = [
    { label: 'Local Network', value: '192.168.1.0/24' },
    { label: 'Extended Local', value: '192.168.0.0/16' },
    { label: 'Class C', value: '10.0.0.0/24' },
    { label: 'Single Host', value: '192.168.1.1' },
  ];

  const presetPorts = [
    { label: 'Common Ports', value: '1-1024' },
    { label: 'Web Services', value: '80,443,8080,8443' },
    { label: 'All Ports', value: '1-65535' },
    { label: 'Top 100', value: '1-100' },
  ];

  return (
    <>
      {/* Desktop Collapse Button */}
      {!isMobile && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="fixed top-4 left-4 z-50 p-2 bg-dark-800 border border-dark-700 rounded-lg text-white hover:bg-dark-700 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ 
          width: isCollapsed ? 0 : isMobile ? '100%' : 320,
          opacity: isCollapsed ? 0 : 1
        }}
        transition={{ duration: 0.3 }}
        className={`
          fixed left-0 top-0 h-full bg-dark-900 border-r border-dark-700 overflow-hidden
          ${isMobile ? 'z-40' : 'z-40'}
        `}
      >
        <div className="p-4 lg:p-6 h-full overflow-y-auto">
          {/* Mobile Header with Close Button */}
          {isMobile && (
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Network Scanner</h2>
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-2 bg-dark-800 border border-dark-700 rounded-lg text-white hover:bg-dark-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Header */}
          <div className={`flex items-center gap-3 mb-8 ${isMobile ? '' : 'mt-12'}`}>
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <Terminal className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-bold text-white">Network Scanner</h1>
              <p className="text-sm text-dark-400">Professional Dashboard</p>
            </div>
          </div>

          {/* Scan Controls */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Network className="w-4 h-4" />
                Scan Configuration
              </h3>
              
              {/* IP Range */}
              <div className="space-y-2 mb-4">
                <label className="text-sm text-dark-300">IP Range</label>
                <input
                  type="text"
                  value={ipRange}
                  onChange={(e) => setIpRange(e.target.value)}
                  placeholder="192.168.1.0/24"
                  disabled={isScanning}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white text-sm focus:border-primary-500 focus:outline-none disabled:opacity-50"
                />
                <div className="grid grid-cols-2 gap-1">
                  {presetRanges.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setIpRange(preset.value)}
                      disabled={isScanning}
                      className="text-xs px-2 py-1 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded text-dark-300 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Port Range */}
              <div className="space-y-2 mb-4">
                <label className="text-sm text-dark-300">Port Range</label>
                <input
                  type="text"
                  value={portRange}
                  onChange={(e) => setPortRange(e.target.value)}
                  placeholder="1-1024"
                  disabled={isScanning}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white text-sm focus:border-primary-500 focus:outline-none disabled:opacity-50"
                />
                <div className="grid grid-cols-2 gap-1">
                  {presetPorts.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setPortRange(preset.value)}
                      disabled={isScanning}
                      className="text-xs px-2 py-1 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded text-dark-300 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Settings Toggle */}
              <button
                onClick={() => setAdvancedSettings(!advancedSettings)}
                className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 mb-3"
              >
                <Settings className="w-4 h-4" />
                Advanced Settings
              </button>

              {/* Advanced Settings */}
              {advancedSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3 mb-4 p-3 bg-dark-800 rounded-lg border border-dark-700"
                >
                  <div>
                    <label className="text-xs text-dark-400 mb-1 block">Scan Type</label>
                    <select
                      value={scanType}
                      onChange={(e) => setScanType(e.target.value)}
                      className="w-full px-2 py-1 bg-dark-700 border border-dark-600 rounded text-white text-sm"
                    >
                      <option value="quick">Quick Scan</option>
                      <option value="comprehensive">Comprehensive</option>
                      <option value="stealth">Stealth Scan</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-dark-400 mb-1 block">Timing</label>
                    <select
                      value={timing}
                      onChange={(e) => setTiming(e.target.value)}
                      className="w-full px-2 py-1 bg-dark-700 border border-dark-600 rounded text-white text-sm"
                    >
                      <option value="slow">Slow & Quiet</option>
                      <option value="normal">Normal</option>
                      <option value="fast">Fast</option>
                      <option value="aggressive">Aggressive</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Scan Button */}
            <button
              onClick={isScanning ? onStopScan : onStartScan}
              disabled={!ipRange || !portRange}
              className={`
                w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200
                ${isScanning 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                }
              `}
            >
              {isScanning ? (
                <>
                  <Pause className="w-5 h-5" />
                  Stop Scan
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start Scan
                </>
              )}
            </button>

            {/* Scan Status */}
            {isScanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Radar className="w-4 h-4 text-primary-400 animate-spin" />
                  <span className="text-sm font-medium text-primary-300">Scanning Network...</span>
                </div>
                <div className="text-xs text-primary-400">
                  Range: {ipRange} | Ports: {portRange}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={onRefresh}
                className="w-full flex items-center gap-2 px-3 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg text-white text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Status
              </button>
              
              <button
                onClick={onExport}
                disabled={!scanResults}
                className="w-full flex items-center gap-2 px-3 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg text-white text-sm transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Export Results
              </button>
            </div>

            {/* Stats */}
            {scanResults && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Scan Statistics
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-dark-800 rounded-lg border border-dark-700">
                    <div className="text-lg font-bold text-primary-400">
                      {scanResults.parsedResults?.length || 0}
                    </div>
                    <div className="text-xs text-dark-400">Hosts Found</div>
                  </div>
                  
                  <div className="p-3 bg-dark-800 rounded-lg border border-dark-700">
                    <div className="text-lg font-bold text-cyan-400">
                      {scanResults.parsedResults?.reduce((acc, host) => acc + host.ports.length, 0) || 0}
                    </div>
                    <div className="text-xs text-dark-400">Open Ports</div>
                  </div>
                </div>
                
                <div className="p-3 bg-dark-800 rounded-lg border border-dark-700">
                  <div className="text-xs text-dark-400 mb-1">Scan Duration</div>
                  <div className="text-sm font-mono text-white">{scanResults.scanDuration}</div>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium text-yellow-300 mb-1">Security Notice</div>
                  <div className="text-xs text-yellow-400/80">
                    Only scan networks you own or have permission to test.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;