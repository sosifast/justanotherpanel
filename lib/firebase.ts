/**
 * lib/firebase.ts
 *
 * Firebase Admin SDK helper for sending FCM push notifications.
 *
 * Configuration is loaded from `Setting.firebase_service_account_json`
 * (stored in the database) combined with FIREBASE_PROJECT_ID env var.
 *
 * The service account JSON is the file you download from:
 *   Firebase Console → Project Settings → Service Accounts → Generate new private key
 */

import { prisma } from '@/lib/prisma';
import admin from 'firebase-admin';

let initialized = false;

async function getFirebaseApp(): Promise<admin.app.App | null> {
    if (initialized) {
        return admin.apps[0] ?? null;
    }

    try {
        // Load service account from DB setting
        const setting = await prisma.setting.findFirst({
            select: { firebase_service_account_json: true },
        });

        if (!setting?.firebase_service_account_json) {
            console.warn('[Firebase] firebase_service_account_json not configured in settings.');
            return null;
        }

        const serviceAccount = JSON.parse(setting.firebase_service_account_json);

        // Initialize only once
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }

        initialized = true;
        return admin.apps[0]!;

    } catch (err) {
        console.error('[Firebase] Failed to initialize Firebase Admin SDK:', err);
        return null;
    }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FcmPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
}

// ─── Core send function ───────────────────────────────────────────────────────

/**
 * Send a push notification to a single FCM token.
 * Returns true on success, false on failure (non-throwing).
 */
export async function sendFcmNotification(
    fcmToken: string,
    payload: FcmPayload
): Promise<boolean> {
    const app = await getFirebaseApp();
    if (!app) return false;

    try {
        await admin.messaging(app).send({
            token: fcmToken,
            notification: {
                title: payload.title,
                body: payload.body,
                ...(payload.imageUrl ? { imageUrl: payload.imageUrl } : {}),
            },
            data: payload.data ?? {},
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                    },
                },
            },
        });
        return true;
    } catch (err: any) {
        // Token expired/invalid — remove it from DB so it won't be retried
        if (
            err.code === 'messaging/registration-token-not-registered' ||
            err.code === 'messaging/invalid-registration-token'
        ) {
            await prisma.userSession.updateMany({
                where: { fcm_token: fcmToken },
                data: { fcm_token: null },
            }).catch(() => { });
        }
        console.error('[Firebase] sendFcmNotification error:', err?.code ?? err?.message);
        return false;
    }
}

/**
 * Send push notification to ALL active sessions of a user.
 * Gracefully handles missing tokens.
 */
export async function sendPushToUser(
    userId: number,
    payload: FcmPayload
): Promise<void> {
    try {
        const sessions = await prisma.userSession.findMany({
            where: {
                id_user: userId,
                fcm_token: { not: null },
            },
            select: { fcm_token: true },
        });

        if (!sessions.length) return;

        const tokens = sessions
            .map((s) => s.fcm_token)
            .filter((t): t is string => !!t);

        await Promise.allSettled(
            tokens.map((token) => sendFcmNotification(token, payload))
        );
    } catch (err) {
        console.error('[Firebase] sendPushToUser error:', err);
    }
}

/**
 * Broadcast push notification to ALL users with active FCM tokens.
 */
export async function broadcastFcmNotification(payload: FcmPayload): Promise<void> {
    try {
        const sessions = await prisma.userSession.findMany({
            where: { fcm_token: { not: null } },
            select: { fcm_token: true }
        });

        if (!sessions.length) return;

        const tokens = sessions
            .map((s) => s.fcm_token)
            .filter((t): t is string => !!t);

        // Deduplicate tokens
        const uniqueTokens = Array.from(new Set(tokens));

        await Promise.allSettled(
            uniqueTokens.map((token) => sendFcmNotification(token, payload))
        );
    } catch (err) {
        console.error('[Firebase] broadcastFcmNotification error:', err);
    }
}
