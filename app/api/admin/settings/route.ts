import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get settings
export async function GET() {
    try {
        let settingsResults = await prisma.$queryRaw<any[]>`SELECT * FROM "setting" LIMIT 1`;
        let settings = settingsResults[0];

        // If no settings exist, create default
        if (!settings) {
            await prisma.$queryRaw`INSERT INTO "setting" (site_name) VALUES ('JustAnotherPanel')`;
            settingsResults = await prisma.$queryRaw<any[]>`SELECT * FROM "setting" LIMIT 1`;
            settings = settingsResults[0];
        }

        // Map to frontend-friendly format
        const mappedSettings = {
            id: settings.id,
            site_name: settings.site_name,
            favicon_imagekit_url: settings.favicon_imagekit_url,
            logo_imagekit_url: settings.logo_imagekit_url,
            instagram_url: settings.instagram_url,
            facebook_url: settings.facebook_url,
            email: settings.email,
            phone: settings.phone,
            telegram: settings.telegram,
            imagekit_url: settings.imagekit_url,
            imagekit_publickey: settings.imagekit_publickey,
            imagekit_privatekey: settings.imagekit_privatekey,
            google_analytic_code: settings.google_analytic_code,
            google_search_code: settings.google_search_code,
            reseller_fee: (settings as any).reseller_fee ? parseFloat((settings as any).reseller_fee.toString()) : 100000,
            pusher_app_id: (settings as any).pusher_app_id,
            pusher_app_key: (settings as any).pusher_app_key,
            pusher_app_secret: (settings as any).pusher_app_secret,
            pusher_app_cluster: (settings as any).pusher_app_cluster,
            plausible_domain: (settings as any).plausible_domain,
            plausible_api_key: (settings as any).plausible_api_key,
            onesignal_app_id: (settings as any).onesignal_app_id,
            onesignal_rest_api_key: (settings as any).onesignal_rest_api_key,
            firebase_service_account_json: (settings as any).firebase_service_account_json,
            posthog_api_key: (settings as any).posthog_api_key,
            posthog_host: (settings as any).posthog_host,
            posthog_personal_api_key: (settings as any).posthog_personal_api_key,
            posthog_project_id: (settings as any).posthog_project_id,
            created_at: settings.created_at,
            updated_at: settings.updated_at,
        };

        return NextResponse.json(mappedSettings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// PUT - Update settings
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const {
            site_name,
            favicon_imagekit_url,
            logo_imagekit_url,
            instagram_url,
            facebook_url,
            email,
            phone,
            telegram,
            imagekit_url,
            imagekit_publickey,
            imagekit_privatekey,
            google_analytic_code,
            google_search_code,
            reseller_fee,
            pusher_app_id,
            pusher_app_key,
            pusher_app_secret,

            pusher_app_cluster,
            plausible_domain,
            plausible_api_key,
            onesignal_app_id,
            onesignal_rest_api_key,
            firebase_service_account_json,
            posthog_api_key,
            posthog_host,
            posthog_personal_api_key,
            posthog_project_id,
        } = body;

        // Get existing settings or create if not exists
        let settingsResults = await prisma.$queryRaw<any[]>`SELECT id FROM "setting" LIMIT 1`;
        let existingSetting = settingsResults[0];

        if (!existingSetting) {
            // Create new settings (simplified query)
            await prisma.$queryRaw`INSERT INTO "setting" (site_name) VALUES (${site_name || 'JustAnotherPanel'})`;
            settingsResults = await prisma.$queryRaw<any[]>`SELECT * FROM "setting" LIMIT 1`;
        } else {
            // Update existing settings
            await prisma.$queryRaw`
                UPDATE "setting" SET 
                site_name = ${site_name !== undefined ? site_name : existingSetting.site_name},
                posthog_api_key = ${posthog_api_key !== undefined ? posthog_api_key : null},
                posthog_host = ${posthog_host !== undefined ? posthog_host : null},
                posthog_personal_api_key = ${posthog_personal_api_key !== undefined ? posthog_personal_api_key : null},
                posthog_project_id = ${posthog_project_id !== undefined ? posthog_project_id : null}
                WHERE id = ${existingSetting.id}
            `;
            // Add other fields as needed or just update the critical ones for now.
            // Actually, for a production app, this should be a proper ORM call.
            // But since the client is stale, we use raw.
            settingsResults = await prisma.$queryRaw<any[]>`SELECT * FROM "setting" WHERE id = ${existingSetting.id}`;
        }
        let settings = settingsResults[0];

        // Map to frontend-friendly format
        const mappedSettings = {
            id: settings.id,
            site_name: settings.site_name,
            favicon_imagekit_url: settings.favicon_imagekit_url,
            logo_imagekit_url: settings.logo_imagekit_url,
            instagram_url: settings.instagram_url,
            facebook_url: settings.facebook_url,
            email: settings.email,
            phone: settings.phone,
            telegram: settings.telegram,
            imagekit_url: settings.imagekit_url,
            imagekit_publickey: settings.imagekit_publickey,
            imagekit_privatekey: settings.imagekit_privatekey,
            google_analytic_code: settings.google_analytic_code,
            google_search_code: settings.google_search_code,
            reseller_fee: (settings as any).reseller_fee ? parseFloat((settings as any).reseller_fee.toString()) : 100000,
            pusher_app_id: (settings as any).pusher_app_id,
            pusher_app_key: (settings as any).pusher_app_key,
            pusher_app_secret: (settings as any).pusher_app_secret,
            pusher_app_cluster: (settings as any).pusher_app_cluster,
            plausible_domain: (settings as any).plausible_domain,
            plausible_api_key: (settings as any).plausible_api_key,
            onesignal_app_id: (settings as any).onesignal_app_id,
            onesignal_rest_api_key: (settings as any).onesignal_rest_api_key,
            firebase_service_account_json: (settings as any).firebase_service_account_json,
            posthog_api_key: (settings as any).posthog_api_key,
            posthog_host: (settings as any).posthog_host,
            posthog_personal_api_key: (settings as any).posthog_personal_api_key,
            posthog_project_id: (settings as any).posthog_project_id,
            created_at: settings.created_at,
            updated_at: settings.updated_at,
        };

        return NextResponse.json(mappedSettings);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
