/** Auth types — match Nest AuthResponseDto / UserResponseDto. */

export type AuthUser = {
  id: string
  email: string
  name: string
  createdAt?: string
}

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export type AuthResponse = AuthTokens & {
  user: AuthUser
}

export type SignupBody = {
  email: string
  name: string
  password: string
  confirmPassword: string
}

export type LoginBody = {
  email: string
  password: string
}
