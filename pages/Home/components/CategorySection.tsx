"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SubCategory {
    id: string;
    name: string;
    slug: string;
}

interface Brand {
    id: string;
    name: string;
    logo_url: string | null;
    slug: string;
}

interface Product {
    id: string;
    name: string;
    price: number | null;
    original_price: number | null;
    thumbnail: string | null;
    category_id: string;
}

interface CategorySectionProps {
    categoryName: string;
    categorySlug: string;
    accentColor?: string; // tailwind bg color e.g. "bg-red-600"
    icon?: React.ReactNode;
    bannerText?: string;
    bannerSubText?: string;
    bannerPrice?: string;
    bannerBg?: string;
}

function formatPrice(price: number) {
    return price.toLocaleString("vi-VN") + "đ";
}

function getDiscount(price: number | null, original: number | null): number | null {
    if (!price || !original || original <= price) return null;
    return Math.round(((original - price) / original) * 100);
}

export function CategorySection({
    categoryName,
    categorySlug,
    accentColor = "bg-red-600",
    icon,
    bannerText = "BÁN CHẠY",
    bannerSubText = "Xem ngay ưu đãi tốt nhất",
    bannerPrice,
    bannerBg = "from-orange-500 to-red-600",
}: CategorySectionProps) {
    const supabase = useMemo(() => createClient(), []);

    const [parentCategory, setParentCategory] = useState<{ id: string } | null>(null);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [activeSubSlug, setActiveSubSlug] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // 1. Fetch parent category
    useEffect(() => {
        supabase
            .from("categories")
            .select("id")
            .eq("slug", categorySlug)
            .single()
            .then(({ data }) => {
                if (data) setParentCategory(data);
            });
    }, [categorySlug, supabase]);

    // 2. Fetch sub-categories and brands once parent is known
    useEffect(() => {
        if (!parentCategory) return;

        // Sub-categories
        supabase
            .from("categories")
            .select("id, name, slug")
            .eq("parent_id", parentCategory.id)
            .order("name")
            .then(({ data }) => {
                if (data && data.length > 0) {
                    setSubCategories(data);
                    setActiveSubSlug(data[0].slug);
                }
            });

        // Brands that have products in this category (via join)
        supabase
            .from("brands")
            .select("id, name, logo_url, slug")
            .order("name")
            .limit(6)
            .then(({ data }) => {
                if (data) setBrands(data);
            });
    }, [parentCategory, supabase]);

    // 3. Fetch products when active sub-category changes
    useEffect(() => {
        if (!parentCategory && !activeSubSlug) return;
        setLoading(true);

        const fetchProducts = async () => {
            let categoryId: string | null = null;

            if (activeSubSlug) {
                const { data: subCat } = await supabase
                    .from("categories")
                    .select("id")
                    .eq("slug", activeSubSlug)
                    .single();
                categoryId = subCat?.id ?? null;
            } else if (parentCategory) {
                categoryId = parentCategory.id;
            }

            if (!categoryId) { setLoading(false); return; }

            const { data } = await supabase
                .from("products")
                .select("id, name, price, original_price, thumbnail, category_id")
                .eq("category_id", categoryId)
                .order("created_at", { ascending: false })
                .limit(8);

            setProducts(data || []);
            setLoading(false);
        };

        fetchProducts();
    }, [activeSubSlug, parentCategory, supabase]);

    // Don't render if no products and not loading
    if (!loading && products.length === 0 && subCategories.length === 0) return null;

    return (
        <section className="bg-white dark:bg-[#141820] border-t border-slate-200 dark:border-white/5">
            <div className="container mx-auto max-w-7xl px-4 py-6">

                {/* ─── Header Bar ─── */}
                <div className={`flex items-center gap-0 mb-4 rounded-t-sm overflow-hidden`}>
                    {/* Category name pill */}
                    <div className={`${accentColor} flex items-center gap-2 px-4 py-2.5 flex-shrink-0`}>
                        <span className="text-white">{icon ?? <Zap className="w-4 h-4" />}</span>
                        <span className="text-white font-bold text-sm uppercase tracking-wide whitespace-nowrap">
                            {categoryName}
                        </span>
                    </div>

                    {/* Sub-category tabs */}
                    <div className="flex items-center flex-1 overflow-x-auto scrollbar-none border-b-2 border-slate-200 dark:border-slate-700 -mb-px px-2">
                        {subCategories.map((sub) => (
                            <button
                                key={sub.id}
                                onClick={() => setActiveSubSlug(sub.slug)}
                                className={`whitespace-nowrap px-3 py-2 text-sm font-semibold transition-colors border-b-2 -mb-px ${activeSubSlug === sub.slug
                                        ? "text-red-600 border-red-600"
                                        : "text-slate-600 dark:text-slate-400 border-transparent hover:text-red-500"
                                    }`}
                            >
                                {sub.name}
                            </button>
                        ))}
                        <Link
                            href={`/products?category=${categorySlug}`}
                            className="ml-auto whitespace-nowrap text-sm font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 px-3 py-2 transition-colors flex-shrink-0"
                        >
                            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* ─── Body ─── */}
                <div className="flex gap-3">

                    {/* Left: Brand list + Banner */}
                    <div className="w-[150px] flex-shrink-0 hidden lg:flex flex-col gap-3">
                        {/* Brand logos */}
                        <div className="border border-slate-200 dark:border-slate-700 rounded overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/50">
                            {brands.map((brand) => (
                                <Link
                                    key={brand.id}
                                    href={`/products?brand=${brand.slug}`}
                                    className="flex items-center justify-center px-3 py-3 bg-white dark:bg-[#1e2330] hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                                >
                                    {brand.logo_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={brand.logo_url}
                                            alt={brand.name}
                                            className="max-h-8 max-w-[110px] object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                                        />
                                    ) : (
                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                            {brand.name}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>

                        {/* Promo Banner */}
                        <Link
                            href={`/products?category=${categorySlug}`}
                            className={`flex-1 min-h-[140px] rounded bg-gradient-to-br ${bannerBg} p-4 flex flex-col justify-end text-white relative overflow-hidden group`}
                        >
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                            <div className="relative z-10">
                                <p className="font-black text-lg leading-tight">{bannerText}</p>
                                <p className="text-white/80 text-xs mt-1 leading-snug">{bannerSubText}</p>
                                {bannerPrice && (
                                    <p className="text-yellow-300 font-black text-base mt-2">{bannerPrice}</p>
                                )}
                                <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded px-2 py-1 transition-colors">
                                    Mua ngay <ArrowRight className="w-3 h-3" />
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Right: Product Grid */}
                    <div className="flex-1 min-w-0">
                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded animate-pulse aspect-[3/4]" />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                                Không có sản phẩm nào trong danh mục này.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                                {products.map((product) => {
                                    const discount = getDiscount(product.price, product.original_price);
                                    return (
                                        <Link
                                            key={product.id}
                                            href={`/products/${product.id}`}
                                            className="group bg-white dark:bg-[#1e2330] border border-slate-200 dark:border-slate-700 rounded hover:border-red-400 dark:hover:border-red-500 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
                                        >
                                            {/* Image */}
                                            <div className="relative aspect-square bg-slate-50 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                                {product.thumbnail ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={product.thumbnail}
                                                        alt={product.name}
                                                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Zap className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                                                    </div>
                                                )}
                                                {/* Discount Badge */}
                                                {discount && (
                                                    <span className="absolute top-2 right-2 bg-yellow-400 text-slate-900 text-xs font-black rounded-full w-9 h-9 flex items-center justify-center shadow-sm">
                                                        -{discount}%
                                                    </span>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="p-3 flex-1 flex flex-col">
                                                <p className="text-slate-700 dark:text-slate-200 text-xs font-medium line-clamp-2 mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-snug">
                                                    {product.name}
                                                </p>
                                                <div className="mt-auto">
                                                    {product.price ? (
                                                        <>
                                                            <p className="text-red-600 dark:text-red-400 font-black text-sm">
                                                                {formatPrice(product.price)}
                                                            </p>
                                                            {product.original_price && product.original_price > product.price && (
                                                                <p className="text-slate-400 text-xs line-through">
                                                                    {formatPrice(product.original_price)}
                                                                </p>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <p className="text-red-600 dark:text-red-400 font-bold text-sm">Liên hệ</p>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
