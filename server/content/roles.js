// Common keywords per target role, used when the user has no job description.
// Order is rough importance (most commonly requested first). "a|b" lists
// synonyms: any one counts as a match and the first is shown to the user.
// `aliases` help guess a role from a job title.

const ROLES = [
  // Technology
  {
    id: 'software-engineer', label: 'Software Engineer', category: 'Technology',
    aliases: ['software developer', 'programmer', 'sde', 'engineer'],
    keywords: ['software development', 'javascript|js', 'python', 'java', 'sql', 'git', 'rest api|restful', 'data structures', 'algorithms', 'unit testing', 'ci/cd', 'cloud|aws|azure|gcp', 'docker', 'microservices', 'agile|scrum', 'code review', 'debugging', 'system design', 'object oriented|oop', 'linux', 'typescript', 'databases', 'performance', 'scalability'],
  },
  {
    id: 'frontend-developer', label: 'Frontend Developer', category: 'Technology',
    aliases: ['front end', 'front-end', 'ui developer', 'web developer'],
    keywords: ['javascript|js', 'typescript', 'react', 'html', 'css', 'responsive design', 'accessibility|a11y|wcag', 'rest api|restful', 'git', 'redux|state management', 'next.js|nextjs', 'vue|angular', 'sass|scss', 'webpack|vite', 'unit testing|jest', 'cross-browser', 'performance', 'ui/ux|user interface', 'figma', 'component library|design system', 'seo', 'agile|scrum'],
  },
  {
    id: 'backend-developer', label: 'Backend Developer', category: 'Technology',
    aliases: ['back end', 'back-end', 'api developer', 'server'],
    keywords: ['node.js|nodejs|node', 'python', 'java', 'go|golang', 'sql', 'postgresql|postgres', 'mongodb', 'rest api|restful', 'graphql', 'microservices', 'docker', 'kubernetes', 'aws|azure|gcp|cloud', 'redis|caching', 'message queue|kafka|rabbitmq', 'authentication|oauth', 'unit testing', 'ci/cd', 'scalability', 'database design', 'security', 'linux', 'git'],
  },
  {
    id: 'full-stack-developer', label: 'Full-Stack Developer', category: 'Technology',
    aliases: ['full stack', 'fullstack', 'mern'],
    keywords: ['javascript|js', 'typescript', 'react', 'node.js|nodejs|node', 'express', 'html', 'css', 'sql', 'mongodb', 'postgresql|postgres', 'rest api|restful', 'graphql', 'git', 'docker', 'aws|azure|gcp|cloud', 'ci/cd', 'unit testing|jest', 'authentication', 'responsive design', 'agile|scrum', 'deployment'],
  },
  {
    id: 'data-analyst', label: 'Data Analyst', category: 'Technology',
    aliases: ['analytics', 'bi analyst', 'reporting analyst', 'insights analyst'],
    keywords: ['sql', 'excel', 'tableau', 'power bi', 'python', 'data visualization', 'dashboards', 'data analysis', 'statistics', 'data cleaning', 'reporting', 'kpis|metrics', 'stakeholders', 'a/b testing', 'r', 'etl', 'data modeling', 'pivot tables', 'google analytics', 'business intelligence', 'forecasting', 'presentation'],
  },
  {
    id: 'data-scientist', label: 'Data Scientist', category: 'Technology',
    aliases: ['machine learning', 'ml engineer', 'ai engineer'],
    keywords: ['python', 'machine learning', 'sql', 'statistics', 'pandas', 'numpy', 'scikit-learn|sklearn', 'tensorflow|pytorch', 'deep learning', 'data visualization', 'feature engineering', 'model deployment', 'nlp|natural language processing', 'a/b testing', 'r', 'big data|spark', 'jupyter', 'regression', 'classification', 'experimentation', 'aws|azure|gcp|cloud', 'git'],
  },
  {
    id: 'devops-engineer', label: 'DevOps / Cloud Engineer', category: 'Technology',
    aliases: ['devops', 'sre', 'site reliability', 'cloud engineer', 'platform engineer', 'infrastructure'],
    keywords: ['aws|azure|gcp', 'kubernetes|k8s', 'docker', 'terraform', 'ci/cd', 'linux', 'bash|shell scripting', 'python', 'monitoring|observability', 'prometheus|grafana|datadog', 'jenkins|github actions|gitlab ci', 'ansible', 'infrastructure as code|iac', 'networking', 'security', 'incident response', 'automation', 'helm', 'git', 'high availability', 'cost optimization'],
  },
  {
    id: 'qa-engineer', label: 'QA / Test Engineer', category: 'Technology',
    aliases: ['quality assurance', 'tester', 'test engineer', 'sdet', 'qa'],
    keywords: ['test automation', 'selenium', 'cypress|playwright', 'manual testing', 'test cases', 'test plans', 'regression testing', 'api testing|postman', 'bug tracking|jira', 'agile|scrum', 'ci/cd', 'python|java|javascript', 'performance testing', 'integration testing', 'unit testing', 'quality assurance', 'sql', 'git', 'defects'],
  },
  {
    id: 'product-manager', label: 'Product Manager', category: 'Technology',
    aliases: ['product owner', 'pm', 'product lead'],
    keywords: ['product roadmap|roadmap', 'stakeholder management|stakeholders', 'user research', 'requirements|prds', 'agile|scrum', 'prioritization', 'cross-functional', 'kpis|metrics', 'a/b testing', 'go-to-market', 'product strategy', 'user stories', 'data analysis', 'jira', 'customer feedback', 'market research', 'launch', 'experimentation', 'sql', 'okrs'],
  },
  {
    id: 'ux-designer', label: 'UX / UI Designer', category: 'Technology',
    aliases: ['product designer', 'ui designer', 'ux designer', 'interaction designer', 'designer'],
    keywords: ['figma', 'user research', 'wireframes|wireframing', 'prototyping|prototypes', 'usability testing', 'user flows', 'design system', 'interaction design', 'visual design', 'accessibility|wcag', 'personas', 'information architecture', 'responsive design', 'adobe xd|sketch', 'journey mapping', 'stakeholders', 'html|css', 'a/b testing', 'portfolio'],
  },
  {
    id: 'it-support', label: 'IT Support Specialist', category: 'Technology',
    aliases: ['help desk', 'helpdesk', 'desktop support', 'it technician', 'service desk'],
    keywords: ['troubleshooting', 'technical support', 'windows', 'active directory', 'office 365|microsoft 365', 'ticketing|servicenow|zendesk', 'hardware', 'networking', 'customer service', 'macos', 'password resets', 'vpn', 'printers', 'remote support', 'itil', 'documentation', 'sla', 'comptia|a+'],
  },
  // Business
  {
    id: 'project-manager', label: 'Project Manager', category: 'Business',
    aliases: ['program manager', 'project coordinator', 'delivery manager'],
    keywords: ['project management', 'stakeholder management|stakeholders', 'budget', 'risk management', 'scheduling|timelines', 'agile|scrum', 'waterfall', 'pmp', 'cross-functional', 'resource planning', 'status reports|reporting', 'jira|asana|ms project', 'scope', 'deliverables', 'vendor management', 'change management', 'kpis', 'communication', 'process improvement'],
  },
  {
    id: 'business-analyst', label: 'Business Analyst', category: 'Business',
    aliases: ['ba', 'systems analyst', 'process analyst'],
    keywords: ['requirements gathering|requirements', 'stakeholders', 'process improvement', 'sql', 'excel', 'user stories', 'data analysis', 'documentation', 'process mapping|bpmn', 'gap analysis', 'agile|scrum', 'jira', 'uat|user acceptance testing', 'reporting', 'tableau|power bi', 'business cases', 'workflows', 'kpis'],
  },
  {
    id: 'marketing', label: 'Marketing / Digital Marketing', category: 'Business',
    aliases: ['marketing manager', 'digital marketer', 'growth', 'content marketing', 'social media'],
    keywords: ['digital marketing', 'seo', 'sem|ppc|google ads', 'social media', 'content marketing', 'email marketing', 'google analytics', 'campaigns', 'brand|branding', 'lead generation', 'conversion rate|cro', 'copywriting', 'marketing strategy', 'roi', 'hubspot|marketo|salesforce', 'a/b testing', 'market research', 'budget', 'kpis', 'paid social|meta ads'],
  },
  {
    id: 'sales', label: 'Sales Representative', category: 'Business',
    aliases: ['account executive', 'sales rep', 'business development', 'bdr', 'sdr', 'account manager'],
    keywords: ['quota', 'pipeline', 'crm|salesforce|hubspot', 'prospecting', 'lead generation', 'cold calling|outbound', 'negotiation', 'closing', 'account management', 'b2b', 'revenue', 'client relationships|relationship building', 'presentations|demos', 'forecasting', 'territory', 'customer needs', 'upselling', 'saas'],
  },
  {
    id: 'accountant', label: 'Accountant', category: 'Business',
    aliases: ['accounting', 'bookkeeper', 'finance', 'cpa', 'auditor'],
    keywords: ['gaap|ifrs', 'general ledger', 'reconciliation|reconciliations', 'financial statements', 'accounts payable', 'accounts receivable', 'month-end close|month end close', 'excel', 'quickbooks|sap|netsuite|xero', 'tax', 'audit', 'budgeting', 'forecasting', 'journal entries', 'payroll', 'variance analysis', 'cpa', 'compliance'],
  },
  {
    id: 'hr', label: 'HR Generalist / Recruiter', category: 'Business',
    aliases: ['human resources', 'recruiter', 'talent acquisition', 'people operations', 'hr'],
    keywords: ['recruiting|recruitment', 'onboarding', 'employee relations', 'hris|workday|bamboohr', 'benefits', 'compliance', 'performance management', 'talent acquisition', 'interviewing', 'payroll', 'policies', 'training', 'employee engagement', 'ats|applicant tracking', 'offboarding', 'labor law|employment law', 'shrm'],
  },
  {
    id: 'customer-service', label: 'Customer Service Representative', category: 'Business',
    aliases: ['customer support', 'call center', 'client service', 'customer success', 'support agent'],
    keywords: ['customer service', 'customer satisfaction|csat', 'problem solving|resolution', 'communication', 'crm|zendesk|salesforce', 'phone|call', 'email|chat', 'complaints', 'de-escalation', 'product knowledge', 'ticketing', 'nps', 'multitasking', 'empathy', 'data entry', 'upselling', 'sla'],
  },
  {
    id: 'operations-manager', label: 'Operations Manager', category: 'Business',
    aliases: ['operations', 'ops manager', 'logistics', 'supply chain'],
    keywords: ['operations management', 'process improvement', 'kpis', 'budget', 'team leadership', 'supply chain', 'logistics', 'inventory', 'vendor management', 'lean|six sigma', 'scheduling', 'cost reduction', 'compliance', 'reporting', 'quality', 'training', 'erp', 'forecasting'],
  },
  // Healthcare
  {
    id: 'registered-nurse', label: 'Registered Nurse', category: 'Healthcare',
    aliases: ['nurse', 'rn', 'nursing', 'staff nurse'],
    keywords: ['patient care', 'rn|registered nurse', 'bls|basic life support', 'acls', 'medication administration', 'patient assessment|assessments', 'ehr|emr|epic|cerner', 'care plans', 'patient education', 'vital signs', 'infection control', 'iv therapy', 'documentation', 'hipaa', 'triage', 'wound care', 'interdisciplinary|multidisciplinary', 'telemetry'],
  },
  {
    id: 'medical-assistant', label: 'Medical Assistant', category: 'Healthcare',
    aliases: ['clinical assistant', 'cma', 'healthcare assistant', 'patient care technician'],
    keywords: ['patient intake', 'vital signs', 'ehr|emr|epic', 'phlebotomy', 'scheduling', 'hipaa', 'medical terminology', 'injections', 'ekg', 'insurance verification', 'patient care', 'cma|certified medical assistant', 'bls|cpr', 'infection control', 'medical records', 'specimen collection'],
  },
  // Education & admin
  {
    id: 'teacher', label: 'Teacher', category: 'Education',
    aliases: ['educator', 'instructor', 'tutor', 'teaching'],
    keywords: ['lesson planning|lesson plans', 'classroom management', 'curriculum', 'differentiated instruction', 'student assessment|assessments', 'student engagement', 'parent communication', 'iep|special education', 'google classroom|lms', 'data-driven instruction', 'teaching certification|certified', 'collaboration', 'educational technology', 'literacy', 'behavior management', 'common core|standards'],
  },
  {
    id: 'administrative-assistant', label: 'Administrative Assistant', category: 'Administrative',
    aliases: ['admin assistant', 'office assistant', 'executive assistant', 'receptionist', 'office manager'],
    keywords: ['microsoft office|ms office', 'excel', 'calendar management|scheduling', 'data entry', 'travel arrangements', 'filing|records', 'customer service', 'communication', 'office management', 'minutes|meeting notes', 'expense reports', 'organization', 'phone', 'correspondence', 'google workspace', 'confidential', 'invoicing'],
  },
]

const roleById = (id) => ROLES.find((r) => r.id === id)

module.exports = { ROLES, roleById }
