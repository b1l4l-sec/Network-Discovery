import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { 
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff,
  Search,
  Filter,
  Grid,
  List,
  Menu
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import HostCard from './components/HostCard';
import NetworkTopology from './components/NetworkTopology';

const API_BASE_URL = 'http://localhost:3001/api';

function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [ipRange, setIpRange] = useState('192.168.1.0/24');
  const [portRange, setPortRange] = useState('1-1024');
  const [error, setError] = useState(null);
  const [apiHealth, setApiHealth] = useState(null);
  const [rawOutput, setRawOutput] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'topology'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'web', 'devices'
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check API health on component mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const health = await response.json();
      setApiHealth(health);
      
      if (health.status === 'ok') {
        toast.success('API connection established');
      }
    } catch (err) {
      setApiHealth({ status: 'error', nmapAvailable: false, error: 'API not reachable' });
      toast.error('Failed to connect to API');
    }
  };

  const startScan = async () => {
    if (!apiHealth?.nmapAvailable) {
      setError('Nmap is not available. Please install Nmap first.');
      toast.error('Nmap not available');
      return;
    }

    setIsScanning(true);
    setError(null);
    setScanResults(null);
    setRawOutput('');
    
    toast.loading('Starting network scan...', { id: 'scan' });

    try {
      const response = await fetch(
        `${API_BASE_URL}/scan?range=${encodeURIComponent(ipRange)}&ports=${encodeURIComponent(portRange)}`
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Scan failed');
      }

      setScanResults(data.data);
      setRawOutput(data.data.rawOutput);
      
      toast.success(`Scan completed! Found ${data.data.parsedResults.length} hosts`, { id: 'scan' });
      
    } catch (err) {
      setError(err.message);
      toast.error(`Scan failed: ${err.message}`, { id: 'scan' });
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const stopScan = () => {
    setIsScanning(false);
    toast.success('Scan stopped');
  };

  const exportResults = () => {
    if (!scanResults) return;
    
    const exportData = {
      ...scanResults,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nmap-scan-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Results exported successfully');
  };

  // Filter and search hosts
  const filteredHosts = scanResults?.parsedResults?.filter(host => {
    const matchesSearch = !searchTerm || 
      host.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      host.hostname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      host.vendor?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === 'all' || 
      (filterType === 'web' && host.ports.some(p => [80, 443, 8080, 8443].includes(p.port))) ||
      (filterType === 'devices' && host.hostname);

    return matchesSearch && matchesFilter;
  }) || [];

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#ffffff',
            border: '1px solid #334155'
          }
        }}
      />
      
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      {/* Sidebar */}
      <Sidebar
        isScanning={isScanning}
        onStartScan={startScan}
        onStopScan={stopScan}
        ipRange={ipRange}
        setIpRange={setIpRange}
        portRange={portRange}
        setPortRange={setPortRange}
        onExport={exportResults}
        onRefresh={checkApiHealth}
        scanResults={scanResults}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <div 
        className="transition-all duration-300"
        style={{ 
          marginLeft: isCollapsed || isMobile ? 0 : 320,
          paddingLeft: isMobile ? 0 : undefined
        }}
      >
        {/* Header */}
        <div className="bg-dark-900 border-b border-dark-700 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              {isMobile && (
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="p-2 bg-dark-800 border border-dark-700 rounded-lg text-white hover:bg-dark-700 transition-colors md:hidden"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              
              <div style={{ marginLeft: !isMobile && isCollapsed ? '60px' : '0' }}>
                <h1 className="text-xl lg:text-2xl font-bold text-white mb-2">
                  Network Discovery Dashboard
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  {apiHealth?.status === 'ok' ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">API Online</span>
                      {apiHealth.nmapAvailable ? (
                        <span className="text-xs text-green-300">• Nmap Ready</span>
                      ) : (
                        <span className="text-xs text-red-300">• Nmap Missing</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400">
                      <WifiOff className="w-4 h-4" />
                      <span className="text-sm">API Offline</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2 lg:gap-4">
              {scanResults && (
                <>
                  {/* Search - Hidden on small screens */}
                  <div className="relative hidden sm:block">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400" />
                    <input
                      type="text"
                      placeholder="Search hosts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white text-sm focus:border-primary-500 focus:outline-none w-32 lg:w-48"
                    />
                  </div>

                  {/* Filter - Simplified on mobile */}
                  <div className="relative">
                    <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 sm:block hidden" />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="pl-3 sm:pl-10 pr-8 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white text-sm focus:border-primary-500 focus:outline-none appearance-none"
                    >
                      <option value="all">All</option>
                      <option value="web">Web</option>
                      <option value="devices">Named</option>
                    </select>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex bg-dark-800 border border-dark-600 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-white'}`}
                      title="Grid View"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('topology')}
                      className={`p-2 rounded ${viewMode === 'topology' ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-white'}`}
                      title="Topology View"
                    >
                      <Wifi className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          {scanResults && (
            <div className="mt-4 sm:hidden">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search hosts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6">
          {/* Error Banner */}
          <AnimatePresence>
            {!apiHealth?.nmapAvailable && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-300 mb-1">Nmap Not Available</h3>
                  <p className="text-yellow-400/80 text-sm mb-2">
                    Please install Nmap to use this network scanner.
                  </p>
                  <div className="text-xs text-yellow-400/60">
                    <strong>Installation:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• <strong>Windows:</strong> Download from nmap.org</li>
                      <li>• <strong>macOS:</strong> brew install nmap</li>
                      <li>• <strong>Linux:</strong> sudo apt-get install nmap</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-300 mb-1">Scan Error</h3>
                  <p className="text-red-400/80 text-sm">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          {scanResults && (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
                  <div className="text-xl lg:text-2xl font-bold text-primary-400">
                    {filteredHosts.length}
                  </div>
                  <div className="text-sm text-dark-400">Hosts Found</div>
                </div>
                <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
                  <div className="text-xl lg:text-2xl font-bold text-cyan-400">
                    {filteredHosts.reduce((acc, host) => acc + host.ports.length, 0)}
                  </div>
                  <div className="text-sm text-dark-400">Open Ports</div>
                </div>
                <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
                  <div className="text-xl lg:text-2xl font-bold text-purple-400">
                    {filteredHosts.filter(h => h.ports.some(p => [80, 443, 8080, 8443].includes(p.port))).length}
                  </div>
                  <div className="text-sm text-dark-400">Web Services</div>
                </div>
                <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
                  <div className="text-xl lg:text-2xl font-bold text-orange-400">
                    {scanResults.scanDuration}
                  </div>
                  <div className="text-sm text-dark-400">Scan Duration</div>
                </div>
              </div>

              {/* Content based on view mode */}
              {viewMode === 'topology' ? (
                <NetworkTopology hosts={filteredHosts} isScanning={isScanning} />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                  {filteredHosts.map((host, index) => (
                    <HostCard key={host.ip} host={host} index={index} />
                  ))}
                </div>
              )}

              {filteredHosts.length === 0 && scanResults.parsedResults.length > 0 && (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-dark-300 mb-2">No hosts match your filters</h3>
                  <p className="text-dark-400">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!scanResults && !isScanning && !error && (
            <div className="text-center py-12 lg:py-20">
              <div className="w-16 h-16 lg:w-24 lg:h-24 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wifi className="w-8 h-8 lg:w-12 lg:h-12 text-dark-600" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-white mb-2">Ready to Discover Your Network</h3>
              <p className="text-dark-400 mb-6 max-w-md mx-auto text-sm lg:text-base">
                Configure your scan parameters in the sidebar and click "Start Scan" to discover devices on your network.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs lg:text-sm text-dark-500">
                <span>• Professional Network Analysis</span>
                <span>• Real-time Topology Visualization</span>
                <span>• Comprehensive Port Scanning</span>
              </div>
            </div>
          )}

          {/* Scanning State */}
          {isScanning && (
            <div className="text-center py-12 lg:py-20">
              <div className="w-16 h-16 lg:w-24 lg:h-24 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wifi className="w-8 h-8 lg:w-12 lg:h-12 text-primary-400 animate-pulse" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-white mb-2">Scanning Network...</h3>
              <p className="text-dark-400 mb-6 text-sm lg:text-base">
                Discovering devices on {ipRange} with ports {portRange}
              </p>
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;