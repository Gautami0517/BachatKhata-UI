/** Backend rule: min 8 chars, at least one letter and one number. */
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

export function isValidPassword(password: string): boolean {
  return PASSWORD_RULE.test(password)
}

export const PASSWORD_HINT =
  'Password must be at least 8 characters and include a letter and a number.'
