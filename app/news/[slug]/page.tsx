import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import DefaultLayout from "@/components/layout/DefaultLayout";
import NewsDetailPage from "@/pages/News/NewsDetail";

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

    // Fetch the article
    const { data: article } = await supabase
        .from("news")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

    if (!article) notFound();

    // Fetch related articles (latest 5, excluding current)
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
                relatedArticles={relatedArticles || []}
            />
        </DefaultLayout>
    );
}
