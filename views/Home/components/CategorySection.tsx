"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Zap, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* ─── Types ─── */
interface SubCategory { id: string; name: string; slug: string; }
interface Product {
    id: string; name: string;
    price: number | null; original_price: number | null;
    thumbnail: string | null; brand: string | null;
}
interface BrandInfo { name: string; logoUrl?: string | null; }

interface CategorySectionProps {
    categoryName: string;
    categorySlug: string;
    accentColor?: string;     // Tailwind bg class e.g. "bg-electric-orange"
    accentBorderColor?: string; // Tailwind border class e.g. "border-electric-orange"
    icon?: React.ReactNode;
}

/* ─── Helpers ─── */
function fmt(n: number) { return n.toLocaleString("vi-VN") + "đ"; }
function pct(price: number | null, orig: number | null) {
    if (!price || !orig || orig <= price) return null;
    return Math.round(((orig - price) / orig) * 100);
}

function ProductCard({ p }: { p: Product }) {
    const disc = pct(p.price, p.original_price);

    return (
        <div className="group relative flex flex-col bg-white dark:bg-[#1e2330] border border-slate-200 dark:border-slate-700/50 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg dark:shadow-none dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all duration-300 overflow-hidden">

            <Link href={`/products/${p.id}`} className="absolute inset-0 z-10">
                <span className="sr-only">View {p.name}</span>
            </Link>

            {/* Discount Badge */}
            {disc && (
                <div className="absolute top-2 right-2 z-20 px-2 py-1 bg-red-500 text-white font-bold rounded flex items-center justify-center shadow-sm">
                    <span className="text-[11px] leading-none">-{disc}%</span>
                </div>
            )}

            {/* Fixed-height Image Area */}
            <div className="relative w-full h-[180px] flex-shrink-0 overflow-hidden bg-[#f8f9fa] dark:bg-[#151924]">
                {p.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={p.thumbnail}
                        alt={p.name}
                        className="absolute inset-0 w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal p-3 group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap className="w-12 h-12 text-slate-200 dark:text-slate-700" />
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="p-3 flex flex-col gap-1 flex-1 bg-white dark:bg-[#1e2330]">
                {/* Brand Tag */}
                {p.brand && (
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                        {p.brand}
                    </span>
                )}

                {/* Title */}
                <h3 className="text-[13px] text-slate-800 dark:text-slate-200 font-bold leading-snug line-clamp-2 h-[36px] group-hover:text-electric-orange dark:group-hover:text-electric-orange transition-colors mt-0.5">
                    {p.name}
                </h3>

                {/* Price */}
                <div className="mt-auto pt-2 flex items-center gap-2 flex-wrap border-t border-slate-100 dark:border-slate-800">
                    {p.price ? (
                        <>
                            <span className="font-bold text-[15px] text-red-600 dark:text-red-500 leading-none">
                                {fmt(p.price)}
                            </span>
                            {p.original_price && p.original_price > p.price && (
                                <span className="text-[12px] text-slate-400 dark:text-slate-500 line-through leading-none">
                                    {fmt(p.original_price)}
                                </span>
                            )}
                        </>
                    ) : (
                        <span className="font-bold text-[15px] text-red-600 dark:text-red-500">Liên hệ</span>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─── Main Component ─── */
export function CategorySection({
    categoryName,
    categorySlug,
    accentColor = "bg-red-600",
    accentBorderColor = "border-red-600",
    icon,
}: CategorySectionProps) {
    const supabase = useMemo(() => createClient(), []);

    const [parentCatId, setParentCatId] = useState<string | null>(null);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [brands, setBrands] = useState<BrandInfo[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [activeBrand, setActiveBrand] = useState<string | null>(null);
    const [activeSubSlug, setActiveSubSlug] = useState<string | null>(null);
    const [loadingProds, setLoadingProds] = useState(true);

    /* 1 – parent */
    useEffect(() => {
        supabase.from("categories").select("id").eq("slug", categorySlug).maybeSingle()
            .then(({ data }) => { if (data) setParentCatId(data.id); });
    }, [categorySlug, supabase]);

    /* 2 – sub-cats + brands */
    useEffect(() => {
        if (!parentCatId) return;
        supabase.from("categories").select("id, name, slug").eq("parent_id", parentCatId).order("name")
            .then(({ data }) => {
                if (data && data.length > 0) { setSubCategories(data); setActiveSubSlug(null); }
            });

        supabase.from("categories").select("id").eq("parent_id", parentCatId)
            .then(async ({ data: ch }) => {
                const catIds = [parentCatId, ...(ch || []).map((c: any) => c.id)];
                const { data: prods } = await supabase.from("products").select("brand")
                    .in("category_id", catIds).not("brand", "is", null);
                const unique = [...new Set((prods || []).map((p: any) => p.brand).filter(Boolean))].sort() as string[];
                setBrands(unique.map(name => ({ name, logoUrl: null })));
            });
    }, [parentCatId, supabase]);

    /* 3 – products */
    useEffect(() => {
        if (!parentCatId) return;
        setLoadingProds(true);
        const go = async () => {
            let catIds: string[] = [parentCatId];
            if (activeSubSlug) {
                const { data } = await supabase.from("categories").select("id").eq("slug", activeSubSlug).maybeSingle();
                if (data) catIds = [data.id];
            } else if (subCategories.length > 0) {
                catIds = subCategories.map(s => s.id);
            }

            let query = supabase.from("products")
                .select("id, name, thumbnail, brand, category_id, discount_percent")
                .in("category_id", catIds)
                .order("created_at", { ascending: false })
                .limit(8);

            if (activeBrand) query = query.eq("brand", activeBrand);

            const { data: prods } = await query;
            if (!prods || prods.length === 0) { setProducts([]); setLoadingProds(false); return; }

            const ids = prods.map((p: any) => p.id);
            const { data: variants } = await supabase.from("product_variants")
                .select("product_id, price").in("product_id", ids);

            const priceMap: Record<string, number> = {};
            (variants || []).forEach((v: any) => {
                if (!priceMap[v.product_id] || v.price < priceMap[v.product_id]) priceMap[v.product_id] = v.price;
            });

            setProducts(prods.map((p: any) => {
                const minPrice = priceMap[p.id] ?? null;
                const dp = p.discount_percent || 0;
                let price = minPrice;
                let original_price = null;
                if (dp > 0 && minPrice) {
                    original_price = minPrice;
                    price = minPrice * (1 - dp / 100);
                }
                return {
                    id: p.id, name: p.name, thumbnail: p.thumbnail, brand: p.brand,
                    price, original_price,
                }
            }));
            setLoadingProds(false);
        };
        go();
    }, [activeSubSlug, activeBrand, parentCatId, subCategories, supabase]);

    if (!loadingProds && products.length === 0 && brands.length === 0) return null;

    const textColorClass = accentColor.replace('bg-', 'text-');

    return (
        <section className="py-6">
            <div className="container mx-auto max-w-[1300px] px-4">

                <div className="flex flex-col bg-[#f8f9fa] dark:bg-[#151924] p-2 rounded-xl border border-slate-200/50 dark:border-white/5">
                    {/* ── Category Header ── */}
                    <div className="flex flex-col md:flex-row items-stretch bg-white dark:bg-[#1e2330] rounded-t-xl overflow-hidden mb-2 shadow-sm border border-slate-100 dark:border-white/5">

                        {/* Left Colored Name Block */}
                        <div className={`${accentColor} w-full md:w-auto md:min-w-[280px] flex-shrink-0 flex items-center px-4 py-3 md:py-3 rounded-tl-xl md:rounded-tr-none md:rounded-bl-none`}>
                            <span className="text-white mr-2 opacity-90">{icon ?? <Zap className="w-5 h-5" />}</span>
                            <h2 className="text-white font-bold text-[16px] uppercase tracking-wide leading-none">
                                {categoryName}
                            </h2>
                        </div>

                        {/* Right Navigation Bar */}
                        <div className="flex-1 flex flex-col md:flex-row items-start md:items-center justify-between px-4 bg-white dark:bg-[#1e2330] relative">

                            <div className="flex items-center gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full md:w-auto h-[46px]">
                                <button
                                    onClick={() => { setActiveSubSlug(null); setActiveBrand(null); }}
                                    className={`text-[13px] font-bold whitespace-nowrap transition-colors h-full flex items-center border-b-[2px] ${activeSubSlug === null
                                        ? "text-slate-800 dark:text-white border-slate-800 dark:border-white"
                                        : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-white"
                                        }`}
                                >
                                    Tất cả
                                </button>
                                {subCategories.map(sub => (
                                    <button
                                        key={sub.id}
                                        onClick={() => { setActiveSubSlug(sub.slug); setActiveBrand(null); }}
                                        className={`text-[13px] font-bold whitespace-nowrap transition-colors h-full flex items-center border-b-[2px] ${activeSubSlug === sub.slug
                                            ? "text-slate-800 dark:text-white border-slate-800 dark:border-white"
                                            : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-white"
                                            }`}
                                    >
                                        {sub.name}
                                    </button>
                                ))}
                            </div>

                            <Link
                                href={`/products?category=${categorySlug}`}
                                className={`hidden md:flex flex-shrink-0 items-center text-[13px] font-medium text-electric-orange hover:text-orange-600 dark:hover:text-orange-400 hover:underline whitespace-nowrap ml-4 transition-colors`}
                            >
                                Xem tất cả <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                            </Link>
                        </div>
                    </div>

                    {/* ── Body Layout ── */}
                    <div className="flex flex-col lg:flex-row gap-2">

                        {/* Left Sidebar */}
                        <div className="w-full lg:w-[240px] xl:w-[280px] flex-shrink-0 flex flex-col gap-2">

                            {/* Brand List Filter (Donghodo style) */}
                            {brands.length > 0 && (
                                <div className="bg-white dark:bg-[#1e2330] border text-center border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                                    <div className="flex flex-col">
                                        {brands.map((b) => (
                                            <button
                                                key={b.name}
                                                onClick={() => setActiveBrand(prev => prev === b.name ? null : b.name)}
                                                className={`flex items-center justify-center p-4 transition-all group hover:bg-slate-50 dark:hover:bg-[#2a3040] border-b border-slate-100 dark:border-slate-800 last:border-b-0 ${activeBrand === b.name ? 'bg-slate-50 dark:bg-[#2a3040] opacity-100' : 'opacity-80'}`}
                                            >
                                                {b.logoUrl ? (
                                                    <img src={b.logoUrl} alt={b.name} className="h-6 object-contain mix-blend-multiply dark:mix-blend-normal" />
                                                ) : (
                                                    <span className={`font-black text-[18px] italic uppercase ${activeBrand === b.name ? 'text-electric-orange' : 'text-indigo-900 dark:text-indigo-300'}`}>{b.name}</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Classic Vertical Banner */}
                            <div className="hidden xl:flex flex-1 min-h-[200px] p-5 flex-col items-center relative overflow-hidden text-center rounded-xl group cursor-pointer shadow-sm border border-slate-200/50 dark:border-white/5">
                                {/* Colorful Gradient Background */}
                                <div className="absolute inset-0 bg-[#0f1118] dark:bg-black z-0" />
                                <div className={`absolute top-0 right-0 w-3/4 h-3/4 ${accentColor} opacity-20 blur-[80px] z-0 rounded-full`} />
                                <div className="absolute bottom-0 left-0 w-3/4 h-3/4 bg-blue-600 opacity-20 blur-[80px] z-0 rounded-full" />

                                <div className="relative z-20 w-full h-full flex flex-col justify-center items-center gap-3">
                                    <h4 className="text-white font-black text-[20px] uppercase leading-tight drop-shadow-md">{categoryName}<br /><span className="text-[#ffc107]">ƯU ĐÃI</span></h4>
                                    <Link href={`/products?category=${categorySlug}`} className={`inline-flex items-center justify-center px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[13px] font-bold rounded-full border border-white/20 transition-all`}>
                                        Mua ngay <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                    </Link>
                                </div>
                            </div>

                        </div>

                        {/* Product Grid */}
                        <div className="flex-1 min-w-0 bg-white dark:bg-[#1e2330] rounded-xl p-3 shadow-sm border border-slate-100 dark:border-white/5">
                            {loadingProds ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="bg-white dark:bg-[#1e2330] border border-slate-100 dark:border-slate-800 rounded-xl animate-pulse h-[300px] p-2">
                                            <div className="w-full aspect-square bg-slate-50 dark:bg-slate-800 rounded-lg mb-2" />
                                            <div className="px-2 pb-2 space-y-2">
                                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mt-3" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : products.length === 0 ? (
                                <div className="flex items-center justify-center h-full min-h-[300px] rounded-xl text-slate-400 dark:text-slate-500 text-[14px]">
                                    Không tìm thấy sản phẩm nào.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {products.map(p => <ProductCard key={p.id} p={p} />)}
                                </div>
                            )}
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
}
