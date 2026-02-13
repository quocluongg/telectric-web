import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NewsTable from "@/pages/Admin/News/List/news-table";

export default async function AdminNewsPage({
    searchParams,
}: {
    searchParams?: { page?: string; search?: string };
}) {
    const supabase = await createClient();

    // 1. Check admin role
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") redirect("/");

    // 2. Pagination
    const currentPage = Number(searchParams?.page) || 1;
    const ITEMS_PER_PAGE = 10;
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    // 3. Query news
    let query = supabase
        .from("news")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

    if (searchParams?.search) {
        query = query.ilike("title", `%${searchParams.search}%`);
    }

    const { data: articles, count } = await query;

    return (
        <NewsTable
            initialArticles={articles || []}
            totalCount={count || 0}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
        />
    );
}
