import React from 'react';
import { Metadata } from 'next';
import App from './LandingView';

export const metadata: Metadata = {
    title: "JustAnotherPanel",
    description: "The #1 SMM Panel in the World. We lead, they follow.",
};

export default function Page() {
    return <App />;
}
