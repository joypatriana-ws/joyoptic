import bcrypt from "bcryptjs";

export const hashPassword = (password: string) => bcrypt.hash(password, 12);

/** Aceeași regulă ca în kulttur: minimum 10 caractere. Mesajul de eroare sau null. */
export function passwordProblem(password: string): string | null {
  return password.length < 10 ? "Parola trebuie să aibă minimum 10 caractere." : null;
}
