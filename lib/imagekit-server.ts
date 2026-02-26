import { prisma } from '@/lib/prisma';
import ImageKit from 'imagekit';

export async function uploadFileToImageKit(file: File, folder: string = '/mobile_uploads'): Promise<string | null> {
    try {
        const settings = await prisma.setting.findFirst();

        if (!settings?.imagekit_publickey || !settings?.imagekit_privatekey || !settings?.imagekit_url) {
            console.error('ImageKit config missing');
            return null;
        }

        const imagekit = new ImageKit({
            publicKey: settings.imagekit_publickey,
            privateKey: settings.imagekit_privatekey,
            urlEndpoint: settings.imagekit_url,
        });

        const buffer = Buffer.from(await file.arrayBuffer());

        const uploadResponse = await new Promise((resolve, reject) => {
            imagekit.upload({
                file: buffer,
                fileName: file.name || `upload_${Date.now()}.jpg`,
                folder,
            }, function (error, result) {
                if (error) reject(error);
                else resolve(result);
            });
        });

        return (uploadResponse as any).url as string;
    } catch (error) {
        console.error('ImageKit upload error:', error);
        return null; // Don't throw to not break the main flow
    }
}
