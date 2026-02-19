import { getArticles } from '../actions';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { ArticleStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function ArticleListPage() {
    const articles = await getArticles();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Articles</h1>
                    <p className="text-slate-500 text-sm">Manage your blog posts.</p>
                </div>
                <Link
                    href="/admin/blog/article/create"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Article
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Title</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Created At</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {articles.map((article) => (
                            <tr key={article.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">#{article.id}</td>
                                <td className="px-6 py-4 font-medium text-slate-800">{article.name}</td>
                                <td className="px-6 py-4 text-slate-500">
                                    {article.category ? (
                                        <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full text-xs">
                                            {article.category.name}
                                        </span>
                                    ) : (
                                        <span className="text-slate-300 italic">No Category</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${article.status === ArticleStatus.ACTIVE
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-slate-100 text-slate-800'
                                            }`}
                                    >
                                        {article.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {new Date(article.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <Link
                                        href={`/admin/blog/article/${article.id}/edit`}
                                        className="inline-flex p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {articles.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                    No articles found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
