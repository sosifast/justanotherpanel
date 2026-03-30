"use server";

import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

export async function getFinancialReport(startDateStr: string, endDateStr: string) {
  try {
    const startDate = startOfDay(parseISO(startDateStr));
    const endDate = endOfDay(parseISO(endDateStr));

    const result = await prisma.order.aggregate({
      _sum: {
        price_sale: true,
        price_api: true
      },
      _count: true,
      where: {
        status: { notIn: ['CANCELED', 'ERROR'] },
        created_at: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const revenue = Number(result._sum.price_sale || 0);
    const cost = Number(result._sum.price_api || 0);

    return {
      success: true,
      data: {
        revenue,
        cost,
        profit: revenue - cost,
        orderCount: result._count
      }
    };
  } catch (error) {
    console.error("Report Fetch Error:", error);
    return { success: false, error: "Failed to fetch report data" };
  }
}
