# Network Scanner Dashboard

A professional full-stack web app for scanning local networks using Nmap, built with React (frontend) and Express (backend).  
It provides a modern, clean admin dashboard to display scanned hosts, open ports, network topology, and interactive tools like ping tests.

## Features

- Scan local network IP ranges with configurable port ranges
- Display scanned hosts in cards or grid with:
  - IP address, MAC address, hostname (if detected)
  - List of open ports and their service names
  - Clickable links for web ports (80, 443, 8080) opening in new tabs
  - Ping button per host showing latency results with smooth animation
- Network topology diagram showing router and connected devices with animated connections
- Sidebar or header with scan range inputs and scan button with loading animation
- Styled professionally with Tailwind CSS for a clean, modern admin panel look
- Easily extensible for traceroute, OS detection, live traffic monitoring, and more

## Tech Stack

- Frontend: React, Tailwind CSS, Framer Motion, react-flow (optional)
- Backend: Node.js, Express, Nmap integration
- Visualization: D3.js, Framer Motion, or react-flow for topology

## Prerequisites

- Node.js v16+
- Nmap installed and accessible from your command line
-and maybe npcap if needer

## Getting Started

1. Clone the repo:

   ```bash
   git clone https://github.com/B212M/network-scanner-dashboard.git
   cd network-scanner-dashboard




Install backend dependencies:

###both same cms in the project
    npm install express (just for first time)
    node server/index.js
###and this for localhost in other cmd
    npm run client
