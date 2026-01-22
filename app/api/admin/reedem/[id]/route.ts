import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RedeemStatus } from '@prisma/client';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name_code, quota, expired_date, get_balance, status, total_info } = body;

        const updateData: any = {};
        if (name_code) updateData.name_code = name_code;
        if (quota !== undefined) updateData.quota = parseInt(quota);
        if (expired_date) updateData.expired_date = new Date(expired_date);
        if (get_balance !== undefined) updateData.get_balance = parseFloat(get_balance);
        if (status) updateData.status = status as RedeemStatus;
        if (total_info !== undefined) updateData.total_info = total_info;

        const updatedCode = await prisma.redeemCode.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                _count: {
                    select: { used_by: true }
                }
            }
        });

        return NextResponse.json({
            ...updatedCode,
            get_balance: Number(updatedCode.get_balance)
        });
    } catch (error: any) {
        console.error('Error updating redeem code:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Code name already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to update redeem code' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check if code has been used
        const code = await prisma.redeemCode.findUnique({
            where: { id: parseInt(id) },
            include: { _count: { select: { used_by: true } } }
        });

        if (!code) {
            return NextResponse.json({ error: 'Redeem code not found' }, { status: 404 });
        }

        if (code._count.used_by > 0) {
            return NextResponse.json({ error: 'Cannot delete code that has usage history' }, { status: 400 });
        }

        await prisma.redeemCode.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ message: 'Redeem code deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting redeem code:', error);
        return NextResponse.json({ error: 'Failed to delete redeem code' }, { status: 500 });
    }
}
