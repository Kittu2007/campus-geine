export function validateEmail(email: string): boolean {
    const domain = process.env.ALLOWED_EMAIL_DOMAIN || 'anurag.edu.in'
    return email.endsWith(`@${domain}`)
}

export function getEmailDomain(): string {
    return process.env.ALLOWED_EMAIL_DOMAIN || 'anurag.edu.in'
}
