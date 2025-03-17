/**
 * User Types
 * This file contains type definitions for user-related data
 */

export type UserRole = 'ADMIN' | 'USER' | 'MANAGER';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  avatar?: string;
}

export interface UserResponse {
  success: boolean;
  data?: User[];
  error?: string;
  status?: number;
}

export interface UserRegistrationData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface UserRegistrationResponse {
  success: boolean;
  data?: {
    id: string;
    username: string;
    email: string;
  };
  error?: string;
}

export interface UserProfileResponse {
  firstName: string;
  lastName: string;
  role: UserRole;
  id: string;
  email: string;
  username: string;
}
