export const site = {
  name: 'Jacob Yablonski',
  title: 'Jacob Yablonski',
  description:
    'Building quiet, reliable data systems — pipelines, models, and infrastructure.',
  url: 'https://jyablonski.dev',
  gaId: 'G-7ZBL7DS0RQ',
  email: 'jyablonski9@gmail.com',
  resumeEmbedUrl:
    'https://drive.google.com/file/d/1PjtiPVPcTMJHrhnOF-xkvP8EPHpWWhkN/preview',
  social: {
    linkedin: 'https://www.linkedin.com/in/jacobyablonski/',
    github: 'https://github.com/jyablonski',
  },
  version: import.meta.env.PUBLIC_SITE_VERSION ?? '0.0.0',
} as const;

export const homeContent = {
  headline: 'Building ',
  headlineAccent: 'quiet, reliable',
  headlineEnd: ' data systems',
  subtitle: [
    'Data engineer in Southern California. I build data platforms end-to-end ',
    'and run a few long-running side projects. ',
    "Lately I've been writing more Go, running things on Kubernetes, and ",
    'building full-stack apps to get more hands-on experience beyond the data layer.',
  ].join(''),
  stack: ['Python', 'Go', 'Terraform', 'AWS', 'Airflow', 'dbt', 'Spark'],
} as const;
