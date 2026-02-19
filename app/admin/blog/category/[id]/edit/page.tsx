import { getCategory } from '../../../actions';
import EditCategoryClient from './EditCategoryClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
    const category = await getCategory(parseInt(params.id));

    if (!category) {
        notFound();
    }

    return <EditCategoryClient category={category as any} />;
}
