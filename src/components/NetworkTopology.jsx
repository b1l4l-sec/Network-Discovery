import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { Router, Server, Smartphone, Monitor, Printer, Camera, Wifi, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const getDeviceIcon = (hostname, ports) => {
  const name = hostname?.toLowerCase() || '';
  
  if (name.includes('router') || name.includes('gateway')) return Router;
  if (name.includes('phone') || name.includes('mobile') || name.includes('android') || name.includes('iphone')) return Smartphone;
  if (name.includes('printer') || name.includes('hp') || name.includes('canon') || name.includes('epson')) return Printer;
  if (name.includes('camera') || name.includes('cam') || ports?.some(p => p.port === 554)) return Camera;
  if (name.includes('desktop') || name.includes('pc') || name.includes('laptop')) return Monitor;
  
  return Server;
};

const NetworkTopology = ({ hosts = [], isScanning = false }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Handle responsive dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(400, rect.width - 32), // Account for padding
          height: Math.max(300, Math.min(600, rect.width * 0.6)) // Responsive height
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!hosts.length && !isScanning) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;

    // Create gateway/router node
    const gateway = {
      id: 'gateway',
      ip: '192.168.1.1',
      hostname: 'Gateway/Router',
      type: 'gateway',
      x: centerX,
      y: 100,
      fixed: true
    };

    // Process discovered hosts
    const nodes = [gateway, ...hosts.map((host, index) => {
      const angle = (index * 2 * Math.PI) / hosts.length;
      const radius = Math.min(width, height) * 0.25; // Responsive radius
      return {
        ...host,
        id: host.ip,
        type: 'device',
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    })];

    // Create links from gateway to all devices
    const links = hosts.map(host => ({
      source: 'gateway',
      target: host.ip,
    }));

    // Set up SVG with zoom behavior
    svg.attr('width', width).attr('height', height);

    // Create main group for zoom/pan
    const g = svg.append('g');

    // Set up zoom behavior
    const zoomBehavior = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoomBehavior);

    // Store zoom behavior on svg for external access
    svg.node().zoomBehavior = zoomBehavior;

    // Create gradient definitions
    const defs = svg.append('defs');
    
    const gradient = defs.append('linearGradient')
      .attr('id', 'linkGradient')
      .attr('gradientUnits', 'userSpaceOnUse');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#22c55e')
      .attr('stop-opacity', 0.8);
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#06b6d4')
      .attr('stop-opacity', 0.3);

    // Create links
    const linkElements = g.selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', 'url(#linkGradient)')
      .attr('stroke-width', 2)
      .attr('opacity', 0.6);

    // Create node groups
    const nodeGroups = g.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
      });

    // Add circles for nodes
    nodeGroups.append('circle')
      .attr('r', d => d.type === 'gateway' ? 25 : 20)
      .attr('fill', d => d.type === 'gateway' ? '#22c55e' : '#06b6d4')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 3)
      .attr('opacity', 0.9);

    // Add pulsing effect for gateway
    nodeGroups.filter(d => d.type === 'gateway')
      .append('circle')
      .attr('r', 25)
      .attr('fill', 'none')
      .attr('stroke', '#22c55e')
      .attr('stroke-width', 2)
      .attr('opacity', 0.6)
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr('r', 40)
      .attr('opacity', 0)
      .on('end', function repeat() {
        d3.select(this)
          .attr('r', 25)
          .attr('opacity', 0.6)
          .transition()
          .duration(2000)
          .ease(d3.easeLinear)
          .attr('r', 40)
          .attr('opacity', 0)
          .on('end', repeat);
      });

    // Add labels
    nodeGroups.append('text')
      .attr('dy', 35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(d => {
        const text = d.hostname || d.ip;
        return text.length > 15 ? text.substring(0, 12) + '...' : text;
      });

    // Position elements
    const updatePositions = () => {
      linkElements
        .attr('x1', d => nodes.find(n => n.id === d.source)?.x)
        .attr('y1', d => nodes.find(n => n.id === d.source)?.y)
        .attr('x2', d => nodes.find(n => n.id === d.target)?.x)
        .attr('y2', d => nodes.find(n => n.id === d.target)?.y);

      nodeGroups.attr('transform', d => `translate(${d.x},${d.y})`);
    };

    updatePositions();

    // Add scanning animation
    if (isScanning) {
      const scanLine = g.append('line')
        .attr('stroke', '#22c55e')
        .attr('stroke-width', 3)
        .attr('opacity', 0.8)
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', centerX)
        .attr('y2', centerY);

      const animateScan = () => {
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.min(width, height) * 0.4;
        const endX = centerX + radius * Math.cos(angle);
        const endY = centerY + radius * Math.sin(angle);

        scanLine
          .attr('x2', centerX)
          .attr('y2', centerY)
          .transition()
          .duration(1000)
          .attr('x2', endX)
          .attr('y2', endY)
          .transition()
          .duration(500)
          .attr('opacity', 0)
          .on('end', () => {
            scanLine.attr('opacity', 0.8);
            if (isScanning) animateScan();
          });
      };

      animateScan();
    }

    // Click outside to deselect
    svg.on('click', () => setSelectedNode(null));

  }, [hosts, isScanning, dimensions]);

  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current);
    const zoomBehavior = svg.node().zoomBehavior;
    if (zoomBehavior) {
      svg.transition().duration(300).call(
        zoomBehavior.scaleBy, 1.5
      );
    }
  };

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current);
    const zoomBehavior = svg.node().zoomBehavior;
    if (zoomBehavior) {
      svg.transition().duration(300).call(
        zoomBehavior.scaleBy, 1 / 1.5
      );
    }
  };

  const handleResetZoom = () => {
    const svg = d3.select(svgRef.current);
    const zoomBehavior = svg.node().zoomBehavior;
    if (zoomBehavior) {
      svg.transition().duration(500).call(
        zoomBehavior.transform,
        d3.zoomIdentity
      );
    }
  };

  // Add mouse wheel zoom support
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    
    const handleWheel = (event) => {
      event.preventDefault();
      const zoomBehavior = svg.node().zoomBehavior;
      if (zoomBehavior) {
        const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;
        svg.transition().duration(100).call(
          zoomBehavior.scaleBy, scaleFactor
        );
      }
    };

    const svgNode = svg.node();
    if (svgNode) {
      svgNode.addEventListener('wheel', handleWheel, { passive: false });
      return () => svgNode.removeEventListener('wheel', handleWheel);
    }
  }, [dimensions]);

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <h3 className="text-lg lg:text-xl font-semibold text-white flex items-center gap-2">
          <Wifi className="w-5 h-5 text-primary-500" />
          Network Topology
        </h3>
        
        <div className="flex items-center gap-2">
          <div className="text-sm text-dark-400">
            {hosts.length} devices discovered
          </div>
          
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={handleZoomIn}
              className="p-2 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-lg text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-lg text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-lg text-white transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="relative" ref={containerRef}>
        <svg 
          ref={svgRef} 
          className="w-full bg-dark-900 rounded-lg border border-dark-700"
          style={{ height: dimensions.height }}
        />
        
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 bg-dark-700 border border-dark-600 rounded-lg p-4 max-w-xs z-10"
          >
            <div className="flex items-center gap-2 mb-2">
              {selectedNode.type === 'gateway' ? (
                <Router className="w-5 h-5 text-primary-500" />
              ) : (
                <Server className="w-5 h-5 text-cyan-500" />
              )}
              <h4 className="font-semibold text-white text-sm">
                {selectedNode.hostname || 'Unknown'}
              </h4>
            </div>
            <p className="text-sm text-dark-300 mb-1">IP: {selectedNode.ip}</p>
            {selectedNode.mac && (
              <p className="text-sm text-dark-300 mb-1">MAC: {selectedNode.mac}</p>
            )}
            {selectedNode.ports && selectedNode.ports.length > 0 && (
              <p className="text-sm text-dark-300">
                Ports: {selectedNode.ports.length} open
              </p>
            )}
            <button
              onClick={() => setSelectedNode(null)}
              className="mt-2 text-xs text-primary-400 hover:text-primary-300"
            >
              Close
            </button>
          </motion.div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-dark-500 text-center">
        Click and drag to pan • Scroll to zoom • Click nodes for details
      </div>
    </div>
  );
};

export default NetworkTopology;