import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get settings
export async function GET() {
    try {
        let settings = await prisma.setting.findFirst();

        // If no settings exist, create default
        if (!settings) {
            settings = await prisma.setting.create({
                data: {
                    site_name: 'JustAnotherPanel',
                }
            });
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
            reseller_fee
        } = body;

        // Get existing settings or create if not exists
        let settings = await prisma.setting.findFirst();

        if (!settings) {
            // Create new settings
            settings = await prisma.setting.create({
                data: {
                    site_name: site_name || 'JustAnotherPanel',
                    favicon_imagekit_url: favicon_imagekit_url || null,
                    logo_imagekit_url: logo_imagekit_url || null,
                    instagram_url: instagram_url || null,
                    facebook_url: facebook_url || null,
                    email: email || null,
                    phone: phone || null,
                    telegram: telegram || null,
                    imagekit_url: imagekit_url || null,
                    imagekit_publickey: imagekit_publickey || null,
                    imagekit_privatekey: imagekit_privatekey || null,
                    google_analytic_code: google_analytic_code || null,
                    google_search_code: google_search_code || null,
                    reseller_fee: reseller_fee !== undefined ? reseller_fee : 100000,
                } as any
            });
        } else {
            // Update existing settings
            settings = await prisma.setting.update({
                where: { id: settings.id },
                data: {
                    site_name: site_name !== undefined ? site_name : settings.site_name,
                    favicon_imagekit_url: favicon_imagekit_url !== undefined ? favicon_imagekit_url : settings.favicon_imagekit_url,
                    logo_imagekit_url: logo_imagekit_url !== undefined ? logo_imagekit_url : settings.logo_imagekit_url,
                    instagram_url: instagram_url !== undefined ? instagram_url : settings.instagram_url,
                    facebook_url: facebook_url !== undefined ? facebook_url : settings.facebook_url,
                    email: email !== undefined ? email : settings.email,
                    phone: phone !== undefined ? phone : settings.phone,
                    telegram: telegram !== undefined ? telegram : settings.telegram,
                    imagekit_url: imagekit_url !== undefined ? imagekit_url : settings.imagekit_url,
                    imagekit_publickey: imagekit_publickey !== undefined ? imagekit_publickey : settings.imagekit_publickey,
                    imagekit_privatekey: imagekit_privatekey !== undefined ? imagekit_privatekey : settings.imagekit_privatekey,
                    google_analytic_code: google_analytic_code !== undefined ? google_analytic_code : settings.google_analytic_code,
                    google_search_code: google_search_code !== undefined ? google_search_code : settings.google_search_code,
                    reseller_fee: reseller_fee !== undefined ? reseller_fee : (settings as any).reseller_fee,
                } as any
            });
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
            created_at: settings.created_at,
            updated_at: settings.updated_at,
        };

        return NextResponse.json(mappedSettings);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
