export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
}

export enum UserRole {
  Admin = 'ADMIN',
  User = 'USER',
}

export interface Photo {
  id: number;
  file_name: string;
  s3_key: string;
  url: string;
  title: string;
  description?: string;
  upload_date: string;
  date_taken?: string;
  author?: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  tags: string[];
  people: number[];
}

export interface Person {
  id: number;
  name: string;
  birth_date?: string;
  death_date?: string;
  avatar_url?: string;
  bio?: string;
  photos?: Photo[];
  relationships?: Relationship[];
}

export interface Relationship {
  id: number;
  type: RelationType;
  person1_id: number;
  person2_id: number;
  person1?: Person;
  person2?: Person;
}

export enum RelationType {
  Parent = 'PARENT',
  Child = 'CHILD',
  Spouse = 'SPOUSE',
  Sibling = 'SIBLING',
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
