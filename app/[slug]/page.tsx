import ProductDetailPage from "@/views/Admin/Products/Detail";
import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    const { data: product } = await supabase
        .from("products")
        .select("name, description, thumbnail")
        .eq("slug", slug)
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
    const { slug } = await params;

    // Verify that the slug matches a real product, otherwise 404
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
    const { data: product } = await supabase
        .from("products")
        .select("slug")
        .eq("slug", slug)
        .single();

    if (!product) notFound();

    return <ProductDetailPage productSlug={slug} />;
}
