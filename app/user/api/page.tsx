import React from 'react';
import { Metadata } from 'next';
import ApiView from './ApiView';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: "API",
    description: "Integrate our SMM services into your application using our API.",
};

export default async function ApiPage() {
    const session = await getCurrentUser();

    if (!session) {
        redirect('/auth/login');
    }

    return <ApiView />;
}
