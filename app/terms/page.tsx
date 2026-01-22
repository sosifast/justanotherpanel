import React from 'react';
import { Metadata } from 'next';
import TermsView from './TermsView';

export const metadata: Metadata = {
    title: "Terms",
    description: "Terms of Service for JustAnotherPanel.",
};

export default function Page() {
    return <TermsView />;
}
