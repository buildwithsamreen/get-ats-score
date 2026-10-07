// Help articles. Plain data rendered by pages/Guide.jsx (also read at build
// time for the sitemap and per-route meta tags).
// Block types: p, h2, ul, ol, tip, example ({weak, strong}), cta ({text, to, label}).

export const GUIDES = [
  {
    slug: 'what-is-an-ats',
    title: 'What Is an ATS? How Applicant Tracking Systems Read Your Resume',
    description:
      'Most employers screen resumes with software before a person sees them. Learn how an applicant tracking system works and what it means for your resume.',
    updated: '2026-10-06',
    minutes: 5,
    body: [
      {type: 'p', text: 'An applicant tracking system (ATS) is software that companies use to collect, sort and search job applications. When you apply online, your resume usually goes into an ATS first. A recruiter then searches and filters candidates inside it, often before opening a single resume.'},
      {type: 'p', text: 'That means your resume has two readers: the software, which needs to understand it, and the person, who needs to be convinced by it. A resume that looks great but can\'t be parsed may never reach that person.'},
      {type: 'h2', text: 'What an ATS actually does with your resume'},
      {type: 'ol', items: [
        'Parsing: it extracts text from your file and tries to sort it into fields such as name, contact details, job titles, employers, dates, education and skills.',
        'Storing: those fields become a searchable candidate profile.',
        'Searching and ranking: recruiters search for keywords (for example "SQL" or "project management"), filter by criteria, and some systems rank applicants by how well they match the job.',
      ]},
      {type: 'h2', text: 'Why good candidates get filtered out'},
      {type: 'ul', items: [
        'Unreadable files: scanned PDFs and resumes saved as images contain no text the system can read.',
        'Complex layouts: tables, text boxes, multiple columns and headers/footers can scramble the reading order or hide your contact details.',
        'Unusual headings: a section called "My Journey" may not be recognised as work experience.',
        'Missing keywords: if the job asks for "stakeholder management" and your resume never says it, a keyword search won\'t find you, even if you have the skill.',
      ]},
      {type: 'tip', text: 'A quick test: copy all the text from your PDF and paste it into a plain text editor. If the order is jumbled or parts are missing, an ATS will probably struggle too.'},
      {type: 'h2', text: 'Myths worth ignoring'},
      {type: 'ul', items: [
        '"You need to beat the robot with tricks." Hidden white text and keyword stuffing are easy to spot and look bad when a human reads the resume.',
        '"An ATS automatically rejects 75% of resumes." Most systems help recruiters search and sort; people still make the decisions. Being findable is what matters.',
        '"Fancy design gets noticed." Clean, simple formatting is what gets read correctly.',
      ]},
      {type: 'cta', text: 'See how an ATS reads your resume. Upload it and get a score with specific fixes.', to: '/', label: 'Check my resume'},
    ],
  },
  {
    slug: 'ats-friendly-resume-checklist',
    title: 'The ATS-Friendly Resume Checklist',
    description:
      'A practical checklist for formatting, structure and content so applicant tracking systems read your resume correctly, and recruiters can find you.',
    updated: '2026-10-06',
    minutes: 4,
    body: [
      {type: 'p', text: 'Use this checklist before you send any application. Each item removes a common reason resumes are misread or overlooked.'},
      {type: 'h2', text: 'File and layout'},
      {type: 'ul', items: [
        'Send a text-based PDF or DOCX (not a scanned image), unless the posting asks for a specific format.',
        'Use a single-column layout. Avoid tables, text boxes and side columns for important content.',
        'Keep contact details in the main body, not in the page header or footer.',
        'Use a common font such as Arial, Calibri, Helvetica or Times New Roman, at 10–12pt.',
        'Skip icons, photos, graphs and skill-level bars. They carry no readable information.',
      ]},
      {type: 'h2', text: 'Structure'},
      {type: 'ul', items: [
        'Use standard section headings: Summary, Skills, Experience, Education, Projects, Certifications.',
        'For each job, list job title, company, location and dates on their own lines in a consistent format.',
        'Use simple bullet points (•) for achievements.',
        'Write dates consistently, such as "Mar 2021 – Present".',
      ]},
      {type: 'h2', text: 'Content'},
      {type: 'ul', items: [
        'Include the exact skills and job titles used in the posting, wherever they honestly apply.',
        'Spell out acronyms at least once, e.g. "Search Engine Optimization (SEO)".',
        'Start bullets with action verbs and include numbers that show results.',
        'Keep it to one page for under ~8 years of experience, two pages beyond that.',
        'Proofread: a misspelled skill won\'t match a keyword search.',
      ]},
      {type: 'tip', text: 'Every template in our builder already follows the layout and structure rules above, so you can focus on the content.'},
      {type: 'cta', text: 'Build an ATS-friendly resume from scratch, or import the one you have.', to: '/resumes?new=1', label: 'Open the resume builder'},
    ],
  },
  {
    slug: 'tailor-resume-to-job-description',
    title: 'How to Tailor Your Resume to a Job Description',
    description:
      'A step-by-step method to tailor your resume for each application in 15 minutes: find the keywords that matter and work them in honestly.',
    updated: '2026-10-06',
    minutes: 5,
    body: [
      {type: 'p', text: 'Sending the same resume everywhere is the most common reason qualified people don\'t hear back. Tailoring doesn\'t mean rewriting from scratch. It means making the overlap between you and the job obvious, to both the ATS and the recruiter.'},
      {type: 'h2', text: 'Step 1: Pull out the keywords'},
      {type: 'p', text: 'Read the posting and highlight hard skills (tools, methods, certifications), the job title, and phrases that repeat. Items listed under "requirements" or mentioned more than once matter most.'},
      {type: 'h2', text: 'Step 2: Compare against your resume'},
      {type: 'p', text: 'Check which keywords already appear in your resume and which are missing. Our ATS check does this automatically: paste the job description and it lists matched and missing keywords.'},
      {type: 'h2', text: 'Step 3: Work in the missing ones, honestly'},
      {type: 'ul', items: [
        'Use their wording: if they say "customer success" and you wrote "client support", use their term where it\'s accurate.',
        'Add skills you have but left out to your Skills section.',
        'Rewrite one or two bullets to show the most important requirement in action.',
        'Never claim skills you don\'t have. Interviews will expose it.',
      ]},
      {type: 'example', weak: 'Handled reporting for the sales team', strong: 'Built weekly Tableau dashboards and SQL reports for a 40-person sales team, cutting reporting time by 6 hours a week'},
      {type: 'h2', text: 'Step 4: Reorder for relevance'},
      {type: 'p', text: 'Move the most relevant bullet in each role to the top, and put the most relevant skills first. Update your summary to name the role you\'re applying for.'},
      {type: 'h2', text: 'Step 5: Keep a version per application'},
      {type: 'p', text: 'Duplicate your base resume for each application so you can tailor freely and still keep the original. In our builder, use "Duplicate" on the My Resumes page, then rename the copy after the company.'},
      {type: 'cta', text: 'Paste a job description and see exactly which keywords you\'re missing.', to: '/', label: 'Compare my resume to a job'},
    ],
  },
  {
    slug: 'resume-bullet-points',
    title: 'How to Write Resume Bullet Points That Get Results',
    description:
      'Turn duties into achievements with a simple formula: action verb, what you did, and the measurable result. Includes before-and-after examples.',
    updated: '2026-10-06',
    minutes: 4,
    body: [
      {type: 'p', text: 'Recruiters skim. Your bullet points are where they decide whether you did the job well, not just whether you had it. Strong bullets also tend to contain the keywords an ATS is searching for.'},
      {type: 'h2', text: 'The formula'},
      {type: 'p', text: 'Action verb + what you did + the result (with a number if you can). Not every bullet needs every part, but most should.'},
      {type: 'example', weak: 'Responsible for the company website', strong: 'Redesigned the company website, increasing sign-ups by 25% in three months'},
      {type: 'example', weak: 'Helped with customer support tickets', strong: 'Resolved 60+ support tickets a week with a 96% satisfaction score'},
      {type: 'example', weak: 'Worked on data pipelines', strong: 'Migrated 12 data pipelines to Airflow, cutting nightly run time from 5 hours to 90 minutes'},
      {type: 'h2', text: 'Where to find your numbers'},
      {type: 'ul', items: [
        'Scale: users, customers, revenue, budget, team size, number of projects.',
        'Speed: time saved, faster delivery, shorter response times.',
        'Quality: error rates, satisfaction scores, test coverage, retention.',
        'Money: costs reduced, revenue generated, deals closed.',
      ]},
      {type: 'tip', text: 'No exact figure? An honest estimate ("about 30%", "10+ clients") is far stronger than no number at all.'},
      {type: 'h2', text: 'Common mistakes'},
      {type: 'ul', items: [
        'Starting with "Responsible for", "Worked on" or "Helped with". Say what you did.',
        'Writing in first person ("I managed…"). Drop the "I".',
        'Paragraphs instead of bullets. Keep each bullet to one or two lines.',
        'Listing every task. Pick the 3–5 achievements that matter most for the job.',
      ]},
      {type: 'cta', text: 'Our builder checks every bullet as you type and suggests action verbs.', to: '/resumes?new=1', label: 'Try the bullet checker'},
    ],
  },
]

export const guideBySlug = (slug) => GUIDES.find((g) => g.slug === slug)
