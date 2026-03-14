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

// Giúp next-sitemap tạo URL cho từng bài viết trong sitemap.xml
export async function generateStaticParams() {
    const supabase = await createClient();
    const { data: articles } = await supabase
        .from("news")
        .select("slug")
        .eq("is_published", true);

    return (articles || []).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: article } = await supabase
        .from("news")
        .select("title, excerpt, thumbnail")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

    if (!article) {
        return { title: "Bài viết không tồn tại | TELECTRIC" };
    }

    const title = `${article.title} | TELECTRIC`;
    const description = article.excerpt || "Cập nhật tin tức mới nhất từ TELECTRIC.";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://telectric.vn";

    return {
        title,
        description,
        alternates: {
            canonical: `${siteUrl}/news/${slug}`,
        },
        openGraph: {
            title,
            description,
            type: "article",
            images: article.thumbnail ? [article.thumbnail] : [],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: article.thumbnail ? [article.thumbnail] : [],
        },
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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://telectric.vn";

    // Structured Data (JSON-LD) cho Google Rich Snippets
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.excerpt || undefined,
        image: article.thumbnail || undefined,
        url: `${siteUrl}/news/${slug}`,
        datePublished: article.published_at || undefined,
        publisher: {
            "@type": "Organization",
            name: "TELECTRIC",
            url: siteUrl,
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <DefaultLayout>
                <NewsDetailPage
                    article={article}
                    // 2. Ép kiểu ở đây để qua mặt TypeScript lúc build trên Vercel
                    relatedArticles={(relatedArticles as unknown as RelatedNews[]) || []}
                />
            </DefaultLayout>
        </>
    );
}