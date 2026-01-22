import React from 'react';
import { Metadata } from 'next';
import ApiView from './ApiView';

export const metadata: Metadata = {
    title: "API",
    description: "Integrate our SMM services into your application using our API.",
};

export default function ApiPage() {
    return <ApiView />;
}
