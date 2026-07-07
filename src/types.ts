export interface Project {
  id: string;
  category: 'showreel' | 'social' | 'podcast' | 'personal';
  title: string;
  year: string;
  platform: string;
  roles: string[];
  description: string;
  embedUrl: string;
  link: string;
  ratio: '16-9' | '9-16';
  order: number;
}

export interface AboutSection {
  greeting: string;
  bioParagraphs: string[];
  closingMessage: string;
  imageUrl: string;
}

export interface SkillCategory {
  title: string;
  items: string[];
}

export interface ContactInfo {
  email: string;
  tiktok: string;
  location: string;
  footerText: string;
}

export interface GlobalSettings {
  headingFont: string;
  bodyFont: string;
}

export interface PortfolioContent {
  projects: Project[];
  about: AboutSection;
  skillCategories: SkillCategory[];
  skillTags: string[];
  contactInfo?: ContactInfo;
  globalSettings?: GlobalSettings;
}

export interface AdminConfig {
  passcode: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

