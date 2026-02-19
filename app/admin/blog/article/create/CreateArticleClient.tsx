'use client';

import { createArticle } from '../../actions';
import { useFormStatus } from 'react-dom';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import ImageUpload from '@/components/ui/ImageUpload';

const QuillEditor = dynamic(() => import('@/components/ui/QuillEditor'), { ssr: false });

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
            <Save className="w-4 h-4" />
            {pending ? 'Saving...' : 'Save Article'}
        </button>
    );
}

type Category = {
    id: number;
    name: string;
};

export default function CreateArticleClient({ categories }: { categories: Category[] }) {
    const [content, setContent] = useState('');
    const [image, setImage] = useState('');

    async function clientAction(formData: FormData) {
        if (!content) {
            toast.error('Content is required');
            return;
        }

        // Pass content JSON as explicit argument to handle rich text properly
        const contentJson = { html: content };

        const result = await createArticle(contentJson, null, formData);

        if (result && result.error) {
            toast.error(result.error);
        } else {
            toast.success('Article created successfully');
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/blog/article"
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Create Article</h1>
                    <p className="text-slate-500 text-sm">Rich text editor powered by QuillJS.</p>
                </div>
            </div>

            <form action={clientAction} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Title *</label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="e.g. How to get more followers"
                                onChange={(e) => {
                                    const slug = e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                                    const slugInput = document.querySelector('input[name="slug"]') as HTMLInputElement;
                                    if (slugInput) slugInput.value = slug;
                                }}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Slug *</label>
                            <input
                                type="text"
                                name="slug"
                                required
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="e.g. how-to-get-more-followers"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Category *</label>
                            <select
                                name="id_article_category"
                                required
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                            >
                                <option value="">Select Category</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Status</label>
                            <select
                                name="status"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="NOT_ACTIVE">Not Active</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">SEO Title</label>
                            <input
                                type="text"
                                name="seo_title"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">SEO Description</label>
                            <textarea
                                name="desc_seo"
                                rows={3}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Keywords</label>
                            <input
                                type="text"
                                name="keyword"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Banner Image</label>
                    <div className="h-40 w-full md:w-1/2">
                        <ImageUpload
                            value={image}
                            onChange={(url) => setImage(url)}
                            folder="blog-banners"
                            label="Upload Banner"
                            previewClassName="h-40 w-full object-cover rounded-lg"
                        />
                        <input type="hidden" name="banner_imagekit_upload_url" value={image} />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Content *</label>
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 min-h-[300px]">
                        <QuillEditor value={content} onChange={setContent} />
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <SubmitButton />
                </div>
            </form>
        </div>
    );
}
