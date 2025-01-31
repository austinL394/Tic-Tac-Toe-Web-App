// src/dto/user.dto.ts

export interface payload {
  id: string | number;
}

export class UserResponse {
  name: string;
  email: string;
  role: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: string;
}