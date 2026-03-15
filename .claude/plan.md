# Portfolio Website — Vassileios Kalaitzopoulos

## Context

Vassileios wants an interactive portfolio/CV website that showcases his robotics, computer vision, and graphics background. The centerpiece is a **3D bipedal robot** built with Three.js — directly tied to his thesis ("Biped Robot Walking via Reinforcement Learning", 10/10). The site will be developed locally first, then deployed to GitHub Pages.

---

## Tech Stack

- **Vite** (dev server + build)
- **Vanilla JS** (no framework)
- **Three.js** (3D robot)
- **CSS** (custom properties, no preprocessor)
- **GitHub Pages** (deployment)

---

## Phase 1: Project Setup

1. Install GitHub CLI: `brew install gh` → `gh auth login`
2. Create project directory: `/Users/kalaitzo/Kalaitzo.github.io`
3. Scaffold with Vite:
   ```
   npm create vite@latest Kalaitzo.github.io -- --template vanilla
   cd Kalaitzo.github.io && npm install three
   ```
4. Create GitHub repo (later, when ready to push):
   ```
   gh repo create Kalaitzo.github.io --public --source=. --push
   ```
   This gives the clean URL: **https://kalaitzo.github.io**
5. Copy CV PDF into `public/` for download link

### Directory Structure

```
Kalaitzo.github.io/
├── public/
│   └── CV_Vassileios_Kalaitzopoulos.pdf
├── src/
│   ├── main.js              # Entry point, section scroll logic
│   ├── robot/
│   │   ├── Robot.js          # Robot class — geometry, hierarchy, materials
│   │   ├── walkCycle.js      # Procedural walk animation math
│   │   └── scene.js          # Three.js scene, camera, renderer, controls, lights
│   ├── sections/
│   │   ├── hero.js           # Hero section setup (title overlay on canvas)
│   │   ├── about.js          # About section content
│   │   ├── projects.js       # Projects grid/cards
│   │   └── cv.js             # CV timeline + download button
│   └── style.css             # All styles
├── index.html
├── package.json
└── vite.config.js
```

---

## Phase 2: 3D Bipedal Robot (Hero Section)

### Body Hierarchy — Rounded / Friendly Style

Uses `CapsuleGeometry`, `SphereGeometry`, and rounded `BoxGeometry` for a smooth, approachable look. Joints are visible spheres for a toy/Pixar-like feel.

```
robot (Group)
├── torso (Capsule h=0.6, r=0.3 — pill-shaped body)
│   ├── head (Sphere r=0.28, on top of torso)
│   │   ├── visor (Sphere segment or curved box, cyan emissive — friendly "eye band")
│   │   └── antenna (thin cylinder + small sphere on top — personality detail)
│   ├── leftArm (Group, pivot at shoulder)
│   │   ├── shoulderJoint (Sphere r=0.08 — visible ball joint)
│   │   ├── upperArm (Capsule h=0.3, r=0.08)
│   │   ├── elbowJoint (Sphere r=0.06)
│   │   └── forearm (Capsule h=0.25, r=0.07)
│   ├── rightArm (mirror of leftArm)
│   ├── hipJointL/R (Sphere r=0.08 — visible ball joints)
│   ├── leftLeg (Group, pivot at hip)
│   │   ├── thigh (Capsule h=0.35, r=0.1)
│   │   ├── kneeJoint (Sphere r=0.07)
│   │   ├── shin (Capsule h=0.3, r=0.08)
│   │   └── foot (rounded Box 0.2 × 0.08 × 0.25)
│   └── rightLeg (mirror of leftLeg)
```

### Materials

- **Body**: `MeshStandardMaterial` — soft white/light gray (`#d0d0d8`, metalness: 0.2, roughness: 0.6) for a friendly matte look
- **Joints**: Slightly darker gray spheres — gives an articulated toy feel
- **Visor/eye**: Cyan emissive (`#00ffff`) — wide visor band across face, gives personality
- **Antenna tip**: Cyan emissive glow — subtle detail
- **Feet**: Slightly darker shade for grounding

### Procedural Walk Cycle (`walkCycle.js`)

Uses sinusoidal functions driven by a clock:

```
t = clock.getElapsedTime() * walkSpeed

// Legs — opposite phase
leftLeg.thigh.rotation.x  = sin(t) * 0.5        // swing ±0.5 rad
rightLeg.thigh.rotation.x = sin(t + PI) * 0.5

// Knees — only bend backward, offset phase
leftLeg.shin.rotation.x  = max(0, sin(t - 0.5)) * 0.6
rightLeg.shin.rotation.x = max(0, sin(t + PI - 0.5)) * 0.6

// Arms — counter-swing to legs
leftArm.upperArm.rotation.x  = sin(t + PI) * 0.3
rightArm.upperArm.rotation.x = sin(t) * 0.3

// Subtle torso sway
torso.rotation.z = sin(t) * 0.03
torso.position.y = baseY + abs(sin(t * 2)) * 0.05  // bounce
```

### Scene Setup (`scene.js`)

- **Renderer**: `WebGLRenderer` with `antialias: true`, `alpha: true` (transparent background to blend with page)
- **Camera**: `PerspectiveCamera`, FOV 45, positioned at (0, 1.5, 4)
- **Controls**: `OrbitControls` — constrained: no pan, limited polar angle (can't go below floor), damping enabled
- **Lights**:
  - Ambient light (soft, low intensity 0.4)
  - Directional light from upper-right (intensity 1.0, casts shadows)
  - Point light near robot visor (cyan, low intensity — accent glow)
- **Ground plane**: Optional subtle grid or reflective plane
- **Resize handler**: Updates camera aspect + renderer size on window resize
- **Animation loop**: `requestAnimationFrame` — updates walk cycle, renders scene

---

## Phase 3: Page Sections

### index.html

Minimal HTML shell:
- `<canvas id="robot-canvas">` — full viewport in hero, Three.js renders here
- `<section id="hero">` — name + title overlay on top of canvas
- `<section id="about">`
- `<section id="projects">`
- `<section id="cv">`
- `<footer>` — GitHub + LinkedIn icons/links
- Nav bar (fixed top): simple text links to each section with smooth scroll

### Hero Section
- Full-viewport canvas with the 3D robot
- Overlay text: "Vassileios Kalaitzopoulos" + subtitle "Robotics | Computer Vision | Graphics"
- Subtle scroll indicator (animated chevron at bottom)

### About Section
- Short paragraph about background and interests
- Could include a small animated accent (CSS only)

### Projects Section
- Grid of project cards (2-3 columns, responsive)
- Each card: title, short description, tech tags, link to GitHub repo if available
- Projects to showcase (from CV):
  1. Biped Robot Walking via Reinforcement Learning
  2. 3D Scene Segmentation (likely point cloud / NeRF related)
  3. IoT Web Application
  4. Other ML projects from CV
- Hover effects on cards

### CV Section
- Timeline-style layout for Education + Experience
- Skills displayed as grouped tags/chips
- "Download CV" button linking to PDF in `/public`

### Footer
- GitHub icon + link
- LinkedIn icon + link
- Simple copyright line

---

## Phase 4: Styling

- **Theme**: Dark background (`#0a0a0a`), light text (`#e0e0e0`), cyan accent (`#00ffff`)
- **CSS custom properties** for colors, spacing, fonts
- **Font**: System font stack or a clean mono/sans like Inter (loaded from Google Fonts with `font-display: swap`)
- **Responsive**: Mobile-first, breakpoints at 768px and 1024px
- **Smooth scroll**: `scroll-behavior: smooth` on html
- **Animations**: Subtle fade-in on scroll using `IntersectionObserver` (vanilla JS, no library)

---

## Phase 5: Security Measures

Since the user explicitly asked about security:

1. **No secrets in repo**: CV PDF is public info; no API keys, no `.env` files
2. **External links**: All `<a>` to external sites get `rel="noopener noreferrer"` and `target="_blank"`
3. **Content Security Policy**: Add CSP meta tag in `index.html`:
   ```html
   <meta http-equiv="Content-Security-Policy"
     content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:;">
   ```
4. **No inline JS**: All scripts in separate files (Vite handles this)
5. **Dependency hygiene**: Only 2 dependencies (`vite`, `three`) — run `npm audit` before deploy
6. **No user input**: No forms, no dynamic content from URL params — minimal XSS surface
7. **HTTPS**: GitHub Pages serves over HTTPS by default
8. **`.gitignore`**: Ensure `node_modules/`, `.env`, `.DS_Store`, etc. are excluded

---

## Phase 6: GitHub Repo + Pages Deployment (later)

1. `brew install gh && gh auth login`
2. `gh repo create portfolio --public --source=. --push`
3. Configure Vite for GitHub Pages base path in `vite.config.js`:
   ```js
   export default { base: '/' }
   ```
   (base is `'/'` since we're using `Kalaitzo.github.io` as the repo name)
4. Build: `npm run build` → outputs to `dist/`
5. Deploy via GitHub Actions or `gh-pages` npm package

---

## Implementation Order

1. **Scaffold project** — Vite init, install Three.js, set up file structure
2. **Build the 3D robot** — `Robot.js` geometry hierarchy + materials
3. **Animate the walk cycle** — `walkCycle.js` procedural animation
4. **Set up the scene** — `scene.js` with camera, lights, controls, render loop
5. **Wire up hero section** — Canvas + overlay text in `index.html`
6. **Build remaining sections** — About, Projects, CV, Footer
7. **Style everything** — Dark theme, responsive, scroll animations
8. **Security hardening** — CSP, link attributes, audit
9. **GitHub repo + deploy** — Create repo, push, configure Pages

---

## Verification

- `npm run dev` — opens local dev server, verify:
  - Robot renders and walks in hero section
  - OrbitControls work (drag to rotate, scroll to zoom)
  - All sections visible and properly styled
  - Responsive at mobile/tablet/desktop widths
  - CV PDF downloads correctly
  - External links open in new tab with correct `rel` attributes
  - No console errors or warnings
  - Browser DevTools → check CSP is applied
- `npm run build && npm run preview` — verify production build works
- `npm audit` — no known vulnerabilities
