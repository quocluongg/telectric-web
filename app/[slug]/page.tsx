import ProductDetailPage from "@/views/Admin/Products/Detail";
import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ slug: string }>;
}

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
}

// Giúp next-sitemap tạo URL cho từng sản phẩm trong sitemap.xml
export async function generateStaticParams() {
    const supabase = getSupabase();
    const { data: products } = await supabase
        .from("products")
        .select("slug");

    return (products || []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const supabase = getSupabase();

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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://telectric.vn";

    return {
        title,
        description,
        alternates: {
            canonical: `${siteUrl}/${slug}`,
        },
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
    const supabase = getSupabase();

    // Fetch product data for both 404 check and JSON-LD
    const { data: product } = await supabase
        .from("products")
        .select("name, slug, description, thumbnail")
        .eq("slug", slug)
        .single();

    if (!product) notFound();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://telectric.vn";

    // Structured Data (JSON-LD) cho Google Rich Snippets
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description || "Sản phẩm chính hãng tại TELECTRIC",
        image: product.thumbnail || undefined,
        url: `${siteUrl}/${product.slug}`,
        brand: {
            "@type": "Organization",
            name: "TELECTRIC",
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProductDetailPage productSlug={slug} />
        </>
    );
}
