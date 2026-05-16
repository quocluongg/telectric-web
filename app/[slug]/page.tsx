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

    // Fetch FULL product data server-side (cho SEO)
    const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

    if (!product) notFound();

    // Fetch variants server-side
    const { data: variants } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", product.id)
        .order("created_at");

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://telectric.vn";
    const safeVariants = variants || [];
    const minPrice = safeVariants.length > 0 ? Math.min(...safeVariants.map(v => v.price)) : 0;
    const maxPrice = safeVariants.length > 0 ? Math.max(...safeVariants.map(v => v.price)) : 0;

    // Structured Data (JSON-LD) cho Google Rich Snippets — bao gồm giá
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description || "Sản phẩm chính hãng tại TELECTRIC",
        image: product.thumbnail || undefined,
        url: `${siteUrl}/${product.slug}`,
        brand: {
            "@type": "Brand",
            name: product.brand || "TELECTRIC",
        },
        ...(safeVariants.length > 0 && {
            offers: {
                "@type": "AggregateOffer",
                priceCurrency: "VND",
                lowPrice: minPrice,
                highPrice: maxPrice,
                offerCount: safeVariants.length,
                availability: safeVariants.some(v => v.stock > 0)
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
            },
        }),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* SEO: Nội dung ẩn cho Google crawler đọc được (server-rendered HTML) */}
            <div className="sr-only" aria-hidden="false">
                <h1>{product.name}</h1>
                <p>Thương hiệu: {product.brand} | Xuất xứ: {product.origin}</p>
                <p>{product.description}</p>
                {safeVariants.map(v => (
                    <div key={v.id}>
                        <span>SKU: {v.sku} - Giá: {v.price.toLocaleString("vi-VN")}₫</span>
                        <span>{Object.entries(v.attributes || {}).map(([k, val]) => `${k}: ${val}`).join(", ")}</span>
                    </div>
                ))}
            </div>
            <ProductDetailPage
                productSlug={slug}
                initialProduct={product}
                initialVariants={safeVariants}
            />
        </>
    );
}

