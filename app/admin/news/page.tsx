import AdminNewsPage from "@/pages/Admin/News/List";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string }>;
}) {
    const params = await searchParams;
    return <AdminNewsPage searchParams={params} />;
}
