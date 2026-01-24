import { prisma } from './prisma';
import { cache } from 'react';

/**
 * Fetches the site settings from the database.
 * Uses React cache to ensure the query is only executed once per request.
 */
export const getSettings = cache(async () => {
    try {
        const settings = await prisma.setting.findFirst();
        if (!settings) return null;

        return JSON.parse(JSON.stringify(settings));
    } catch (error) {
        console.error('Error fetching settings:', error);
        return null;
    }
});
