import ProductDetailPage from "@/views/Admin/Products/Detail";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();

    const { data: product } = await supabase
        .from("products")
        .select("name, description, thumbnail")
        .eq("id", id)
        .single();

    if (!product) {
        return { title: "Sản phẩm không tồn tại | TELECTRIC" };
    }

    const title = `${product.name} | TELECTRIC`;
    const description = product.description || "Mua sản phẩm chính hãng tại TELECTRIC với giá ưu đãi.";

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "website",
            images: product.thumbnail ? [product.thumbnail] : [],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: product.thumbnail ? [product.thumbnail] : [],
        },
    };
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;
    return <ProductDetailPage productId={id} />;
}
