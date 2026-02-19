import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Tag, ArrowLeft, Share2 } from 'lucide-react';
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
    if (typeof content === 'string') {
        return <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-blue-600 prose-img:rounded-xl" dangerouslySetInnerHTML={{ __html: content }} />;
    }

    // Check if content is created via the new JSON structure { html: "..." }
    if (content && typeof content === 'object' && 'html' in content) {
        return <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-blue-600 prose-img:rounded-xl" dangerouslySetInnerHTML={{ __html: (content as any).html }} />;
    }

    return <div className="text-slate-500 italic">Content format error.</div>;
}

export default async function BlogPostPage(props: Props) {
    const params = await props.params;
    const article = await getArticle(params.slug);

    if (!article) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Banner */}
            <div className="h-[400px] w-full bg-slate-900 relative">
                {article.banner_imagekit_upload_url && (
                    <div className="absolute inset-0">
                        <img
                            src={article.banner_imagekit_upload_url}
                            alt={article.name}
                            className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    </div>
                )}

                <div className="absolute inset-0 flex flex-col justify-end pb-12 px-6 sm:px-12 max-w-4xl mx-auto z-10">
                    <Link
                        href="/blog"
                        className="inline-flex items-center text-white/80 hover:text-white mb-6 text-sm font-medium transition-colors w-fit"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
                    </Link>

                    <div className="flex items-center gap-4 text-white/80 text-sm mb-4">
                        {article.category && (
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                {article.category.name}
                            </span>
                        )}
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {new Date(article.created_at).toLocaleDateString(undefined, {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                        {article.name}
                    </h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-20">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-12">
                    <BlogPostContent content={article.content} />

                    {/* Tags/Share Section */}
                    <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            {article.keyword && article.keyword.split(',').map((tag, i) => (
                                <span key={i} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                                    #{tag.trim()}
                                </span>
                            ))}
                        </div>

                        <button className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium">
                            <Share2 className="w-4 h-4" /> Share Article
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
