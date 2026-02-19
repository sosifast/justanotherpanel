
import { getSeoPageData } from './actions';
import SeoForm from './SeoForm';
import { Search } from 'lucide-react';

export default async function SeoPage() {
    const data = await getSeoPageData();

    return (
        <div className="w-full px-4 md:px-6">
            <div className="mb-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <Search className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">SEO Management</h1>
                    <p className="text-slate-500">Manage meta titles and descriptions for your application pages.</p>
                </div>
            </div>

            <SeoForm initialData={data} />
        </div>
    );
}
