import { prisma } from '@/lib/prisma';
import DashboardClient from './DashboardClient';

import { getUserIdFromAuth } from '@/lib/auth';
import { cookies } from 'next/headers';

export const metadata = {
  title: "Dashboard",
  description: "View your SMM stats and recent activities."
};


export default async function UserDashboardPage() {
  // Ensure route is dynamic + resolve authenticated user
  await cookies();
  const userId = await getUserIdFromAuth();
  if (!userId) return <div>Unauthorized</div>;

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      full_name: true,
      username: true,
      email: true,
      balance: true,
      role: true,
      status: true,
      profile_imagekit_url: true
    }
  });

  // Get order statistics
  const totalOrders = await prisma.order.count({
    where: { id_user: userId }
  });

  const activeOrders = await prisma.order.count({
    where: {
      id_user: userId,
      status: {
        in: ['PENDING', 'IN_PROGRESS', 'PROCESSING']
      }
    }
  });

  // Get total spent (sum of price_sale from all orders)
  const totalSpentResult = await prisma.order.aggregate({
    where: { id_user: userId },
    _sum: {
      price_sale: true
    }
  });

  // Get recent orders (last 5)
  const recentOrders = await prisma.order.findMany({
    where: { id_user: userId },
    orderBy: { created_at: 'desc' },
    take: 5,
    include: {
      service: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  // Get active platforms with category count
  const platforms = await prisma.platform.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { categories: true }
      }
    }
  });

  // Get latest news (last 5)
  const news = await prisma.news.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { created_at: 'desc' },
    take: 5,
    select: {
      id: true,
      subject: true,
      content: true,
      created_at: true
    }
  });

  const dashboardData = {
    user: user ? {
      ...user,
      balance: Number(user.balance)
    } : null,
    stats: {
      balance: user ? Number(user.balance) : 0,
      totalSpent: Number(totalSpentResult._sum.price_sale || 0),
      totalOrders,
      activeOrders
    },
    recentOrders: recentOrders.map(order => ({
      id: order.id,
      service: order.service.name,
      serviceId: order.service.id,
      link: order.link,
      quantity: order.quantity,
      status: order.status,
      created_at: order.created_at.toISOString()
    })),
    platforms: platforms.map(p => ({
      ...p,
      _count: p._count
    })),
    news: news.map(n => ({
      ...n,
      created_at: n.created_at.toISOString()
    }))
  };

  return <DashboardClient data={dashboardData} />;
}
