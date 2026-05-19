export const content = {
  brand: {
    name: 'AI CareerOS',
    tagline: 'Your Personal AI Career Operating System',
  },
  nav: {
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Testimonials', href: '#testimonials' },
    ],
    cta: 'Get Early Access',
    signIn: 'Sign In',
  },
  hero: {
    headline: 'Your Career, Supercharged by AI',
    subheadline:
      'AI CareerOS builds a living map of your skills, experience, and potential — then crafts personalized resumes, interview prep, and career strategies that actually sound like you.',
    primaryCta: 'Get Early Access',
    secondaryCta: 'See How It Works',
  },
  features: {
    title: 'Built for a career that never stops evolving',
    subtitle:
      'Unlike generic AI resume builders, AI CareerOS learns your unique voice and goals — then adapts as your career grows.',
    items: [
      {
        icon: 'FileText',
        title: 'Personalized Resumes',
        description:
          'Resumes that read like you, not a template. Each version tailored to the role, your voice, your story.',
      },
      {
        icon: 'Brain',
        title: 'AI Career Coach',
        description:
          'Get interview prep, salary negotiation scripts, and career advice calibrated to your industry and experience level.',
      },
      {
        icon: 'Target',
        title: 'Skill Gap Analysis',
        description:
          'AI maps your current skills against your dream role and shows exactly what to learn next.',
      },
      {
        icon: 'Building2',
        title: 'For Employers',
        description:
          'Plug into our talent pipeline. See verified skill profiles of candidates who match your culture and requirements.',
      },
      {
        icon: 'GraduationCap',
        title: 'For Universities',
        description:
          'Give students an AI career center that scales. Boost placement rates with personalized coaching at no extra headcount.',
      },
      {
        icon: 'Zap',
        title: 'Real-Time Market Data',
        description:
          'Our AI ingests live job market trends so your resume and strategy stay ahead of the curve.',
      },
    ],
  },
  pricing: {
    title: 'Simple pricing, powerful results',
    subtitle: 'Start free, upgrade when you need more firepower.',
    plans: [
      {
        name: 'Free',
        price: '$0',
        period: 'forever',
        description: 'Perfect for getting started.',
        features: [
          'AI resume builder (3/month)',
          'Basic skill analysis',
          'Career tips & insights',
        ],
        cta: 'Get Started',
        highlighted: false,
      },
      {
        name: 'Pro',
        price: '$12',
        period: '/month',
        description: 'For serious career growth.',
        features: [
          'Unlimited AI resumes',
          'Advanced skill gap analysis',
          'AI interview coach',
          'Salary insights & negotiation',
          'Priority support',
        ],
        cta: 'Start Free Trial',
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        description: 'For employers & universities.',
        features: [
          'White-label career hub',
          'Bulk student/employee accounts',
          'Placement analytics dashboard',
          'Dedicated account manager',
          'API access',
        ],
        cta: 'Contact Sales',
        highlighted: false,
      },
    ],
  },
  testimonials: {
    title: 'Trusted by career accelerators',
    subtitle: 'From job seekers to enterprise HR teams.',
    items: [
      {
        quote:
          'The personalized resume builder saved me hours. I got an interview within a week using a version AI CareerOS tailored for me.',
        name: 'Sarah Chen',
        title: 'Product Manager at Finlytics',
        avatar: 'SC',
      },
      {
        quote:
          'We deployed AI CareerOS across our career center. Student placement rates improved 34% in one semester.',
        name: 'Dr. Marcus Webb',
        title: 'Director of Career Services, Westlake University',
        avatar: 'MW',
      },
      {
        quote:
          'The skill gap analysis showed me exactly what certifications I needed. Landed a senior role 3 months ahead of my target.',
        name: 'Priya Patel',
        title: 'Senior DevOps Engineer',
        avatar: 'PP',
      },
    ],
  },
  cta: {
    headline: 'Ready to put your career on autopilot?',
    subheadline:
      'Join thousands of professionals and leading institutions already using AI CareerOS.',
    button: 'Get Early Access — Free',
  },
  footer: {
    description:
      'AI CareerOS — the intelligent career platform that grows with you.',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
    copyright: `© ${new Date().getFullYear()} AI CareerOS. All rights reserved.`,
  },
}
