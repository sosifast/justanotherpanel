import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getArticles() {
    return await prisma.articlePost.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { created_at: 'desc' },
        include: { category: true }
    });
}

export default async function BlogPage() {
    const articles = await getArticles();

    return (
        <div className="min-h-screen bg-slate-50">


            <div className="max-w-7xl mx-auto px-6 pt-12 pb-6">
                <h1 className="text-3xl font-bold text-slate-900 pb-4">
                    Latest Updates
                </h1>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-12">
                {articles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article) => (
                            <article
                                key={article.id}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-slate-100 flex flex-col"
                            >
                                <div className="relative h-48 w-full bg-slate-200">
                                    {article.banner_imagekit_upload_url ? (
                                        <img
                                            src={article.banner_imagekit_upload_url}
                                            alt={article.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <span className="text-4xl font-bold opacity-20">No Image</span>
                                        </div>
                                    )}
                                    {article.category && (
                                        <span className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                                            {article.category.name}
                                        </span>
                                    )}
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center text-xs text-slate-500 mb-3 gap-4">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(article.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                                        <Link href={`/blog/${article.slug}`}>
                                            {article.name}
                                        </Link>
                                    </h2>

                                    <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1">
                                        {article.desc_seo || article.seo_title || 'Read more to discover insights...'}
                                    </p>

                                    <Link
                                        href={`/blog/${article.slug}`}
                                        className="inline-flex items-center text-blue-600 font-semibold text-sm hover:gap-2 transition-all group mt-auto"
                                    >
                                        Read Article <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Tag className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No articles yet</h3>
                        <p className="text-slate-500 text-sm mt-1">Check back later for updates.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
