import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Validate IP range format
const validateIpRange = (range) => {
  const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
  const ipRangeRegex = /^(\d{1,3}\.){3}\d{1,3}-\d{1,3}$/;
  const singleIpRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  
  return cidrRegex.test(range) || ipRangeRegex.test(range) || singleIpRegex.test(range);
};

// Check if Nmap is available
const checkNmapAvailability = async () => {
  try {
    await execAsync('nmap --version');
    return true;
  } catch (error) {
    return false;
  }
};

// Ping endpoint for individual hosts
app.get('/api/ping/:ip', async (req, res) => {
  const { ip } = req.params;
  
  // Validate IP format
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid IP address format'
    });
  }

  try {
    const startTime = Date.now();
    
    // Use platform-appropriate ping command
    const isWindows = process.platform === 'win32';
    const pingCommand = isWindows 
      ? `ping -n 1 -w 3000 ${ip}` 
      : `ping -c 1 -W 3 ${ip}`;
    
    const { stdout, stderr } = await execAsync(pingCommand, { timeout: 5000 });
    const endTime = Date.now();
    
    // Parse ping output for latency
    let latency = endTime - startTime;
    const latencyMatch = stdout.match(/time[<=](\d+(?:\.\d+)?)ms/i);
    if (latencyMatch) {
      latency = parseFloat(latencyMatch[1]);
    }
    
    res.json({
      success: true,
      data: {
        ip,
        latency,
        timestamp: new Date().toISOString(),
        rawOutput: stdout
      }
    });

  } catch (error) {
    res.json({
      success: false,
      data: {
        ip,
        error: 'Host unreachable',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Scan endpoint
app.get('/api/scan', async (req, res) => {
  const { range = '192.168.1.0/24', ports = '1-1024' } = req.query;
  
  // Validate input
  if (!validateIpRange(range)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid IP range format. Use CIDR notation (e.g., 192.168.1.0/24) or IP range (e.g., 192.168.1.1-254)'
    });
  }

  // Check if Nmap is available
  const nmapAvailable = await checkNmapAvailability();
  if (!nmapAvailable) {
    return res.status(500).json({
      success: false,
      error: 'Nmap is not installed or not available in PATH. Please install Nmap to use this scanner.',
      installInstructions: {
        windows: 'Download from https://nmap.org/download.html',
        macos: 'brew install nmap',
        linux: 'sudo apt-get install nmap (Ubuntu/Debian) or sudo yum install nmap (CentOS/RHEL)'
      }
    });
  }

  try {
    console.log(`Starting Nmap scan for range: ${range}, ports: ${ports}`);
    
    // Construct Nmap command with safety measures
    const nmapCommand = `nmap -p ${ports} -T4 -sS -oX - ${range}`;
    
    const startTime = Date.now();
    const { stdout, stderr } = await execAsync(nmapCommand, { 
      timeout: 300000, // 5 minute timeout
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    
    const endTime = Date.now();
    const scanDuration = (endTime - startTime) / 1000;

    if (stderr && !stderr.includes('Warning')) {
      console.error('Nmap stderr:', stderr);
    }

    // Parse the XML output for structured data
    const hosts = parseNmapOutput(stdout);
    
    res.json({
      success: true,
      data: {
        command: nmapCommand,
        rawOutput: stdout,
        parsedResults: hosts,
        scanDuration: `${scanDuration.toFixed(2)}s`,
        timestamp: new Date().toISOString(),
        range,
        portsScanned: ports
      }
    });

  } catch (error) {
    console.error('Scan error:', error);
    
    let errorMessage = 'Scan failed';
    if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Scan timed out. Try a smaller IP range or port range.';
    } else if (error.stderr) {
      errorMessage = error.stderr;
    } else {
      errorMessage = error.message;
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      details: error.code || 'UNKNOWN_ERROR'
    });
  }
});

// Simple parser for Nmap XML output
const parseNmapOutput = (xmlOutput) => {
  const hosts = [];
  
  // Basic regex parsing (for production, use a proper XML parser)
  const hostRegex = /<host[^>]*>[\s\S]*?<\/host>/g;
  const hostMatches = xmlOutput.match(hostRegex) || [];
  
  hostMatches.forEach(hostXml => {
    const host = {};
    
    // Extract IP address
    const ipMatch = hostXml.match(/<address addr="([^"]+)" addrtype="ipv4"/);
    if (ipMatch) host.ip = ipMatch[1];
    
    // Extract hostname
    const hostnameMatch = hostXml.match(/<hostname name="([^"]+)"/);
    if (hostnameMatch) host.hostname = hostnameMatch[1];
    
    // Extract MAC address
    const macMatch = hostXml.match(/<address addr="([^"]+)" addrtype="mac"/);
    if (macMatch) host.mac = macMatch[1];
    
    // Extract vendor
    const vendorMatch = hostXml.match(/vendor="([^"]+)"/);
    if (vendorMatch) host.vendor = vendorMatch[1];
    
    // Extract ports
    const portRegex = /<port protocol="tcp" portid="(\d+)">[\s\S]*?<state state="open"[\s\S]*?<\/port>/g;
    const ports = [];
    let portMatch;
    
    while ((portMatch = portRegex.exec(hostXml)) !== null) {
      const portNum = parseInt(portMatch[1]);
      const serviceMatch = portMatch[0].match(/<service name="([^"]+)"/);
      const service = serviceMatch ? serviceMatch[1] : 'unknown';
      
      ports.push({
        port: portNum,
        service: service,
        state: 'open'
      });
    }
    
    host.ports = ports;
    host.status = 'up';
    
    if (host.ip) {
      hosts.push(host);
    }
  });
  
  return hosts;
};

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const nmapAvailable = await checkNmapAvailability();
  res.json({
    status: 'ok',
    nmapAvailable,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Network Scanner API running on http://localhost:${PORT}`);
  console.log(`📡 Scan endpoint: http://localhost:${PORT}/api/scan?range=192.168.1.0/24`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🏓 Ping endpoint: http://localhost:${PORT}/api/ping/:ip`);
});