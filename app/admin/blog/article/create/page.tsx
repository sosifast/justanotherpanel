import { getCategories } from '../../actions';
import CreateArticleClient from './CreateArticleClient';

export const dynamic = 'force-dynamic';

export default async function CreateArticlePage() {
    const categories = await getCategories();
    return <CreateArticleClient categories={categories} />;
}
