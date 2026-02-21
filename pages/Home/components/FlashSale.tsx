"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Clock, ArrowRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { createClient } from "@/lib/supabase/client";

export function FlashSale() {
    const supabase = createClient();
    const [campaign, setCampaign] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [emblaRef] = useEmblaCarousel({ align: "start", dragFree: true });

    useEffect(() => {
        const fetchActiveCampaign = async () => {
            const now = new Date().toISOString();

            // Find active campaign (is_active = true and current time is within run time)
            const { data: activeCampaigns } = await supabase
                .from("campaigns")
                .select("*")
                .eq("is_active", true)
                .lte("start_time", now)
                .gte("end_time", now)
                .order("end_time", { ascending: true })
                .limit(1);

            if (activeCampaigns && activeCampaigns.length > 0) {
                const currentCampaign = activeCampaigns[0];
                setCampaign(currentCampaign);

                // Fetch items for this campaign
                const { data: itemsData } = await supabase
                    .from("campaign_items")
                    .select("*, products(*, categories(name))")
                    .eq("campaign_id", currentCampaign.id);

                if (itemsData) setProducts(itemsData);

                // Calculate initial time left in seconds
                const end = new Date(currentCampaign.end_time).getTime();
                setTimeLeft(Math.floor((end - new Date().getTime()) / 1000));
            }
        };

        fetchActiveCampaign();
    }, [supabase]);

    useEffect(() => {
        if (!campaign) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setCampaign(null); // Hide campaign when time is up
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [campaign]);

    const formatTime = (seconds: number) => {
        if (seconds < 0) seconds = 0;
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return { h, m, s };
    };

    if (!campaign || products.length === 0) return null;

    const { h, m, s } = formatTime(timeLeft);

    return (
        <section className="py-12 bg-slate-50 dark:bg-industrial-black">
            <div className="container mx-auto max-w-7xl px-4">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-electric-orange text-white p-2 rounded-lg">
                                <Zap className="w-6 h-6 animate-pulse" fill="currentColor" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                {campaign.name}
                            </h2>
                        </div>

                        {/* Countdown */}
                        <div className="flex items-center gap-2 text-white font-bold">
                            <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1.5 rounded text-lg w-10 text-center shadow-inner">
                                {h.toString().padStart(2, "0")}
                            </div>
                            <span className="text-slate-900 dark:text-white font-black">:</span>
                            <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1.5 rounded text-lg w-10 text-center shadow-inner">
                                {m.toString().padStart(2, "0")}
                            </div>
                            <span className="text-slate-900 dark:text-white font-black">:</span>
                            <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1.5 rounded text-lg w-10 text-center shadow-inner">
                                {s.toString().padStart(2, "0")}
                            </div>
                        </div>
                    </div>

                    <Link href="/products" className="text-sm font-semibold text-slate-500 hover:text-electric-orange dark:text-slate-400 dark:hover:text-electric-orange flex items-center gap-1 transition-colors group">
                        Xem tất cả <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Carousel */}
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex gap-4">
                        {products.map((item) => {
                            // Calculate percentage if normal price is available (assuming here you'd fetch it, using fixed 30% for now or calculate if possible)
                            // A real implementation would compare product.price and item.sale_price
                            return (
                                <Link
                                    href={`/products/${item.product_id}`}
                                    key={item.id}
                                    className="flex-[0_0_80%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_22%] min-w-0 bg-white dark:bg-[#1e2330] rounded-xl border border-orange-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden relative group/card"
                                >
                                    {/* Sale Badge */}
                                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10 shadow-sm">
                                        Siêu Sale
                                    </div>

                                    {/* Thumbnail */}
                                    <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                        {item.products?.thumbnail ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={item.products.thumbnail}
                                                alt={item.products.name}
                                                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Zap className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="text-slate-800 dark:text-slate-200 font-medium text-sm line-clamp-2 h-10 mb-2 group-hover/card:text-electric-orange transition-colors">
                                            {item.products?.name}
                                        </h3>
                                        <div className="flex flex-col">
                                            <span className="text-lg font-black text-electric-orange">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.sale_price)}
                                            </span>
                                        </div>

                                        {/* Progress Bar (Fake stock) */}
                                        <div className="mt-4">
                                            <div className="flex justify-between text-[10px] text-slate-500 font-medium mb-1 uppercase tracking-wider">
                                                <span>Mở bán: {item.stock_quantity ?? 'Giới hạn'}</span>
                                                <span className="text-electric-orange flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Đang Sale
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1">
                                                <div
                                                    className="bg-electric-orange h-full rounded-full"
                                                    style={{ width: `70%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>

            </div>
        </section>
    );
}
