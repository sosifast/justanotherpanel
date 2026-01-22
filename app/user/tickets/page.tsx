import { Metadata } from 'next';
import TicketsView from "./view";

export const metadata: Metadata = {
    title: 'Tickets - JustAnotherPanel',
    description: 'View and manage your support tickets.',
};

export default function TicketsPage() {
    return <TicketsView />;
}
