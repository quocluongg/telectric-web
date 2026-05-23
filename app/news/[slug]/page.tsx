import { Metadata } from "next";
import { createClient, createStaticClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import DefaultLayout from "@/components/layout/DefaultLayout";
import NewsDetailPage from "@/views/News/NewsDetail";
import Link from "next/link";

const SITE_URL = "https://www.telectric.vn";

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
    const supabase = await createStaticClient();
    const { data: articles } = await supabase
        .from("news")
        .select("slug")
        .eq("is_published", true);

    return (articles || []).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createStaticClient();

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
    const siteUrl = SITE_URL;

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
    const supabase = await createStaticClient();

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

    const siteUrl = SITE_URL;

    // Structured Data (JSON-LD) cho Google Rich Snippets
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.excerpt || undefined,
        image: article.thumbnail || undefined,
        url: `${siteUrl}/news/${slug}`,
        datePublished: article.published_at || undefined,
        dateModified: article.updated_at || article.published_at || undefined,
        author: {
            "@type": "Organization",
            name: "TELECTRIC",
            url: siteUrl,
        },
        publisher: {
            "@type": "Organization",
            name: "TELECTRIC",
            url: siteUrl,
            logo: {
                "@type": "ImageObject",
                url: `${siteUrl}/img/icon.png`,
            },
        },
    };

    // BreadcrumbList JSON-LD
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "Bài viết", item: `${siteUrl}/news` },
            { "@type": "ListItem", position: 3, name: article.title, item: `${siteUrl}/news/${slug}` },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            {/* SEO: Server-rendered article content */}
            <div className="sr-only" role="article" aria-label={article.title}>
                <nav aria-label="Breadcrumb">
                    <ol>
                        <li><Link href="/">Trang chủ</Link></li>
                        <li><Link href="/news">Bài viết</Link></li>
                        <li>{article.title}</li>
                    </ol>
                </nav>
                <h1>{article.title}</h1>
                {article.excerpt && <p>{article.excerpt}</p>}
                {article.published_at && <time dateTime={article.published_at}>Ngày đăng: {new Date(article.published_at).toLocaleDateString("vi-VN")}</time>}
            </div>
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