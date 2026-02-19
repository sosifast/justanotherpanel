'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GenerateSeoButton() {
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateSeo = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/seo/generate', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to generate SEO');
            }

            toast.success('Sitemap updated successfully');
        } catch (error) {
            console.error('SEO Generation Error:', error);
            toast.error('Failed to update sitemap');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleGenerateSeo}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Generating...' : 'Generate SEO'}
        </button>
    );
}
