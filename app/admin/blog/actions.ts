'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ArticleStatus } from '@prisma/client'

// --- Category Actions ---

export async function getCategories() {
    return await prisma.articleCategory.findMany({
        orderBy: { created_at: 'desc' }
    })
}

export async function getCategory(id: number) {
    return await prisma.articleCategory.findUnique({
        where: { id }
    })
}

export async function createCategory(prevState: any, formData: FormData) {
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const seo_title = formData.get('seo_title') as string
    const desc_seo = formData.get('desc_seo') as string
    const keyword = formData.get('keyword') as string
    const status = formData.get('status') as ArticleStatus

    if (!name || !slug) {
        return { error: 'Name and Slug are required' }
    }

    try {
        await prisma.articleCategory.create({
            data: { name, slug, seo_title, desc_seo, keyword, status }
        })
    } catch (error) {
        console.error('Failed to create category:', error)
        return { error: 'Failed to create category. Slug might be taken.' }
    }

    revalidatePath('/admin/blog/category')
    redirect('/admin/blog/category')
}

export async function updateCategory(id: number, prevState: any, formData: FormData) {
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const seo_title = formData.get('seo_title') as string
    const desc_seo = formData.get('desc_seo') as string
    const keyword = formData.get('keyword') as string
    const status = formData.get('status') as ArticleStatus

    try {
        await prisma.articleCategory.update({
            where: { id },
            data: { name, slug, seo_title, desc_seo, keyword, status }
        })
    } catch (error) {
        return { error: 'Failed to update category.' }
    }

    revalidatePath('/admin/blog/category')
    redirect('/admin/blog/category')
}

export async function deleteCategory(id: number) {
    try {
        await prisma.articleCategory.delete({ where: { id } })
        revalidatePath('/admin/blog/category')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to delete category' }
    }
}


// --- Article Actions ---

export async function getArticles() {
    return await prisma.articlePost.findMany({
        orderBy: { created_at: 'desc' },
        include: { category: true }
    })
}

export async function getArticle(id: number) {
    return await prisma.articlePost.findUnique({
        where: { id },
        include: { category: true }
    })
}

export async function createArticle(contentJson: any, prevState: any, formData: FormData) {
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const id_article_category = parseInt(formData.get('id_article_category') as string)
    const banner_imagekit_upload_url = formData.get('banner_imagekit_upload_url') as string
    const seo_title = formData.get('seo_title') as string
    const desc_seo = formData.get('desc_seo') as string
    const keyword = formData.get('keyword') as string
    const status = formData.get('status') as ArticleStatus

    if (!name || !slug || !id_article_category) {
        return { error: 'Name, Slug, and Category are required' }
    }

    try {
        await prisma.articlePost.create({
            data: {
                name,
                slug,
                id_article_category,
                banner_imagekit_upload_url,
                content: contentJson, // Use passed JSON content from client
                seo_title,
                desc_seo,
                keyword,
                status
            }
        })
    } catch (error) {
        console.error('Error creating article:', error);
        return { error: 'Failed to create article.' }
    }

    revalidatePath('/admin/blog/article')
    redirect('/admin/blog/article')
}

export async function updateArticle(id: number, contentJson: any, prevState: any, formData: FormData) {
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const id_article_category = parseInt(formData.get('id_article_category') as string)
    const banner_imagekit_upload_url = formData.get('banner_imagekit_upload_url') as string
    const seo_title = formData.get('seo_title') as string
    const desc_seo = formData.get('desc_seo') as string
    const keyword = formData.get('keyword') as string
    const status = formData.get('status') as ArticleStatus

    try {
        await prisma.articlePost.update({
            where: { id },
            data: {
                name,
                slug,
                id_article_category,
                banner_imagekit_upload_url,
                content: contentJson,
                seo_title,
                desc_seo,
                keyword,
                status
            }
        })
    } catch (error) {
        return { error: 'Failed to update article.' }
    }

    revalidatePath('/admin/blog/article')
    redirect('/admin/blog/article')
}

export async function deleteArticle(id: number) {
    try {
        await prisma.articlePost.delete({ where: { id } })
        revalidatePath('/admin/blog/article')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to delete article' }
    }
}
