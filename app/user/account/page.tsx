import React from 'react';
import { Metadata } from 'next';
import AccountView from './AccountView';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: "Account",
    description: "Manage your account settings and profile details.",
};

export default async function AccountSettingsPage() {
    const session = await getCurrentUser();

    if (!session) {
        redirect('/auth/login');
    }

    return <AccountView />;
}
