import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import DefaultLayout from "@/components/layout/DefaultLayout";
import NewsListPage from "@/views/News";

export const metadata: Metadata = {
    title: "Bài Viết | TELECTRIC - Điểm Tựa Kỹ Thuật",
    description:
        "Chia sẻ kiến thức, kinh nghiệm sử dụng thiết bị đo điện. Cập nhật tin tức mới nhất từ TELECTRIC.",
};

export default async function Page() {
    const supabase = await createClient();

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

    return (
        <DefaultLayout>
            <NewsListPage
                articles={articles || []}
                // Ép kiểu về any ở đây để bypass lỗi "missing properties" của News[]
                recentArticles={(recentArticles as any) || []}
            />
        </DefaultLayout>
    );
}