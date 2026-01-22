import React from 'react';
import { Metadata } from 'next';
import AboutView from './AboutView';

export const metadata: Metadata = {
    title: "About",
    description: "Learn more about JustAnotherPanel and our mission.",
};

export default function Page() {
    return <AboutView />;
}
