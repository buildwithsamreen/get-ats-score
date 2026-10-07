// Fictional sample resume used for template thumbnails on the landing page.
export const SAMPLE_RESUME = {
  title: 'Sample',
  templateId: 'ats_classic',
  basics: {
    fullName: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phone: '(555) 010-2030',
    location: 'Denver, CO',
    links: ['linkedin.com/in/alexmorgan'],
  },
  summary:
    'Product-minded software engineer with 8 years of experience building fast, accessible web apps used by millions. Known for shipping quickly and mentoring teams.',
  skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'GraphQL', 'CI/CD'],
  experience: [
    {
      role: 'Senior Software Engineer',
      company: 'Globex',
      location: 'Denver, CO',
      startDate: 'Mar 2021',
      endDate: '',
      isCurrent: true,
      bullets: [
        'Led the rebuild of the checkout flow in React, lifting conversion by 18% across 2M monthly users',
        'Cut page load time by 42% by introducing code splitting and edge caching',
        'Mentored 5 engineers and set up the team’s code review guidelines',
      ],
    },
    {
      role: 'Software Engineer',
      company: 'Initech',
      location: 'Remote',
      startDate: 'Jun 2017',
      endDate: 'Feb 2021',
      isCurrent: false,
      bullets: [
        'Built a GraphQL API serving 40+ internal tools and reduced duplicate queries by 60%',
        'Automated deployments with GitHub Actions, shrinking release time from 2 hours to 15 minutes',
      ],
    },
  ],
  education: [{school: 'University of Colorado', degree: 'B.S.', field: 'Computer Science', startYear: '2013', endYear: '2017'}],
  projects: [{name: 'OpenTrace', link: 'github.com/alex/opentrace', description: 'Open-source tracing library with 2k GitHub stars', bullets: []}],
  certifications: ['AWS Certified Developer – Associate'],
}
