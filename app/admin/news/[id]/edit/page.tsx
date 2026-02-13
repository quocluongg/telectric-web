import AdminNewsCreate from "@/pages/Admin/News/Create";

// This page reuses the same form component, but loads the existing article data
export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <AdminNewsCreate editId={id} />;
}
