import AdminTicketsClient from './TicketsClient';
import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: "Support Tickets",
  description: "Manage support tickets."
};

export default async function TicketsPage() {
  const session = await getCurrentUser();

  if (!session || session.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  return <AdminTicketsClient />;
}
