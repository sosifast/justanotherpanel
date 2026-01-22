import React from 'react';
import { Metadata } from 'next';
import SmmImportClient from './SmmImportClient';

export const metadata: Metadata = {
  title: 'Import',
  description: 'Import services from external API providers into your SMM panel.',
};

export default function SmmImportPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <SmmImportClient />
    </div>
  );
}
