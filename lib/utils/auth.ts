export function validateEmail(email: string): boolean {
    const domain = process.env.NEXT_PUBLIC_APP_URL?.includes('localhost')
        ? null // Allow any email in dev mode
        : process.env.ALLOWED_EMAIL_DOMAIN || 'anurag.edu.in'

    if (!domain) return email.includes('@')
    return email.endsWith(`@${domain}`)
}

export function getEmailDomain(): string {
    return process.env.ALLOWED_EMAIL_DOMAIN || 'anurag.edu.in'
}
