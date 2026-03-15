const EDUCATION = [
  {
    period: '2018 — 2025',
    title: 'MEng of Electrical and Computer Engineering',
    place: 'University of Patras',
    note: 'GPA: 7.22 — Thesis: Biped Robot Walking via Reinforcement Learning (Grade: 10/10)',
  },
  {
    period: '2015 — 2018',
    title: '2nd General Highschool of Ptolemaida',
    place: 'Science Faculty',
    note: 'Top 2.5% of the Panhellenic finals',
  },
];

const EXPERIENCE = [
  {
    period: 'Jan 2026 — Present',
    title: 'Software Engineer',
    place: 'Book Scanner',
    note: 'TTS model research for AI e-shop assistant. Desktop applications in Python (PyQt, SQLite). OpenVPN deployment on headless Ubuntu server.',
  },
  {
    period: 'Nov 2024 — Nov 2025',
    title: 'Network and Communications Internship',
    place: 'EU-LISA, Strasbourg',
    note: 'Network architecture design, firewall policy management (Check Point), Cisco IOS administration, IP address management automation. Cisco CCNA and Fortinet certified.',
  },
];

const SKILLS = {
  'ML / AI': ['Machine Learning', 'Reinforcement Learning', 'Computer Vision', 'PyTorch'],
  Robotics: ['Robotics Design', 'Arduino', 'Simulation', 'Control Systems'],
  Languages: ['Python', 'C/C++', 'JavaScript', 'MATLAB'],
  Web: ['Web Development', 'REST APIs', 'Three.js', 'HTML/CSS'],
  Tools: ['Git', 'Docker', 'Linux', 'VS Code', 'JetBrains'],
  Networking: ['Cisco IOS', 'Check Point', 'Fortinet', 'OpenVPN'],
};

export function getCVHTML() {
  function timelineHTML(items) {
    return items
      .map(
        (item) => `
      <div class="timeline-item">
        <span class="timeline-period">${item.period}</span>
        <div class="timeline-body">
          <h3>${item.title}</h3>
          <p class="timeline-place">${item.place}</p>
          ${item.note ? `<p class="timeline-note">${item.note}</p>` : ''}
        </div>
      </div>
    `,
      )
      .join('');
  }

  function skillsHTML() {
    return Object.entries(SKILLS)
      .map(
        ([group, items]) => `
      <div class="skill-group">
        <h4>${group}</h4>
        <div class="skill-chips">
          ${items.map((s) => `<span class="chip">${s}</span>`).join('')}
        </div>
      </div>
    `,
      )
      .join('');
  }

  return `
    <h2 class="panel-title">Curriculum Vitae</h2>

    <h3 class="cv-subtitle">Education</h3>
    <div class="timeline">${timelineHTML(EDUCATION)}</div>

    <h3 class="cv-subtitle">Experience</h3>
    <div class="timeline">${timelineHTML(EXPERIENCE)}</div>

    <h3 class="cv-subtitle">Skills</h3>
    <div class="skills-grid">${skillsHTML()}</div>

  `;
}
