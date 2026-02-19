'use client';

import { updateCategory, deleteCategory } from '../../../actions';
import { useFormStatus } from 'react-dom';
import { Save, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type Category = {
    id: number;
    name: string;
    slug: string;
    seo_title: string | null;
    desc_seo: string | null;
    keyword: string | null;
    status: 'ACTIVE' | 'NOT_ACTIVE';
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
            <Save className="w-4 h-4" />
            {pending ? 'Saving...' : 'Save Changes'}
        </button>
    );
}

export default function EditCategoryClient({ category }: { category: Category }) {
    const router = useRouter();

    async function clientAction(formData: FormData) {
        const result = await updateCategory(category.id, null, formData);
        if (result && result.error) {
            toast.error(result.error);
        } else {
            toast.success('Category updated successfully');
        }
    }

    async function handleDelete() {
        if (confirm('Are you sure you want to delete this category?')) {
            const result = await deleteCategory(category.id);
            if (result.success) {
                toast.success('Category deleted');
                router.push('/admin/blog/category');
            } else {
                toast.error('Failed to delete category');
            }
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/blog/category"
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Edit Category</h1>
                        <p className="text-slate-500 text-sm">Update category details.</p>
                    </div>
                </div>
                <button
                    onClick={handleDelete}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Category"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            <form action={clientAction} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Name *</label>
                        <input
                            type="text"
                            name="name"
                            defaultValue={category.name}
                            required
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="e.g. Social Media Tips"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Slug *</label>
                        <input
                            type="text"
                            name="slug"
                            defaultValue={category.slug}
                            required
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="e.g. social-media-tips"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">SEO Title</label>
                        <input
                            type="text"
                            name="seo_title"
                            defaultValue={category.seo_title || ''}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">SEO Description</label>
                        <textarea
                            name="desc_seo"
                            defaultValue={category.desc_seo || ''}
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Keywords</label>
                        <input
                            type="text"
                            name="keyword"
                            defaultValue={category.keyword || ''}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Status</label>
                        <select
                            name="status"
                            defaultValue={category.status}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="NOT_ACTIVE">Not Active</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <SubmitButton />
                </div>
            </form>
        </div>
    );
}
