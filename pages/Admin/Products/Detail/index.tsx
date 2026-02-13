"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import DefaultLayout from "@/components/layout/DefaultLayout";
import Link from "next/link";
import {
    Package, ShoppingCart, ArrowLeft, Tag, MapPin, Star, Truck,
    Shield, ChevronLeft, ChevronRight, Minus, Plus, Check, Layers,
    Home, ChevronRight as ChevronSep, Phone, Heart, Share2, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Types matching Supabase schema
interface ProductVariant {
    id: string;
    product_id: string;
    sku: string | null;
    price: number;
    stock: number;
    attributes: Record<string, string>;
    created_at: string;
}

interface Product {
    id: string;
    name: string;
    description: string | null;
    brand: string;
    origin: string;
    thumbnail: string;
    images: string[];
    created_at: string;
    updated_at: string;
}

// --- HELPER: Format VND ---
function formatVND(value: number) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

// --- HELPER: Get unique attribute keys from variants ---
function getAttributeGroups(variants: ProductVariant[]) {
    const groups: Record<string, Set<string>> = {};
    variants.forEach(v => {
        Object.entries(v.attributes).forEach(([key, value]) => {
            if (!groups[key]) groups[key] = new Set();
            groups[key].add(value);
        });
    });
    return Object.fromEntries(
        Object.entries(groups).map(([key, set]) => [key, Array.from(set)])
    );
}

export default function ProductDetailPage({ productId }: { productId: string }) {
    const supabase = createClient();
    const { toast } = useToast();

    const [product, setProduct] = useState<Product | null>(null);
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Fetch data
    useEffect(() => {
        async function fetchProduct() {
            setLoading(true);
            const [productRes, variantRes] = await Promise.all([
                supabase.from("products").select("*").eq("id", productId).single(),
                supabase.from("product_variants").select("*").eq("product_id", productId).order("created_at"),
            ]);

            if (productRes.error) {
                toast({ title: "Không tìm thấy sản phẩm", variant: "destructive" });
                setLoading(false);
                return;
            }

            setProduct(productRes.data);
            setVariants(variantRes.data || []);

            if (variantRes.data && variantRes.data.length > 0) {
                setSelectedAttributes(variantRes.data[0].attributes);
            }
            setLoading(false);
        }

        if (productId) fetchProduct();
    }, [productId]);

    // Computed values
    const allImages = useMemo(() => {
        if (!product) return [];
        return [product.thumbnail, ...(product.images || [])].filter(Boolean);
    }, [product]);

    const attributeGroups = useMemo(() => getAttributeGroups(variants), [variants]);

    const selectedVariant = useMemo(() => {
        if (!variants.length || !Object.keys(selectedAttributes).length) return null;
        return variants.find(v =>
            Object.entries(selectedAttributes).every(([k, val]) => v.attributes[k] === val)
        ) || null;
    }, [variants, selectedAttributes]);

    const priceRange = useMemo(() => {
        if (!variants.length) return null;
        const prices = variants.map(v => v.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return { min, max };
    }, [variants]);

    // Handlers
    const handleSelectAttribute = (key: string, value: string) => {
        setSelectedAttributes(prev => ({ ...prev, [key]: value }));
        setQuantity(1);
    };

    const handlePrevImage = () => {
        setSelectedImage(prev => (prev > 0 ? prev - 1 : allImages.length - 1));
    };

    const handleNextImage = () => {
        setSelectedImage(prev => (prev < allImages.length - 1 ? prev + 1 : 0));
    };

    // --- LOADING STATE ---
    if (loading) {
        return (
            <DefaultLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 rounded-full border-4 border-electric-orange border-t-transparent animate-spin" />
                        <p className="text-sm text-slate-gray font-medium">Đang tải sản phẩm...</p>
                    </div>
                </div>
            </DefaultLayout>
        );
    }

    // --- NOT FOUND ---
    if (!product) {
        return (
            <DefaultLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <Package className="h-16 w-16 text-slate-300" />
                    <h2 className="text-xl font-bold text-industrial-black">Không tìm thấy sản phẩm</h2>
                    <p className="text-slate-gray">Sản phẩm này không tồn tại hoặc đã bị xóa.</p>
                    <Button asChild className="bg-electric-orange hover:bg-orange-600 text-white mt-2">
                        <Link href="/products">← Quay lại danh sách</Link>
                    </Button>
                </div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout>
            {/* BREADCRUMB */}
            <div className="bg-gray-50 border-b">
                <div className="container mx-auto px-4 py-3">
                    <nav className="flex items-center gap-2 text-sm text-slate-gray">
                        <Link href="/" className="hover:text-electric-orange transition-colors flex items-center gap-1">
                            <Home className="h-3.5 w-3.5" /> Trang chủ
                        </Link>
                        <ChevronSep className="h-3.5 w-3.5 text-slate-300" />
                        <Link href="/products" className="hover:text-electric-orange transition-colors">
                            Sản phẩm
                        </Link>
                        <ChevronSep className="h-3.5 w-3.5 text-slate-300" />
                        <span className="text-industrial-black font-medium truncate max-w-[200px]">{product.name}</span>
                    </nav>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* ======= LEFT: IMAGE GALLERY ======= */}
                    <div className="lg:col-span-5">
                        {/* Main Image */}
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-white border border-gray-200 group mb-4">
                            {allImages[selectedImage] && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={allImages[selectedImage]}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                                />
                            )}

                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-electric-orange hover:text-white"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-electric-orange hover:text-white"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnail Strip */}
                        {allImages.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={cn(
                                            "flex-shrink-0 w-[72px] h-[72px] rounded-md overflow-hidden border-2 transition-all",
                                            selectedImage === idx
                                                ? "border-electric-orange"
                                                : "border-gray-200 hover:border-gray-400"
                                        )}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Share & Wishlist Row */}
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-sm text-slate-gray">
                            <button
                                onClick={() => setIsWishlisted(w => !w)}
                                className="flex items-center gap-1.5 hover:text-red-500 transition-colors"
                            >
                                <Heart className={cn("h-4 w-4", isWishlisted && "fill-red-500 text-red-500")} />
                                Yêu thích
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    toast({ title: "Đã sao chép link!" });
                                }}
                                className="flex items-center gap-1.5 hover:text-electric-orange transition-colors"
                            >
                                <Share2 className="h-4 w-4" />
                                Chia sẻ
                            </button>
                        </div>
                    </div>

                    {/* ======= RIGHT: PRODUCT INFO ======= */}
                    <div className="lg:col-span-7">
                        {/* Brand & Origin */}
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wider text-electric-orange bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                                {product.brand}
                            </span>
                            <span className="text-xs text-slate-gray flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {product.origin}
                            </span>
                        </div>

                        {/* Product Name */}
                        <h1 className="text-2xl lg:text-3xl font-bold text-industrial-black leading-tight mb-4">
                            {product.name}
                        </h1>

                        {/* Rating & SKU row */}
                        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-200">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ))}
                                <span className="text-sm text-slate-gray ml-1">(5.0)</span>
                            </div>
                            {selectedVariant?.sku && (
                                <span className="text-xs text-slate-gray font-mono">
                                    SKU: {selectedVariant.sku}
                                </span>
                            )}
                        </div>

                        {/* ====== PRICE SECTION ====== */}
                        <div className="bg-gray-50 rounded-lg p-5 mb-6">
                            {selectedVariant ? (
                                <div className="flex items-baseline gap-3">
                                    <span className="text-3xl font-black text-red-600">
                                        {formatVND(selectedVariant.price)}
                                    </span>
                                </div>
                            ) : priceRange ? (
                                <div>
                                    <span className="text-2xl font-black text-red-600">
                                        {priceRange.min === priceRange.max
                                            ? formatVND(priceRange.min)
                                            : `${formatVND(priceRange.min)} - ${formatVND(priceRange.max)}`
                                        }
                                    </span>
                                    <p className="text-xs text-slate-gray mt-1">Chọn phân loại để xem giá chính xác</p>
                                </div>
                            ) : (
                                <span className="text-xl font-bold text-slate-gray">Liên hệ</span>
                            )}
                        </div>

                        {/* ====== VARIANT SELECTOR ====== */}
                        {Object.keys(attributeGroups).length > 0 && (
                            <div className="space-y-5 mb-6">
                                {Object.entries(attributeGroups).map(([attrKey, options]) => (
                                    <div key={attrKey}>
                                        <p className="text-sm font-semibold text-industrial-black mb-2.5">
                                            {attrKey}: <span className="text-electric-orange font-bold">{selectedAttributes[attrKey] || "—"}</span>
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {options.map(opt => {
                                                const isActive = selectedAttributes[attrKey] === opt;
                                                const testAttrs = { ...selectedAttributes, [attrKey]: opt };
                                                const isAvailable = variants.some(v =>
                                                    Object.entries(testAttrs).every(([k, val]) => v.attributes[k] === val)
                                                );

                                                return (
                                                    <button
                                                        key={opt}
                                                        onClick={() => handleSelectAttribute(attrKey, opt)}
                                                        disabled={!isAvailable}
                                                        className={cn(
                                                            "px-4 py-2 rounded border text-sm font-medium transition-all min-w-[60px]",
                                                            isActive
                                                                ? "border-electric-orange bg-orange-50 text-electric-orange font-bold"
                                                                : isAvailable
                                                                    ? "border-gray-300 text-industrial-black hover:border-electric-orange hover:text-electric-orange"
                                                                    : "border-gray-100 text-gray-300 cursor-not-allowed line-through bg-gray-50"
                                                        )}
                                                    >
                                                        {isActive && <Check className="inline h-3 w-3 mr-1" />}
                                                        {opt}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ====== QUANTITY & STOCK ====== */}
                        <div className="flex items-center gap-6 mb-6 flex-wrap">
                            <div>
                                <p className="text-sm font-semibold text-industrial-black mb-2">Số lượng</p>
                                <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 transition-colors text-industrial-black"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value) || 1;
                                            const max = selectedVariant?.stock || 999;
                                            setQuantity(Math.min(Math.max(1, val), max));
                                        }}
                                        className="h-10 w-16 text-center font-bold text-lg border-x border-gray-300 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <button
                                        onClick={() => setQuantity(q => Math.min(selectedVariant?.stock || 999, q + 1))}
                                        className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 transition-colors text-industrial-black"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            {selectedVariant && (
                                <p className={cn(
                                    "text-sm font-medium mt-6",
                                    selectedVariant.stock > 10
                                        ? "text-green-600"
                                        : selectedVariant.stock > 0
                                            ? "text-orange-500"
                                            : "text-red-500"
                                )}>
                                    {selectedVariant.stock > 0 ? `${selectedVariant.stock} sản phẩm có sẵn` : "Hết hàng"}
                                </p>
                            )}
                        </div>

                        {/* ====== ACTION BUTTONS ====== */}
                        <div className="flex gap-3 mb-8">
                            <Button
                                size="lg"
                                className="text-base  bg-electric-orange hover:bg-orange-600 text-white rounded-md shadow-lg shadow-orange-500/20 transition-all"
                                disabled={!selectedVariant || selectedVariant.stock === 0}
                            >
                                <ShoppingCart className="mr-2 h-5 w-5" /> Thêm vào giỏ hàng
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="flex-1 text-base font-bold border-electric-orange text-electric-orange hover:bg-orange-50 rounded-md transition-all"
                                disabled={!selectedVariant || selectedVariant.stock === 0}
                            >
                                <Zap className="mr-2 h-5 w-5" /> Mua ngay
                            </Button>
                        </div>

                        {/* ====== TRUST BADGES ====== */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-gray-200">
                            {[
                                { icon: Shield, label: "Sản phẩm chính hãng", sub: "100% authentic" },
                                { icon: Truck, label: "Giao hàng toàn quốc", sub: "Nhanh & tiết kiệm" },
                                { icon: Phone, label: "Hỗ trợ tư vấn", sub: "093.400.14.35" },
                                { icon: Star, label: "Bảo hành đổi trả", sub: "Theo chính sách" },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2.5 p-3">
                                    <item.icon className="h-5 w-5 text-electric-orange flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-industrial-black">{item.label}</p>
                                        <p className="text-[10px] text-slate-gray">{item.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ======= BOTTOM SECTIONS ======= */}
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Description */}
                    <div className="lg:col-span-8">
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-electric-orange text-white px-6 py-3 font-bold uppercase tracking-wider text-sm">
                                Mô tả sản phẩm
                            </div>
                            <div className="p-6">
                                {product.description ? (
                                    <div className="prose prose-slate max-w-none whitespace-pre-line text-sm leading-relaxed">
                                        {product.description}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-gray italic">Chưa có mô tả chi tiết cho sản phẩm này.</p>
                                )}
                            </div>
                        </div>

                        {/* Variants Table */}
                        {variants.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mt-6">
                                <div className="bg-industrial-black text-white px-6 py-3 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                                    <Layers className="h-4 w-4" /> Tất cả phân loại ({variants.length})
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                <th className="p-3 text-left font-semibold text-industrial-black">Phân loại</th>
                                                <th className="p-3 text-left font-semibold text-industrial-black">SKU</th>
                                                <th className="p-3 text-right font-semibold text-industrial-black">Giá bán</th>
                                                <th className="p-3 text-right font-semibold text-industrial-black">Tồn kho</th>
                                                <th className="p-3 text-center font-semibold text-industrial-black">Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {variants.map(v => (
                                                <tr
                                                    key={v.id}
                                                    className={cn(
                                                        "border-b last:border-0 hover:bg-orange-50/50 transition-colors cursor-pointer",
                                                        selectedVariant?.id === v.id && "bg-orange-50"
                                                    )}
                                                    onClick={() => setSelectedAttributes(v.attributes)}
                                                >
                                                    <td className="p-3 font-medium">
                                                        {Object.entries(v.attributes).map(([k, val]) => (
                                                            <span key={k} className="inline-block bg-gray-100 text-industrial-black text-xs px-2 py-1 rounded mr-1 mb-1">
                                                                {k}: {val}
                                                            </span>
                                                        ))}
                                                    </td>
                                                    <td className="p-3 text-slate-gray font-mono text-xs">{v.sku || "—"}</td>
                                                    <td className="p-3 text-right font-bold text-red-600">{formatVND(v.price)}</td>
                                                    <td className="p-3 text-right font-medium">{v.stock}</td>
                                                    <td className="p-3 text-center">
                                                        <span className={cn(
                                                            "text-xs font-semibold px-2 py-1 rounded-full",
                                                            v.stock > 10
                                                                ? "bg-green-100 text-green-700"
                                                                : v.stock > 0
                                                                    ? "bg-yellow-100 text-yellow-700"
                                                                    : "bg-red-100 text-red-700"
                                                        )}>
                                                            {v.stock > 10 ? "Còn hàng" : v.stock > 0 ? "Sắp hết" : "Hết hàng"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Contact CTA */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="font-bold text-industrial-black mb-3 text-sm uppercase tracking-wider">Cần tư vấn?</h3>
                            <p className="text-sm text-slate-gray mb-4">Liên hệ hotline để được hỗ trợ nhanh nhất</p>
                            <a
                                href="tel:0934001435"
                                className="flex items-center gap-3 bg-electric-orange text-white rounded-lg px-4 py-3 font-bold hover:bg-orange-600 transition-colors"
                            >
                                <Phone className="h-5 w-5" />
                                <div>
                                    <p className="text-lg">093.400.14.35</p>
                                    <p className="text-xs font-normal opacity-80">7:30 - 20:00 hàng ngày</p>
                                </div>
                            </a>
                        </div>

                        {/* Product Info */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="font-bold text-industrial-black mb-4 text-sm uppercase tracking-wider">Thông tin sản phẩm</h3>
                            <dl className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-slate-gray">Thương hiệu</dt>
                                    <dd className="font-semibold text-industrial-black">{product.brand}</dd>
                                </div>
                                <div className="flex justify-between border-t border-gray-100 pt-3">
                                    <dt className="text-slate-gray">Xuất xứ</dt>
                                    <dd className="font-semibold text-industrial-black">{product.origin}</dd>
                                </div>
                                <div className="flex justify-between border-t border-gray-100 pt-3">
                                    <dt className="text-slate-gray">Phân loại</dt>
                                    <dd className="font-semibold text-industrial-black">{variants.length} loại</dd>
                                </div>
                                {selectedVariant?.sku && (
                                    <div className="flex justify-between border-t border-gray-100 pt-3">
                                        <dt className="text-slate-gray">Mã SKU</dt>
                                        <dd className="font-semibold text-industrial-black font-mono">{selectedVariant.sku}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
}
