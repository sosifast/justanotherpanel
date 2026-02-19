import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ArrowRight, Tag, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getArticles() {
    return await prisma.articlePost.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { created_at: 'desc' },
        include: { category: true }
    });
}

export default async function BlogPage() {
    const allArticles = await getArticles();
    const heroArticle = allArticles[0];
    const otherArticles = allArticles.slice(1);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header Section */}
            <div className="bg-slate-900 text-white pt-24 pb-32 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[200%] bg-blue-600/30 blur-[120px] rounded-full mix-blend-screen" />
                    <div className="absolute bottom-[-50%] right-[-20%] w-[80%] h-[200%] bg-purple-600/30 blur-[120px] rounded-full mix-blend-screen" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                            Insights & Updates
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
                            Discover the latest news, tutorials, and deep dives from our team.
                            Stay ahead with expert knowledge and community stories.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-20 pb-20 relative z-20">
                {allArticles.length > 0 ? (
                    <div className="space-y-16">
                        {/* Hero Article */}
                        {heroArticle && (
                            <div className="group relative bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 grid md:grid-cols-12 gap-0 border border-slate-100">
                                <div className="md:col-span-7 relative h-[400px] md:h-auto overflow-hidden">
                                    {heroArticle.banner_imagekit_upload_url ? (
                                        <img
                                            src={heroArticle.banner_imagekit_upload_url}
                                            alt={heroArticle.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                                            <span className="text-slate-400 font-bold opacity-30 text-5xl">No Image</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent md:hidden" />
                                </div>

                                <div className="md:col-span-5 p-8 md:p-12 flex flex-col justify-center bg-white relative">
                                    <div className="flex flex-wrap items-center gap-3 mb-6">
                                        {heroArticle.category && (
                                            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                                                {heroArticle.category.name}
                                            </span>
                                        )}
                                        <span className="flex items-center text-slate-500 text-xs font-medium">
                                            <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                            {new Date(heroArticle.created_at).toLocaleDateString(undefined, {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    <h2 className="text-3xl font-bold text-slate-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                                        <Link href={`/blog/${heroArticle.slug}`} className="focus:outline-none">
                                            <span className="absolute inset-0 md:hidden" />
                                            {heroArticle.name}
                                        </Link>
                                    </h2>

                                    <p className="text-slate-600 mb-8 line-clamp-3 leading-relaxed">
                                        {heroArticle.desc_seo || heroArticle.seo_title || 'Click to read full article...'}
                                    </p>

                                    <Link
                                        href={`/blog/${heroArticle.slug}`}
                                        className="inline-flex items-center text-blue-600 font-bold hover:text-blue-700 transition-colors group/link w-fit"
                                    >
                                        Read Full Story <ArrowRight className="w-4 h-4 ml-2 group-hover/link:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Recent Articles Grid */}
                        {otherArticles.length > 0 && (
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                                    More Articles
                                    <span className="ml-4 h-px bg-slate-200 flex-1" />
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {otherArticles.map((article) => (
                                        <article
                                            key={article.id}
                                            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col h-full hover:-translate-y-1"
                                        >
                                            <Link href={`/blog/${article.slug}`} className="block relative h-56 overflow-hidden">
                                                {article.banner_imagekit_upload_url ? (
                                                    <img
                                                        src={article.banner_imagekit_upload_url}
                                                        alt={article.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                                        <Tag className="w-12 h-12" />
                                                    </div>
                                                )}
                                                {article.category && (
                                                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                                        {article.category.name}
                                                    </span>
                                                )}
                                            </Link>

                                            <div className="p-6 flex flex-col flex-1">
                                                <div className="flex items-center text-xs text-slate-500 mb-4 gap-4">
                                                    <span className="flex items-center">
                                                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                                        {new Date(article.created_at).toLocaleDateString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>

                                                <h4 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                    <Link href={`/blog/${article.slug}`}>
                                                        {article.name}
                                                    </Link>
                                                </h4>

                                                <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                                                    {article.desc_seo || article.seo_title}
                                                </p>

                                                <div className="mt-auto border-t border-slate-100 pt-4 flex items-center justify-between">
                                                    <Link
                                                        href={`/blog/${article.slug}`}
                                                        className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 flex items-center"
                                                    >
                                                        Read More
                                                    </Link>
                                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                        <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Tag className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No articles found</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            We haven't published any articles yet. Check back soon for updates and news.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
