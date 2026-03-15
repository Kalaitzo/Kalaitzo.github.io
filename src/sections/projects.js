const PROJECTS = [
  {
    title: 'Biped Robot Walking via RL',
    description:
      'Built a 6-DOF biped robot and trained it to walk using SAC (Soft Actor-Critic). Implemented SAC from scratch, used ArUco tracking, and designed a support system with weight-sensor penalty shaping.',
    tags: ['Reinforcement Learning', 'Python', 'Arduino', 'SAC'],
    link: null,
  },
  {
    title: 'Robots Learn to Act via RL',
    description:
      'Collaborative research proposing a modern robot learning framework combining RL and robotics. Received praises at the 2nd AI Competition by the AI-Hub Center, University of Patras.',
    tags: ['Reinforcement Learning', 'Research', 'Robotics'],
    link: null,
  },
  {
    title: '3D Scene Segmentation & Detection',
    description:
      'Point cloud generation from stereo images with plane detection, object detection, denoising, and Ball Pivot triangulation. Collision detection and handling. Highest possible grade.',
    tags: ['Computer Vision', 'Point Clouds', '3D Graphics', 'Python'],
    link: null,
  },
  {
    title: 'FlyMonitoring — IoT Room Monitoring',
    description:
      'IoT web application for high-security room monitoring with real-time sensor data, smart data models for simulation, and web hosting services.',
    tags: ['IoT', 'Web Development', 'Sensors', 'Team Lead'],
    link: null,
  },
  {
    title: 'Inpainting & Upscaling',
    description:
      'Utilised a pretrained generator model to inpaint and upscale MNIST digit images using deep generative techniques.',
    tags: ['Deep Learning', 'GANs', 'Python', 'MNIST'],
    link: null,
  },
  {
    title: 'Portfolio Website',
    description:
      'This very site — a Three.js-powered interactive portfolio featuring a procedurally animated bipedal robot built from scratch.',
    tags: ['Three.js', 'Vite', 'JavaScript', 'WebGL'],
    link: null,
  },
];

export function getProjectsHTML() {
  const cards = PROJECTS.map(
    (p) => `
    <article class="project-card">
      <h3 class="project-title">${p.title}</h3>
      <p class="project-desc">${p.description}</p>
      <div class="project-tags">
        ${p.tags.map((t) => `<span class="tag">${t}</span>`).join('')}
      </div>
      ${p.link ? `<a href="${p.link}" target="_blank" rel="noopener noreferrer" class="project-link">View on GitHub</a>` : ''}
    </article>
  `,
  ).join('');

  return `
    <h2 class="panel-title">Projects</h2>
    <div class="projects-list">${cards}</div>
  `;
}
