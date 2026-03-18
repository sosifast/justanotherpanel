import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromAuth } from '@/lib/auth';
import axios from 'axios';
import FormData from 'form-data';

export async function POST(req: Request) {
    try {
        const userId = await getUserIdFromAuth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all refill orders for this user that are not in a final state
        const pendingRefills = await (prisma as any).reffilOrder.findMany({
            where: {
                id_user: userId,
                status: 'PENDING'
            },
            include: {
                api_provider: true
            }
        });

        if (pendingRefills.length === 0) {
            return NextResponse.json({ message: 'No pending refill requests to sync.' });
        }

        let updatedCount = 0;
        let errorCount = 0;

        for (const refill of pendingRefills) {
            if (!refill.pid_reffil || !refill.api_provider) continue;

            try {
                const data = new FormData();
                data.append('key', refill.api_provider.api_key);
                data.append('action', 'refill_status');
                data.append('refill', refill.pid_reffil);

                const config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: refill.api_provider.url,
                    headers: {
                        ...data.getHeaders()
                    },
                    data: data
                };

                const response = await axios.request(config);
                const apiStatus = response.data?.status;

                if (apiStatus) {
                    // Map API status to local ReffilStatus enum
                    // Expected from API: "Completed", "Pending", etc.
                    // Local Enum: PENDING, ERROR, COMPLETED, SUCCESS, FINISH
                    let newStatus = refill.status;
                    const upperStatus = apiStatus.toUpperCase();

                    if (upperStatus === 'COMPLETED' || upperStatus === 'SUCCESS' || upperStatus === 'FINISHED' || upperStatus === 'FINISH') {
                        newStatus = 'COMPLETED';
                    } else if (upperStatus === 'ERROR' || upperStatus === 'FAIL' || upperStatus === 'FAILED') {
                        newStatus = 'ERROR';
                    } else if (upperStatus === 'PENDING') {
                        newStatus = 'PENDING';
                    }

                    if (newStatus !== refill.status) {
                        await (prisma as any).reffilOrder.update({
                            where: { id: refill.id },
                            data: { status: newStatus }
                        });
                        updatedCount++;
                    }
                }
            } catch (err) {
                console.error(`Error syncing refill ID ${refill.id}:`, err);
                errorCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Sync completed. ${updatedCount} status(es) updated. ${errorCount} error(s).`
        });

    } catch (error) {
        console.error('Refill Sync Error:', error);
        return NextResponse.json({ error: 'Internal Server Error during refill sync.' }, { status: 500 });
    }
}
