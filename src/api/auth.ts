/**
 * Auth API — public signup/login/refresh/logout + GET /auth/me.
 */
import type { AuthResponse, AuthUser, LoginBody, SignupBody } from '../types/auth'
import { api } from './axios'

export async function signup(body: SignupBody): Promise<void> {
  await api.post('/auth/signup', body)
}

export async function login(body: LoginBody): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', body)
  return data
}

export async function refresh(refreshToken: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/refresh', { refreshToken })
  return data
}

export async function logout(refreshToken: string): Promise<void> {
  await api.post('/auth/logout', { refreshToken })
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>('/auth/me')
  return data
}
