import { getSettings } from '@/lib/settings';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default async function BlogLayout({ children }: { children: React.ReactNode }) {
    const settings = await getSettings();
    return (
        <>
            <Navbar settings={settings} alwaysSolid={true} />
            <main className="pt-[72px]">
                {children}
            </main>
            <Footer settings={settings} />
        </>
    );
}
