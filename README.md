# Vasileios Kalaitzopoulos — Interactive Portfolio

An interactive side-scroller portfolio where a 3D bipedal robot walks along a path, discovering content at themed stations.

**Live:** [kalaitzo.github.io](https://kalaitzo.github.io)

## How It Works

Use **arrow keys** (or **A/D**) to walk the robot left and right. Approach a station and press **Enter** to deploy a content board that drops from the overhead rail. Press the **hamburger menu** for a full CV panel.

On mobile, use the on-screen touch controls.

## Features

- **3D Bipedal Robot** — 6-DOF mechanical biped modelled after a real thesis robot, with servo brackets, Arduino platform, and ArUco marker
- **Physics-Based Walk Cycle** — 3-joint IK (hip, knee, ankle) with stance/swing gait phases, ground contact constraints, and root motion foot planting
- **Support Rail System** — overhead rail with sliding clip, hanging string with damped spring pendulum physics, and load cell detail
- **5 Themed Stations** — Home, Education, Projects, Experience, Skills — each with unique 3D objects and environment
- **Dropping Content Boards** — press Enter to release boards that free-fall from the rail, caught by string physics with bounce
- **Low-Poly Environment** — trees, rocks, mountains, buildings, floating cubes, glowing circuit lines, grass terrain, starry sky
- **Responsive** — touch controls on mobile, hamburger menu with full CV panel
- **Secure** — CSP headers, no inline scripts, rel="noopener noreferrer" on all external links

## Tech Stack

- **Three.js** — 3D rendering, geometry, materials, lighting, shadows
- **Vite** — build tool and dev server
- **Vanilla JavaScript** — no framework
- **GitHub Pages** — deployment via GitHub Actions

## Development

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # production build to dist/
```

## Context

The centerpiece robot is based on my master's thesis: *"Biped Robot Walking via Reinforcement Learning"* (Grade: 10/10), where I built a real 6-DOF biped and trained it to walk using the Soft Actor-Critic algorithm. The support rail in the portfolio mirrors the physical support system used during training, which measured the robot's weight via a load cell to shape the reward function.
