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

        // Manually map to ensure plain objects and handle Decimal/Date
        return {
            ...settings,
            reseller_fee: settings.reseller_fee ? Number(settings.reseller_fee) : 100000,
            created_at: settings.created_at.toISOString(),
            updated_at: settings.updated_at.toISOString(),
        };
    } catch (error) {
        console.error('Error fetching settings:', error);
        return null;
    }
});
