import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import DefaultLayout from "@/components/layout/DefaultLayout";
import NewsDetailPage from "@/views/News/NewsDetail";

// 1. Khai báo Interface News rút gọn cho relatedArticles để không bị lỗi Type
interface RelatedNews {
    id: any;
    title: any;
    slug: any;
    thumbnail: any;
    published_at: any;
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: article } = await supabase
        .from("news")
        .select("title, excerpt")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

    if (!article) {
        return { title: "Bài viết không tồn tại | TELECTRIC" };
    }

    return {
        title: `${article.title} | TELECTRIC`,
        description: article.excerpt || undefined,
    };
}

export default async function Page({ params }: PageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    // Fetch the article - lấy full data
    const { data: article } = await supabase
        .from("news")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

    if (!article) notFound();

    // Fetch related articles
    const { data: relatedArticles } = await supabase
        .from("news")
        .select("id, title, slug, thumbnail, published_at")
        .eq("is_published", true)
        .neq("id", article.id)
        .order("published_at", { ascending: false })
        .limit(5);

    return (
        <DefaultLayout>
            <NewsDetailPage
                article={article}
                // 2. Ép kiểu ở đây để qua mặt TypeScript lúc build trên Vercel
                relatedArticles={(relatedArticles as unknown as RelatedNews[]) || []}
            />
        </DefaultLayout>
    );
}