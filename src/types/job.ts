export interface Company {
  id: string;
  name: string;
  logoUrl?: string | null;
  industry?: string;
  website?: string | null;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  companyId: string;
  location: string;
  employmentType: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  requirements: string[];
  responsibilities: string[];
  applyLink?: string | null;
  postedAt: Date | string;
  expiresAt?: Date | string | null;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  company?: Company;
}
