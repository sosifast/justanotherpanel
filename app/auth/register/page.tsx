import React from 'react';
import { Metadata } from 'next';
import RegisterView from './RegisterView';

export const metadata: Metadata = {
    title: "Register",
    description: "Create an account on JustAnotherPanel.",
};

export default function Page() {
    return <RegisterView />;
}
