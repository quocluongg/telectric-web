import { Metadata } from "next";
import { createClient, createStaticClient } from "@/lib/supabase/server";
import DefaultLayout from "@/components/layout/DefaultLayout";
import NewsListPage from "@/views/News";
import Link from "next/link";

const SITE_URL = "https://www.telectric.vn";

export const metadata: Metadata = {
    title: "Bài Viết | TELECTRIC - Điểm Tựa Kỹ Thuật",
    description:
        "Chia sẻ kiến thức, kinh nghiệm sử dụng thiết bị đo điện. Cập nhật tin tức mới nhất từ TELECTRIC.",
    alternates: {
        canonical: `${SITE_URL}/news`,
    },
    openGraph: {
        title: "Bài Viết | TELECTRIC - Điểm Tựa Kỹ Thuật",
        description:
            "Chia sẻ kiến thức, kinh nghiệm sử dụng thiết bị đo điện. Cập nhật tin tức mới nhất từ TELECTRIC.",
        type: "website",
        url: `${SITE_URL}/news`,
    },
    twitter: {
        card: "summary_large_image",
        title: "Bài Viết | TELECTRIC - Điểm Tựa Kỹ Thuật",
        description:
            "Chia sẻ kiến thức, kinh nghiệm sử dụng thiết bị đo điện. Cập nhật tin tức mới nhất từ TELECTRIC.",
    },
};

export default async function Page() {
    const supabase = await createStaticClient();

    // Fetch published articles (Lấy full trường nên không lo lỗi)
    const { data: articles } = await supabase
        .from("news")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

    // Fetch recent articles for sidebar (Chỉ lấy vài trường nên bị thiếu Type)
    const { data: recentArticles } = await supabase
        .from("news")
        .select("id, title, slug, thumbnail, published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(5);

    // SEO: Server-rendered article listing
    const articlesSEO = articles || [];

    return (
        <>
            {/* SEO: Server-rendered article list for Google */}
            <div className="sr-only" role="region" aria-label="Danh sách bài viết TELECTRIC">
                <h1>Bài Viết - Kiến Thức Đo Lường Điện | TELECTRIC</h1>
                <ul>
                    {articlesSEO.map((a: any) => (
                        <li key={a.id}>
                            <Link href={`/news/${a.slug}`}>
                                <h2>{a.title}</h2>
                                {a.excerpt && <p>{a.excerpt}</p>}
                                {a.published_at && <time dateTime={a.published_at}>{new Date(a.published_at).toLocaleDateString("vi-VN")}</time>}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <DefaultLayout>
                <NewsListPage
                    articles={articles || []}
                    // Ép kiểu về any ở đây để bypass lỗi "missing properties" của News[]
                    recentArticles={(recentArticles as any) || []}
                />
            </DefaultLayout>
        </>
    );
}