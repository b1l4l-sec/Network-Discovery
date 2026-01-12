# Network Discovery (React + Vite)

[![Vite](https://img.shields.io/badge/Vite-%3E%3D4.0-646cff?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

A small React + Vite project for network discovery and visualization. This README replaces the starter template and adds sections, usage instructions and space for the screenshots and PNG images you uploaded.

---

## Table of Contents

- [Overview](#overview)  
- [Features](#features)  
- [Screenshots](#screenshots)  
- [Quick start](#quick-start)  
- [Development](#development)  
- [Build & Deploy](#build--deploy)  
- [Contributing](#contributing)  
- [License](#license)

---

## Overview

Network-Discovery is a front-end application built with React + Vite that visualizes network discovery results (scans, topology, device details). Use it as a visualization tool or as the UI for your network scanning back-end.

---

## Features

- Interactive network topology visualization  
- Device details and scan results views  
- Filter and search devices on the network map  
- Export/import of scan results (JSON/CSV)  
- Extensible UI components for custom data sources

---

## Screenshots

Place your PNG files either at the repo root or under `public/images/` (recommended: `public/images/`). The images will render automatically on GitHub. Update the filenames below if your images use different names or paths.

Example filenames used in this README (replace with your actual filenames if needed):
- `network-overview.png` (or `public/images/network-overview.png`)
- `scan-results.png` (or `public/images/scan-results.png`)
- `device-details.png` (or `public/images/device-details.png`)
- `topology.png` (or `public/images/topology.png`)

### App Home / Overview
![Network Overview](public/images/network-overview.png)

(If you placed the images in repo root, use:)
![Network Overview](network-overview.png)

### Scan Results
![Scan Results](public/images/scan-results.png)

### Device / Details View
![Device Details](public/images/device-details.png)

### Topology Map
![Topology Map](public/images/topology.png)

> Tip: If GitHub does not render an image, double-check the file path and filename are exact (case-sensitive).

---

## Quick start

Prerequisites:
- Node.js 16+ and npm or yarn
- Git

Clone and install:

```bash
git clone https://github.com/b1l4l-sec/Network-Discovery.git
cd Network-Discovery
npm install
# or
# yarn install
```

Run dev server:

```bash
npm run dev
# or
# yarn dev
```

Open http://localhost:5173 to view the app.

---

## Development

- Source code lives in `src/`
- Public assets (images, static files) go in `public/` (recommended `public/images/`)
- Linting and formatting via ESLint / Prettier (see `package.json`)

Common scripts (from `package.json`):

```bash
npm run dev       # start development server
npm run build     # produce production build
npm run preview   # preview built site locally
npm run lint      # run linter
```

---

## Build & Deploy

Build the app:

```bash
npm run build
```

Deploy the contents of the `dist/` folder to your static hosting provider (Netlify, GitHub Pages, S3, etc.).

For GitHub Pages (example):

```bash
npm run build
# then push dist content to gh-pages branch or use your CI to publish
```

---

## How to add the images to the repo (recommended)

1. Put images in `public/images/` (recommended) or repo root.
2. Stage and commit:

```bash
git add public/images/network-overview.png public/images/scan-results.png
git commit -m "docs: add network screenshots"
```

3. Push to GitHub (recommended: new branch then PR):

```bash
git checkout -b docs/add-screenshots
git push -u origin docs/add-screenshots
# then open a PR on GitHub and merge
```

---

## Contributing

Contributions welcome — please fork the repo and open a PR.  
Recommended workflow:

1. Fork and clone
2. Create a feature branch
3. Make changes and add tests
4. Open a Pull Request describing your changes

---

## License

MIT — see the `LICENSE` file.

---

If you want, I can:
- 1) Commit this README update to a new branch and open a Pull Request (please confirm branch name), or  
- 2) Commit directly to `main` (only recommended if you're the sole maintainer), or  
- 3) Produce the exact image filenames and the git commands to add them from your local machine.

Please confirm:
- The exact image filenames and paths you uploaded (e.g., `public/images/VPNDataWireshark.png`), or
- If you want me to proceed and create a PR with placeholder paths (you can later upload images to match), or
- If you'd rather paste this README locally and push yourself (I can give the exact git commands).
