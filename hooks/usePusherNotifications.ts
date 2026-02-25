'use client';

import { useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import toast from 'react-hot-toast';

interface PusherOptions {
    userId: number;
    pusherKey: string;
    pusherCluster: string;
}

/**
 * Subscribe to private-user-{userId} channel and show realtime toast notifications.
 * Also subscribes to private-admin if role === 'ADMIN'.
 */
export function usePusherNotifications({ userId, pusherKey, pusherCluster }: PusherOptions) {
    const pusherRef = useRef<Pusher | null>(null);

    useEffect(() => {
        if (!pusherKey || !userId) return;

        const pusher = new Pusher(pusherKey, {
            cluster: pusherCluster,
            authEndpoint: '/api/pusher/auth',
            auth: { headers: {} }, // cookies sent automatically
        });

        pusherRef.current = pusher;

        // ── User channel ─────────────────────────────────────────────────────
        const userChannel = pusher.subscribe(`private-user-${userId}`);

        userChannel.bind('notification', (data: {
            id: number;
            title: string;
            message: string;
            type: string;
            created_at: string;
        }) => {
            const icons: Record<string, string> = {
                ORDER: '🛍️',
                DEPOSIT: '💰',
                TICKET: '🎫',
                SYSTEM: '🔔',
            };
            const icon = icons[data.type] ?? '🔔';

            toast(`${icon} ${data.title}: ${data.message}`, {
                duration: 6000,
                style: { maxWidth: 380 }
            });

            // Dispatch custom event so notification bell can update badge
            window.dispatchEvent(new CustomEvent('pusher:notification', { detail: data }));
        });

        userChannel.bind('deposit-update', (data: { depositId: number; status: string; amount: any }) => {
            if (data.status === 'PAYMENT') {
                toast.success(`💰 Deposit $${data.amount} confirmed!`, { duration: 8000 });
            } else if (data.status === 'CANCELED') {
                toast.error(`❌ Deposit $${data.amount} was cancelled.`, { duration: 8000 });
            }
            window.dispatchEvent(new CustomEvent('pusher:deposit-update', { detail: data }));
        });

        return () => {
            userChannel.unbind_all();
            pusher.unsubscribe(`private-user-${userId}`);
            pusher.disconnect();
        };
    }, [userId, pusherKey, pusherCluster]);
}

/**
 * Subscribe to private-admin channel for admin realtime notifications.
 */
export function usePusherAdmin({ pusherKey, pusherCluster }: { pusherKey: string; pusherCluster: string }) {
    const pusherRef = useRef<Pusher | null>(null);

    useEffect(() => {
        if (!pusherKey) return;

        const pusher = new Pusher(pusherKey, {
            cluster: pusherCluster,
            authEndpoint: '/api/pusher/auth',
            auth: { headers: {} },
        });

        pusherRef.current = pusher;

        const adminChannel = pusher.subscribe('private-admin');

        adminChannel.bind('admin-notification', (data: {
            id: number;
            title: string;
            message: string;
            type: string;
        }) => {
            const icons: Record<string, string> = {
                NEW_ORDER: '🛍️',
                NEW_DEPOSIT: '💰',
                NEW_TICKET: '🎫',
                ORDER_UPDATE: '🔄',
                DEPOSIT_UPDATE: '✅',
                TICKET_UPDATE: '💬',
                NEW_USER: '👤',
                SYSTEM: '⚙️',
            };
            const icon = icons[data.type] ?? '🔔';

            toast(`${icon} ${data.title}: ${data.message}`, {
                duration: 6000,
                style: { maxWidth: 400 }
            });

            window.dispatchEvent(new CustomEvent('pusher:admin-notification', { detail: data }));
        });

        return () => {
            adminChannel.unbind_all();
            pusher.unsubscribe('private-admin');
            pusher.disconnect();
        };
    }, [pusherKey, pusherCluster]);
}

/**
 * Subscribe to a specific ticket channel for live chat.
 * Returns an unsubscribe function.
 */
export function usePusherTicket(
    ticketId: number | null,
    onMessage: (data: { sender: string; message: any }) => void,
    onStatusChange: (data: { status: string }) => void,
    { pusherKey, pusherCluster }: { pusherKey: string; pusherCluster: string }
) {
    const pusherRef = useRef<Pusher | null>(null);

    useEffect(() => {
        if (!pusherKey || !ticketId) return;

        const pusher = new Pusher(pusherKey, {
            cluster: pusherCluster,
            authEndpoint: '/api/pusher/auth',
            auth: { headers: {} },
        });

        pusherRef.current = pusher;

        const channel = pusher.subscribe(`private-ticket-${ticketId}`);
        channel.bind('new-message', onMessage);
        channel.bind('status-changed', onStatusChange);

        return () => {
            channel.unbind_all();
            pusher.unsubscribe(`private-ticket-${ticketId}`);
            pusher.disconnect();
        };
    }, [ticketId, pusherKey, pusherCluster]);
}
