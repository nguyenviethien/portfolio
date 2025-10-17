export const profile = {
  name: 'Your Name',
  title: 'Senior Product Designer',
  location: 'Seoul, South Korea',
  // Stack Overflow user id for portfolio integration
  // Example: 4964569
  stackoverflowId: 4964569,
  summary: [
    'Designing data-dense industrial platforms that pair mission-critical insight with intuitive workflows.',
    'Led the end-to-end UX for HanPrism Insight 3.1, delivering cohesive dashboard, alarm, and mimic experiences.',
    'Partnered with cross-functional teams to ship reliable tools for power plant operators and energy analysts.'
  ],
  contact: {
    email: 'you@example.com',
    phone: '+82-10-1234-5678',
    portfolio: 'https://your-portfolio.com',
    linkedin: 'https://www.linkedin.com/in/nguyenviethien',
    stackoverflow: 'https://stackoverflow.com/users/4964569',
    github: 'https://github.com/nguyenviethien'
  },
  heroImage: {
    src: process.env.PUBLIC_URL + '/assets/hanprism-hero.svg',
    alt: 'Composite of HanPrism Insight dashboards and controls'
  }
};

// Removed unused exports: skills, experiences

export const caseStudies = [
  {
    id: 'dashboard-suite',
    product: 'HanPrism Insight 3.1',
    title: 'Dashboard Intelligence Suite',
    description: 'Created a cohesive journey from discovery to deep-dive analysis for mission-critical dashboards.',
    screens: [
      'Dashboard List screen',
      'Dashboard view mode',
      'Dashboard Edit mode'
    ],
    images: [
      {
        src: process.env.PUBLIC_URL + '/assets/dashboard-list.svg',
        alt: 'Dashboard list grid with multiple analytics tiles'
      },
      {
        src: process.env.PUBLIC_URL + '/assets/dashboard-view.svg',
        alt: 'Dashboard view with chart widgets and equipment model'
      },
      {
        src: process.env.PUBLIC_URL + '/assets/dashboard-edit.svg',
        alt: 'Dashboard edit interface with draggable widgets'
      }
    ],
    impact: 'Unified interaction patterns reduced navigation time by 34 percent during field evaluations.',
    tone: 'blue'
  },
  {
    id: 'alert-governance',
    product: 'HanPrism Insight 3.1',
    title: 'Alert Governance Controls',
    description: 'Designed range and sound management to let engineers tune alerts without compromising safety.',
    screens: [
      'Range Alert Settings',
      'Tag List screen',
      'Alarm screen'
    ],
    images: [
      {
        src: process.env.PUBLIC_URL + '/assets/range-alerts.svg',
        alt: 'Alert range configuration interface'
      },
      {
        src: process.env.PUBLIC_URL + '/assets/alarm-viewer.svg',
        alt: 'Alarm viewer table highlighting statuses'
      },
      {
        src: process.env.PUBLIC_URL + '/assets/tag-list.svg',
        alt: 'Point viewer with detailed sensor configuration'
      }
    ],
    impact: 'Improved alarm resolution workflow satisfaction scores from 3.2 to 4.6 out of 5 in beta.',
    tone: 'purple'
  },
  {
    id: 'mimic-builder',
    product: 'HanPrism Insight 3.1',
    title: 'Mimic Module Modernization',
    description: 'Refreshed the mimic workspace to provide scalable compositions for complex plant schematics.',
    screens: [
      'Mimic module screen',
      'Point Viewer',
      'Feedwater Flow Control layout'
    ],
    images: [
      {
        src: process.env.PUBLIC_URL + '/assets/mimic-module.svg',
        alt: 'Mimic module canvas showing feedwater flow control'
      },
      {
        src: process.env.PUBLIC_URL + '/assets/point-viewer.svg',
        alt: 'Point viewer detail form for sensor configuration'
      },
      {
        src: process.env.PUBLIC_URL + '/assets/energy-console.svg',
        alt: 'Energy management desktop application overview'
      }
    ],
    impact: 'Operators modeled new schematics twice as fast with guided layout presets and contextual palettes.',
    tone: 'green'
  }
];
