'use client';

import { usePusherAdmin } from '@/hooks/usePusherNotifications';

interface Props {
    pusherKey: string;
    pusherCluster: string;
}

/**
 * Drop-in Pusher provider for the admin layout.
 * Subscribe to private-admin channel and fire toast + CustomEvents.
 */
export default function AdminPusherProvider({ pusherKey, pusherCluster }: Props) {
    usePusherAdmin({ pusherKey, pusherCluster });
    return null;
}
