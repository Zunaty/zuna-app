export type PasswordRequirement = {
  id: string;
  label: string;
  test: (password: string) => boolean;
};

/** Matches Supabase "lowercase, uppercase, digits and symbols" policy. */
export const passwordRequirements: PasswordRequirement[] = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (password) => password.length >= 8,
  },
  {
    id: "lowercase",
    label: "One lowercase letter",
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: "uppercase",
    label: "One uppercase letter",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: "digit",
    label: "One number",
    test: (password) => /\d/.test(password),
  },
  {
    id: "symbol",
    label: "One symbol",
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
];

export function getPasswordRequirementResults(password: string) {
  return passwordRequirements.map((requirement) => ({
    ...requirement,
    met: requirement.test(password),
  }));
}

export function isPasswordValid(password: string) {
  return passwordRequirements.every((requirement) => requirement.test(password));
}

export const passwordRequirementsSummary =
  "Use at least 8 characters with lowercase, uppercase, a number, and a symbol.";

export const passwordsDoNotMatchMessage = "Passwords do not match.";

export function doPasswordsMatch(password: string, confirmPassword: string) {
  return password === confirmPassword;
}

export function isSignUpPasswordReady(password: string, confirmPassword: string) {
  return isPasswordValid(password) && confirmPassword.length > 0 && doPasswordsMatch(password, confirmPassword);
}
