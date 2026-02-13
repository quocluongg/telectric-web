import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import DefaultLayout from "@/components/layout/DefaultLayout";
import NewsListPage from "@/pages/News";

export const metadata: Metadata = {
    title: "Bài Viết | TELECTRIC - Điểm Tựa Kỹ Thuật",
    description:
        "Chia sẻ kiến thức, kinh nghiệm sử dụng thiết bị đo điện. Cập nhật tin tức mới nhất từ TELECTRIC.",
};

export default async function Page() {
    const supabase = await createClient();

    // Fetch published articles
    const { data: articles } = await supabase
        .from("news")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

    // Fetch recent articles for sidebar (top 5)
    const { data: recentArticles } = await supabase
        .from("news")
        .select("id, title, slug, thumbnail, published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(5);

    return (
        <DefaultLayout>
            <NewsListPage
                articles={articles || []}
                recentArticles={recentArticles || []}
            />
        </DefaultLayout>
    );
}
