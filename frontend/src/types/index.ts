export interface Photo {
  id: string;
  url: string;
  title: string;
  description?: string;
  takenAt: string;
  uploadedAt: string;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  tags: string[];
  people: Person[];
}

export interface Person {
  id: string;
  name: string;
  birthDate?: string;
  deathDate?: string;
  biography?: string;
  relationships: Relationship[];
  photos: string[]; // Photo IDs
  avatarUrl?: string;
}

export interface Relationship {
  personId: string;
  type: RelationType;
  startDate?: string;
  endDate?: string;
}

export enum RelationType {
  Parent = 'PARENT',
  Child = 'CHILD',
  Spouse = 'SPOUSE',
  Sibling = 'SIBLING'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export enum UserRole {
  Admin = 'ADMIN',
  Editor = 'EDITOR',
  Viewer = 'VIEWER'
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
