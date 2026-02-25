'use client';

import { useEffect } from 'react';
import { usePusherNotifications } from '@/hooks/usePusherNotifications';

interface Props {
    userId: number;
    pusherKey: string;
    pusherCluster: string;
}

/**
 * Drop-in Pusher provider for the user panel layout.
 * Subscribe to private-user-{id} and fire toast + CustomEvents.
 */
export default function UserPusherProvider({ userId, pusherKey, pusherCluster }: Props) {
    usePusherNotifications({ userId, pusherKey, pusherCluster });
    return null; // renders nothing — side-effect only
}
