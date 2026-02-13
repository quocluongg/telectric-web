"use client";

import Link from "next/link";
import Image from "next/image";
import { Package, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function formatVND(value: number) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

export interface ProductCardData {
    id: string;
    name: string;
    brand: string;
    origin: string;
    thumbnail: string;
    category_name?: string | null;
    min_price: number;
    max_price: number;
    total_stock: number;
    variant_count: number;
}

export function ProductCard({ product }: { product: ProductCardData }) {
    const isOutOfStock = product.total_stock === 0;
    const hasMultiplePrices = product.min_price !== product.max_price;

    return (
        <Link href={`/products/${product.id}`} className="block group">
            <Card className="overflow-hidden border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/80 hover:shadow-lg hover:shadow-orange-500/5 dark:hover:shadow-orange-500/5 transition-all duration-300 hover:-translate-y-0.5 h-full flex flex-col">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                    {product.thumbnail ? (
                        <img
                            src={product.thumbnail}
                            alt={product.name}
                            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-14 w-14 text-slate-200 dark:text-slate-700" />
                        </div>
                    )}

                    {/* Top badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                        {isOutOfStock && (
                            <Badge className="bg-red-500/90 hover:bg-red-500 text-white text-[10px] px-2 py-0.5 font-semibold backdrop-blur-sm shadow-sm">
                                Hết hàng
                            </Badge>
                        )}
                        {product.category_name && (
                            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm">
                                {product.category_name}
                            </Badge>
                        )}
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <span className="inline-flex items-center gap-1.5 bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <Eye className="h-3.5 w-3.5" /> Xem chi tiết
                        </span>
                    </div>
                </div>

                {/* Content */}
                <CardContent className="p-3.5 flex flex-col flex-1 gap-1.5">
                    {/* Brand */}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500/80">
                        {product.brand}
                    </span>

                    {/* Name */}
                    <h3 className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors flex-1">
                        {product.name}
                    </h3>

                    {/* Variants */}
                    {product.variant_count > 1 && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {product.variant_count} phiên bản
                        </span>
                    )}

                    {/* Price */}
                    <div className="pt-1 border-t border-slate-100 dark:border-slate-700/50 mt-auto">
                        {isOutOfStock ? (
                            <span className="text-sm font-bold text-red-500">Liên hệ</span>
                        ) : hasMultiplePrices ? (
                            <div className="flex items-baseline gap-1 flex-wrap">
                                <span className="text-sm font-extrabold text-orange-600 dark:text-orange-500">
                                    {formatVND(product.min_price)}
                                </span>
                                <span className="text-[10px] text-slate-400">~</span>
                                <span className="text-[11px] font-medium text-slate-400">
                                    {formatVND(product.max_price)}
                                </span>
                            </div>
                        ) : (
                            <span className="text-sm font-extrabold text-orange-600 dark:text-orange-500">
                                {formatVND(product.min_price)}
                            </span>
                        )}
                    </div>

                    {/* Low stock warning */}
                    {!isOutOfStock && product.total_stock > 0 && product.total_stock <= 5 && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                            Chỉ còn {product.total_stock} sản phẩm
                        </span>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
