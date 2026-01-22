import React from 'react';
import { Metadata } from 'next';
import AccountView from './AccountView';

export const metadata: Metadata = {
    title: "Account",
    description: "Manage your account settings and profile details.",
};

export default function AccountSettingsPage() {
    return <AccountView />;
}
