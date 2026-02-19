import { getArticle, getCategories } from '../../../actions';
import EditArticleClient from './EditArticleClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditArticlePage({ params }: { params: { id: string } }) {
    const [article, categories] = await Promise.all([
        getArticle(parseInt(params.id)),
        getCategories()
    ]);

    if (!article) {
        notFound();
    }

    return <EditArticleClient article={article as any} categories={categories} />;
}
