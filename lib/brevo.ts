import { BrevoClient } from '@getbrevo/brevo';

/**
 * Brevo Email Helper for v4.x SDK
 * Force refresh to trigger recompilation for Turbopack
 */
export async function sendEmail({ to, subject, htmlContent }: { to: string; subject: string; htmlContent: string }) {
    if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === 'your_brevo_api_key_here') {
        console.warn('Brevo API Key is not configured. Email not sent.');
        return { success: false, error: 'Brevo API Key not configured' };
    }

    try {
        const client = new BrevoClient({
            apiKey: process.env.BREVO_API_KEY,
        });

        const response = await client.transactionalEmails.sendTransacEmail({
            subject,
            htmlContent,
            sender: {
                name: process.env.BREVO_SENDER_NAME || 'JustAnotherPanel',
                email: process.env.BREVO_SENDER_EMAIL || 'noreply@justanotherpanel.com'
            },
            to: [{ email: to }],
        });

        return { success: true, data: response };
    } catch (error) {
        console.error('Brevo Email Error:', error);
        return { success: false, error };
    }
}
