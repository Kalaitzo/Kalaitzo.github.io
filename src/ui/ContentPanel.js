/**
 * Full CV side panel — opened via hamburger menu.
 * Contains ALL information from the CV in one scrollable panel.
 */
export function createContentPanel() {
  const panel = document.createElement('div');
  panel.className = 'content-panel';
  panel.innerHTML = `
    <button class="panel-close-btn" aria-label="Close">&times;</button>
    <div class="panel-content"></div>
  `;
  document.body.appendChild(panel);

  const closeBtn = panel.querySelector('.panel-close-btn');
  const contentArea = panel.querySelector('.panel-content');

  let visible = false;
  let onHideCallback = null;

  closeBtn.addEventListener('click', hide);

  // Click outside panel to close
  function onBackdropClick(e) {
    if (visible && !panel.contains(e.target) && e.target.id !== 'menu-btn') {
      hide();
    }
  }
  document.addEventListener('click', onBackdropClick);

  // Escape key to close
  function onEscapeKey(e) {
    if (visible && e.key === 'Escape') {
      hide();
    }
  }
  document.addEventListener('keydown', onEscapeKey);

  function show() {
    contentArea.innerHTML = getFullCVHTML();
    panel.classList.add('open');
    visible = true;
  }

  function hide() {
    panel.classList.remove('open');
    visible = false;
    if (onHideCallback) onHideCallback();
  }

  return {
    show,
    hide,
    isVisible() { return visible; },
    onHide(fn) { onHideCallback = fn; },
    dispose() {
      closeBtn.removeEventListener('click', hide);
      document.removeEventListener('click', onBackdropClick);
      document.removeEventListener('keydown', onEscapeKey);
      panel.remove();
    },
  };
}

function getFullCVHTML() {
  return `
    <h2 class="panel-title">Vasileios Kalaitzopoulos</h2>
    <p class="panel-subtitle">Robotics · Computer Vision · Software Engineering</p>

    <div class="panel-links">
      <a href="https://github.com/Kalaitzo" target="_blank" rel="noopener noreferrer" class="contact-item">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        <span>GitHub</span>
      </a>
      <a href="https://linkedin.com/in/vassileios-kalaitzopoulos" target="_blank" rel="noopener noreferrer" class="contact-item">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        <span>LinkedIn</span>
      </a>
    </div>

    <h3 class="cv-subtitle">Education</h3>
    <div class="timeline">
      <div class="timeline-item">
        <span class="timeline-period">2018 — 2025</span>
        <div class="timeline-body">
          <h3>MEng of Electrical and Computer Engineering</h3>
          <p class="timeline-place">University of Patras</p>
          <p class="timeline-note">GPA: 7.22</p>
          <p class="timeline-note">Thesis: Biped Robot Walking via Reinforcement Learning — Grade: 10/10</p>
          <p class="timeline-note" style="margin-top:6px;color:var(--text-muted)">Relevant coursework: Introduction to Robotics, Machine Learning, 3D Computer Geometry & Vision, Artificial Intelligence I & II, Intelligent Control</p>
        </div>
      </div>
      <div class="timeline-item">
        <span class="timeline-period">2015 — 2018</span>
        <div class="timeline-body">
          <h3>2nd General Highschool of Ptolemaida</h3>
          <p class="timeline-place">Science Faculty</p>
          <p class="timeline-note">Top 2.5% of the Panhellenic finals</p>
        </div>
      </div>
    </div>

    <h3 class="cv-subtitle">Experience</h3>
    <div class="timeline">
      <div class="timeline-item">
        <span class="timeline-period">Jan 2026 — Present</span>
        <div class="timeline-body">
          <h3>Software Engineer</h3>
          <p class="timeline-place">Book Scanner</p>
          <ul class="timeline-list">
            <li>Researched and evaluated TTS models optimizing response times for an AI e-shop assistant, achieving ~1 second latency</li>
            <li>Developed PDF classification desktop application in Python using PyQt and SQLite, leveraging threading for responsive UI</li>
            <li>Designed multi-user document quality testing application with role-based access via username/password authentication</li>
            <li>Implemented OpenVPN solution on headless Ubuntu server providing secure remote access to Samba file server</li>
          </ul>
        </div>
      </div>
      <div class="timeline-item">
        <span class="timeline-period">Nov 2024 — Nov 2025</span>
        <div class="timeline-body">
          <h3>Network and Communications Internship</h3>
          <p class="timeline-place">EU-LISA, Strasbourg</p>
          <ul class="timeline-list">
            <li>Assisted entry into operation for new systems (EES) and upgrades of existing ones (VIS)</li>
            <li>Managed internal port access system using Cisco IOS CLI for 200+ employees</li>
            <li>Optimized transfer of 200k+ IP addresses to a single IP Address Management tool via automation</li>
            <li>Designed network architecture for a segment of 50 VMs, avoiding hundreds of additional firewall rules</li>
            <li>Reviewed, optimized and implemented firewall rules on Check Point SmartConsole</li>
            <li>Network Incident Manager responsible for internal ITSM software following ITIL framework</li>
            <li>Completed Cisco CCNA, Fortinet FortiGate 7.4 and FortiManager 7.4 Administrator certifications</li>
          </ul>
        </div>
      </div>
    </div>

    <h3 class="cv-subtitle">Projects</h3>
    <div class="projects-list">
      <article class="project-card">
        <h3 class="project-title">Biped Robot Walking via Reinforcement Learning</h3>
        <p class="project-desc">Implemented SAC from scratch. Built a 6-DOF biped robot with servos, Arduino Mega, and ArUco marker tracking. Designed support system with weight sensor for reward shaping.</p>
        <div class="project-tags"><span class="tag">RL</span><span class="tag">Python</span><span class="tag">Arduino</span><span class="tag">SAC</span></div>
      </article>
      <article class="project-card">
        <h3 class="project-title">Robots Learn to Act via Reinforcement Learning</h3>
        <p class="project-desc">Collaborative research proposing a modern robot learning framework. Received praises at the 2nd AI Competition by the AI-Hub Center, University of Patras.</p>
        <div class="project-tags"><span class="tag">RL</span><span class="tag">Research</span><span class="tag">Robotics</span></div>
      </article>
      <article class="project-card">
        <h3 class="project-title">3D Scene Segmentation & Detection</h3>
        <p class="project-desc">Point cloud generation from stereo images. Plane detection, object detection, denoising, Ball Pivot triangulation, collision detection and handling. Highest grade.</p>
        <div class="project-tags"><span class="tag">Computer Vision</span><span class="tag">3D Graphics</span><span class="tag">Python</span></div>
      </article>
      <article class="project-card">
        <h3 class="project-title">FlyMonitoring — IoT Room Monitoring</h3>
        <p class="project-desc">IoT web application for high-security room monitoring. Team lead. Real-time sensor data, smart data model simulation, web hosting services.</p>
        <div class="project-tags"><span class="tag">IoT</span><span class="tag">Web</span><span class="tag">Team Lead</span></div>
      </article>
      <article class="project-card">
        <h3 class="project-title">Kernels-Clustering</h3>
        <p class="project-desc">Gaussian Kernel probability density approximation and K-means clustering for 2D vector data classification.</p>
        <div class="project-tags"><span class="tag">ML</span><span class="tag">Python</span></div>
      </article>
      <article class="project-card">
        <h3 class="project-title">Inpainting & Upscaling</h3>
        <p class="project-desc">Pretrained generator model for MNIST digit inpainting and upscaling using deep generative techniques.</p>
        <div class="project-tags"><span class="tag">Deep Learning</span><span class="tag">GANs</span></div>
      </article>
    </div>

    <h3 class="cv-subtitle">Core Competencies</h3>
    <div class="skills-grid">
      <div class="skill-group"><h4>ML / AI</h4><div class="skill-chips"><span class="chip">Machine Learning</span><span class="chip">Reinforcement Learning</span><span class="chip">Computer Vision</span><span class="chip">PyTorch</span></div></div>
      <div class="skill-group"><h4>Robotics</h4><div class="skill-chips"><span class="chip">Robotics Design</span><span class="chip">Arduino</span><span class="chip">MATLAB</span><span class="chip">Simulation</span></div></div>
      <div class="skill-group"><h4>Programming</h4><div class="skill-chips"><span class="chip">Python</span><span class="chip">C/C++</span><span class="chip">JavaScript</span><span class="chip">OOP</span></div></div>
      <div class="skill-group"><h4>Web</h4><div class="skill-chips"><span class="chip">Web Development</span><span class="chip">REST APIs</span><span class="chip">Three.js</span><span class="chip">Relational DBs</span></div></div>
      <div class="skill-group"><h4>Networking</h4><div class="skill-chips"><span class="chip">Cisco IOS</span><span class="chip">Check Point</span><span class="chip">Fortinet</span><span class="chip">OpenVPN</span></div></div>
      <div class="skill-group"><h4>Tools</h4><div class="skill-chips"><span class="chip">Git</span><span class="chip">Docker</span><span class="chip">Linux</span><span class="chip">VS Code</span><span class="chip">JetBrains</span></div></div>
      <div class="skill-group"><h4>Soft Skills</h4><div class="skill-chips"><span class="chip">Project Management</span><span class="chip">Team Management</span><span class="chip">Research</span><span class="chip">Problem Solving</span></div></div>
    </div>

    <h3 class="cv-subtitle">Languages</h3>
    <div class="skill-chips" style="margin-bottom:24px">
      <span class="chip">Greek — Native</span>
      <span class="chip">English — Fluent</span>
      <span class="chip">Italian — Beginner</span>
      <span class="chip">French — Beginner</span>
    </div>

    <h3 class="cv-subtitle">Interests</h3>
    <p class="about-content" style="margin-bottom:24px">Vinyl collector, musician, traveler. Visited multiple European countries and lived in Strasbourg for one year during the EU-LISA internship.</p>
  `;
}
