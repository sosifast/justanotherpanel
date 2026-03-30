import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import ReportMoneyClient from './ReportMoneyClient';
import { startOfDay, startOfWeek, startOfMonth, startOfYear, subDays, subMonths, endOfMonth } from 'date-fns';

export const dynamic = 'force-dynamic';

async function getStatsForRange(start: Date, end: Date) {
  const result = await prisma.order.aggregate({
    _sum: {
      price_sale: true,
      price_api: true
    },
    _count: true,
    where: {
      status: { notIn: ['CANCELED', 'ERROR'] },
      created_at: {
        gte: start,
        lte: end
      }
    }
  });

  const revenue = Number(result._sum.price_sale || 0);
  const cost = Number(result._sum.price_api || 0);
  
  return {
    revenue,
    cost,
    profit: revenue - cost,
    orderCount: result._count
  };
}

const AdminReportPage = async () => {
  const session = await getCurrentUser();
  if (!session || session.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const now = new Date();
  
  // Fetch statistics in parallel for performance
  const [today, last7Days, last30Days, thisYear] = await Promise.all([
    getStatsForRange(startOfDay(now), now),
    getStatsForRange(subDays(now, 7), now),
    getStatsForRange(subDays(now, 30), now),
    getStatsForRange(startOfYear(now), now)
  ]);

  const initialData = {
    today,
    last7Days,
    last30Days,
    thisYear
  };

  return (
    <div className="p-4 md:p-8">
      <ReportMoneyClient initialData={initialData} />
    </div>
  );
};

export default AdminReportPage;
