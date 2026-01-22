import React from 'react';
import { Metadata } from 'next';
import PrivacyView from './PrivacyView';

export const metadata: Metadata = {
    title: "Privacy",
    description: "Privacy Policy for JustAnotherPanel.",
};

export default function Page() {
    return <PrivacyView />;
}
