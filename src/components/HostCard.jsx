import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Server, 
  Smartphone, 
  Router, 
  Monitor, 
  Printer, 
  Camera, 
  ExternalLink, 
  Activity,
  Wifi,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const getDeviceIcon = (hostname, ports) => {
  const name = hostname?.toLowerCase() || '';
  
  if (name.includes('router') || name.includes('gateway')) return Router;
  if (name.includes('phone') || name.includes('mobile') || name.includes('android') || name.includes('iphone')) return Smartphone;
  if (name.includes('printer') || name.includes('hp') || name.includes('canon') || name.includes('epson')) return Printer;
  if (name.includes('camera') || name.includes('cam') || ports?.some(p => p.port === 554)) return Camera;
  if (name.includes('desktop') || name.includes('pc') || name.includes('laptop')) return Monitor;
  
  return Server;
};

const isWebPort = (port) => {
  const webPorts = [80, 443, 8080, 8443, 3000, 5000, 8000, 9000];
  return webPorts.includes(port);
};

const getWebUrl = (ip, port) => {
  const protocol = port === 443 || port === 8443 ? 'https' : 'http';
  const displayPort = (port === 80 && protocol === 'http') || (port === 443 && protocol === 'https') 
    ? '' : `:${port}`;
  return `${protocol}://${ip}${displayPort}`;
};

const HostCard = ({ host, index }) => {
  const [pingResult, setPingResult] = useState(null);
  const [isPinging, setIsPinging] = useState(false);
  const [showPingResult, setShowPingResult] = useState(false);

  const DeviceIcon = getDeviceIcon(host.hostname, host.ports);

  const handlePing = async () => {
    setIsPinging(true);
    setShowPingResult(false);
    
    try {
      // Simulate ping - in a real app, you'd call your backend
      const startTime = Date.now();
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      // Simulate success/failure (90% success rate)
      const success = Math.random() > 0.1;
      
      setPingResult({
        success,
        latency: success ? latency : null,
        timestamp: new Date().toLocaleTimeString()
      });
      
      setShowPingResult(true);
      
      if (success) {
        toast.success(`Ping successful: ${latency}ms`);
      } else {
        toast.error('Ping failed: Host unreachable');
      }
      
      // Hide result after 5 seconds
      setTimeout(() => setShowPingResult(false), 5000);
      
    } catch (error) {
      setPingResult({
        success: false,
        error: error.message,
        timestamp: new Date().toLocaleTimeString()
      });
      setShowPingResult(true);
      toast.error('Ping failed');
    } finally {
      setIsPinging(false);
    }
  };

  const openWebService = (ip, port) => {
    const url = getWebUrl(ip, port);
    window.open(url, '_blank', 'noopener,noreferrer');
    toast.success(`Opening ${url}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-dark-800 border border-dark-700 rounded-xl p-4 lg:p-6 hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 lg:p-3 bg-dark-700 rounded-lg border border-dark-600">
            <DeviceIcon className="w-5 h-5 lg:w-6 lg:h-6 text-primary-500" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white text-base lg:text-lg truncate">
              {host.hostname || 'Unknown Device'}
            </h3>
            <p className="text-cyan-400 font-mono text-sm">{host.ip}</p>
            {host.vendor && (
              <p className="text-dark-400 text-xs mt-1 truncate">{host.vendor}</p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
          <button
            onClick={handlePing}
            disabled={isPinging}
            className="flex items-center gap-1 px-2 lg:px-3 py-1.5 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-lg text-sm text-white transition-colors disabled:opacity-50"
          >
            {isPinging ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Activity className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Ping</span>
          </button>
          
          <div className="flex items-center gap-1 px-2 py-1 bg-primary-500/20 border border-primary-500/30 rounded-lg">
            <Wifi className="w-3 h-3 text-primary-400" />
            <span className="text-xs text-primary-300 font-medium uppercase">
              {host.status}
            </span>
          </div>
        </div>
      </div>

      {/* Ping Result */}
      <AnimatePresence>
        {showPingResult && pingResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 rounded-lg border"
            style={{
              backgroundColor: pingResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderColor: pingResult.success ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'
            }}
          >
            <div className="flex items-center gap-2">
              {pingResult.success ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
              <span className="text-sm font-medium text-white">
                {pingResult.success ? 'Ping Successful' : 'Ping Failed'}
              </span>
              {pingResult.success && (
                <span className="text-sm text-green-300">
                  {pingResult.latency}ms
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-dark-400">
              <Clock className="w-3 h-3" />
              {pingResult.timestamp}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Device Details */}
      <div className="space-y-3 mb-4">
        {host.mac && (
          <div className="flex justify-between items-center py-2 border-b border-dark-700">
            <span className="text-dark-400 text-sm">MAC Address</span>
            <span className="text-white font-mono text-sm truncate ml-2">{host.mac}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center py-2 border-b border-dark-700">
          <span className="text-dark-400 text-sm">Open Ports</span>
          <span className="text-white font-semibold">{host.ports.length}</span>
        </div>
      </div>

      {/* Ports Section */}
      {host.ports.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-dark-300 mb-3">
            Services & Ports
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {host.ports.map((portInfo, portIndex) => (
              <motion.div
                key={portIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (index * 0.1) + (portIndex * 0.05) }}
                className={`
                  p-3 rounded-lg border transition-all duration-200
                  ${isWebPort(portInfo.port) 
                    ? 'bg-primary-500/10 border-primary-500/30 hover:bg-primary-500/20 cursor-pointer' 
                    : 'bg-dark-700 border-dark-600 hover:border-dark-500'
                  }
                `}
                onClick={() => isWebPort(portInfo.port) && openWebService(host.ip, portInfo.port)}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-white">
                        {portInfo.port}
                      </span>
                      {isWebPort(portInfo.port) && (
                        <ExternalLink className="w-3 h-3 text-primary-400 flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-dark-400 capitalize truncate">
                      {portInfo.service}
                    </span>
                  </div>
                  
                  {isWebPort(portInfo.port) && (
                    <div className="text-xs text-primary-400 font-medium">
                      WEB
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default HostCard;