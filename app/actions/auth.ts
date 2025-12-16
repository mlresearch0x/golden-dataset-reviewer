'use server'

/**
 * Verify password for Nigeria Tax Act 2025 access
 */
export async function verifyNigeriaTaxActPassword(password: string): Promise<boolean> {
  const correctPassword = process.env.NIGERIA_TAX_ACT_PASSWORD;

  if (!correctPassword) {
    console.error('NIGERIA_TAX_ACT_PASSWORD environment variable not set');
    return false;
  }

  return password === correctPassword;
}
