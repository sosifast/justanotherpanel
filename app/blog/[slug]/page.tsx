import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Tag, ArrowLeft, Share2, Clock, User } from 'lucide-react';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const params = await props.params;
    const article = await prisma.articlePost.findUnique({
        where: { slug: params.slug },
        include: { category: true }
    });

    if (!article) return { title: 'Article Not Found' };

    return {
        title: article.seo_title || article.name,
        description: article.desc_seo || 'Read our latest blog post.',
        keywords: article.keyword?.split(',') || [],
        openGraph: {
            title: article.seo_title || article.name,
            description: article.desc_seo || '',
            images: article.banner_imagekit_upload_url ? [article.banner_imagekit_upload_url] : [],
        }
    };
}

async function getArticle(slug: string) {
    return await prisma.articlePost.findUnique({
        where: { slug: slug, status: 'ACTIVE' },
        include: { category: true }
    });
}

function BlogPostContent({ content }: { content: any }) {
    const proseClass = "prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-3xl prose-img:shadow-lg prose-strong:text-slate-900 prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-li:text-slate-600";

    if (typeof content === 'string') {
        return <div className={proseClass} dangerouslySetInnerHTML={{ __html: content }} />;
    }

    // Check if content is created via the new JSON structure { html: "..." }
    if (content && typeof content === 'object' && 'html' in content) {
        return <div className={proseClass} dangerouslySetInnerHTML={{ __html: (content as any).html }} />;
    }

    return <div className="text-slate-500 italic p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">Content format error.</div>;
}

export default async function BlogPostPage(props: Props) {
    const params = await props.params;
    const article = await getArticle(params.slug);

    if (!article) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Immersive Header */}
            <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden bg-slate-900">
                {article.banner_imagekit_upload_url ? (
                    <>
                        <img
                            src={article.banner_imagekit_upload_url}
                            alt={article.name}
                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
                )}

                <div className="absolute inset-0 flex flex-col justify-end pb-16 px-6 relative z-10">
                    <div className="max-w-4xl mx-auto w-full">
                        <Link
                            href="/blog"
                            className="inline-flex items-center text-white/70 hover:text-white mb-8 text-sm font-semibold transition-colors bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:bg-white/20"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Articles
                        </Link>

                        <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm mb-6 font-medium">
                            {article.category && (
                                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-900/20">
                                    {article.category.name}
                                </span>
                            )}
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-400" />
                                {new Date(article.created_at).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-white/30" />
                            <span className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-400" />
                                5 min read
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6 drop-shadow-sm">
                            {article.name}
                        </h1>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-white/20">
                                JA
                            </div>
                            <div className="text-white/90">
                                <p className="text-sm font-semibold">JustAnotherPanel Team</p>
                                <p className="text-xs opacity-70">Editor</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-6 relative z-20">
                <article className="bg-white">
                    <div className="py-16 md:py-20">
                        {/* SEO / Intro Text */}
                        {(article.desc_seo || article.seo_title) && (
                            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed mb-12 font-medium border-l-4 border-blue-600 pl-6">
                                {article.desc_seo || article.seo_title}
                            </p>
                        )}

                        <BlogPostContent content={article.content} />

                        {/* Tags & Share */}
                        <div className="mt-16 pt-8 border-t border-slate-100">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Tag className="w-4 h-4 text-slate-400 mr-2" />
                                    {article.keyword && article.keyword.split(',').map((tag, i) => (
                                        <span key={i} className="bg-slate-50 hover:bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-default border border-slate-100">
                                            #{tag.trim()}
                                        </span>
                                    ))}
                                </div>

                                <button className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-semibold bg-slate-50 hover:bg-blue-50 px-5 py-2.5 rounded-lg transition-all">
                                    <Share2 className="w-4 h-4" /> Share Article
                                </button>
                            </div>
                        </div>
                    </div>
                </article>
            </div>

            {/* Newsletter / CTA Section could go here */}
        </div>
    );
}
