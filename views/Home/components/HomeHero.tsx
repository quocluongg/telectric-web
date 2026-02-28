"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, ArrowRight, Zap, Loader2 } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { createClient } from "@/lib/supabase/client";

export function HomeHero() {
    const supabase = createClient();
    const [categories, setCategories] = useState<any[]>([]);
    const [loadingCats, setLoadingCats] = useState(true);

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi, setSelectedIndex]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on("select", onSelect);
        return () => { emblaApi.off("select", onSelect); };
    }, [emblaApi, onSelect]);

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from("categories").select("*").is("parent_id", null).order("name");
            if (data) setCategories(data);
            setLoadingCats(false);
        };
        fetchCategories();
    }, [supabase]);

    // ── DB Banners ──
    const [dbBanners, setDbBanners] = useState<any[]>([]);
    const [loadingBanners, setLoadingBanners] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            const { data } = await supabase
                .from("home_banners")
                .select("*")
                .eq("is_active", true)
                .order("order_index");
            setDbBanners(data || []);
            setLoadingBanners(false);
        };
        fetchBanners();
    }, [supabase]);

    // Fallback slides (shown when no DB banners are configured)
    const fallbackSlides = [
        {
            title: "Ưu Đãi Đặc Biệt Kháng Khuẩn Đỉnh Cao",
            subtitle: "Thiết Bị Đo Độ Mặn AZ-8373",
            desc: "Đo độ mặn, TDS, nhiệt độ chính xác cực cao. Bảo hành 12 tháng.",
            action: "Mua Ngay",
            image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1200",
            price: "1.299.000đ",
            link: "/products",
        },
        {
            title: "Giải Pháp Tự Động Hóa 2026",
            subtitle: "Cam Kết Hàng Chính Hãng",
            desc: "Trang bị nhà máy của bạn bằng công nghệ hiện đại nhất.",
            action: "Khám Phá",
            image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200",
            price: "",
            link: "/products",
        },
    ];

    const useDbBanners = !loadingBanners && dbBanners.length > 0;

    return (
        <section className="bg-white dark:bg-[#1e2330] border-b border-slate-200 dark:border-white/5">
            <div className="container mx-auto max-w-7xl px-4 flex flex-col lg:flex-row gap-0">
                {/* Left: Category Sidebar */}
                <div className="hidden lg:flex w-[260px] flex-col bg-slate-50 dark:bg-industrial-black/50 border-x border-slate-200 dark:border-slate-800 flex-shrink-0 z-10 relative">
                    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="font-extrabold uppercase tracking-wider text-sm flex items-center gap-2 text-slate-800 dark:text-white">
                            <Zap className="h-4 w-4 text-electric-orange" />
                            Danh mục sản phẩm
                        </h3>
                    </div>
                    <ul className="flex-1 overflow-y-auto h-[400px] md:h-[480px]">
                        {loadingCats ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="animate-spin text-slate-300 w-6 h-6" />
                            </div>
                        ) : (
                            categories.map((cat) => (
                                <li key={cat.id} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 relative group/nav">
                                    <Link
                                        href={`/products?category=${cat.slug}`}
                                        className="flex items-center justify-between px-5 py-3.5 text-[15px] font-medium text-slate-700 dark:text-slate-300 hover:text-electric-orange dark:hover:text-electric-orange transition-colors"
                                    >
                                        <span className="truncate pr-2">{cat.name}</span>
                                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover/nav:text-electric-orange transition-transform" />
                                    </Link>
                                    {/* Active border indicator on hover */}
                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-electric-orange scale-y-0 group-hover/nav:scale-y-100 transition-transform origin-center"></div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                {/* Right: Hero Carousel */}
                <div className="flex-1 min-w-0 relative group bg-industrial-black">
                    {loadingBanners ? (
                        /* Loading state */
                        <div className="flex items-center justify-center w-full h-[400px] md:h-[480px] bg-slate-900">
                            <Loader2 className="animate-spin text-slate-500 w-8 h-8" />
                        </div>
                    ) : useDbBanners ? (
                        /* ── DB-driven banner carousel ── */
                        <>
                            <div className="overflow-hidden w-full h-[400px] md:h-[480px]" ref={emblaRef}>
                                <div className="flex h-full">
                                    {dbBanners.map((banner, idx) => {
                                        const imgContent = (
                                            <div className="absolute inset-0">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={banner.image_url}
                                                    alt={banner.alt_text || `Banner ${idx + 1}`}
                                                    className="w-full h-full object-cover object-center"
                                                />
                                                {/* Gradient overlay for depth */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                                                {/* "Xem ngay" tooltip on hover, only if has link */}
                                                {banner.link_url && (
                                                    <div className="absolute bottom-6 right-6 bg-electric-orange/90 backdrop-blur-sm text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                                                        Xem ngay <ArrowRight className="h-3.5 w-3.5" />
                                                    </div>
                                                )}
                                            </div>
                                        );

                                        return (
                                            <div key={banner.id} className="flex-[0_0_100%] min-w-0 relative h-full">
                                                {banner.link_url ? (
                                                    <Link
                                                        href={banner.link_url}
                                                        className="block absolute inset-0 cursor-pointer"
                                                        title={banner.alt_text || undefined}
                                                    >
                                                        {imgContent}
                                                    </Link>
                                                ) : (
                                                    <div className="absolute inset-0">
                                                        {imgContent}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Dot / Progress Indicator */}
                            {dbBanners.length > 1 && (
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                                    {dbBanners.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => scrollTo(idx)}
                                            aria-label={`Banner ${idx + 1}`}
                                            className={`h-1.5 rounded-full transition-all duration-500 overflow-hidden relative ${idx === selectedIndex ? "bg-white/30 w-16" : "bg-white/30 hover:bg-white/50 w-8"}`}
                                        >
                                            {idx === selectedIndex && (
                                                <div className="absolute inset-0 bg-electric-orange animate-[progress_5s_linear_forwards] origin-left" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Navigation Arrows */}
                            {dbBanners.length > 1 && (
                                <div className="hidden lg:flex absolute bottom-8 right-8 z-10 gap-2">
                                    <button onClick={() => emblaApi?.scrollPrev()} className="w-12 h-12 rounded-full border border-white/20 bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-electric-orange hover:border-electric-orange transition-all">
                                        <ChevronRight className="h-6 w-6 rotate-180" />
                                    </button>
                                    <button onClick={() => emblaApi?.scrollNext()} className="w-12 h-12 rounded-full border border-white/20 bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-electric-orange hover:border-electric-orange transition-all">
                                        <ChevronRight className="h-6 w-6" />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        /* ── Fallback hardcoded slides (no DB banners yet) ── */
                        <>
                            <div className="overflow-hidden w-full h-[400px] md:h-[480px]" ref={emblaRef}>
                                <div className="flex h-full">
                                    {fallbackSlides.map((slide, idx) => (
                                        <div key={idx} className="flex-[0_0_100%] min-w-0 relative h-full">
                                            {/* Image Base Layer */}
                                            <div className="absolute inset-0">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover object-center" />
                                                {/* Refined Premium Gradient Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-industrial-black/90 via-industrial-black/60 to-transparent"></div>
                                                {/* Subtle top/bottom shadow for text contrast */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-industrial-black/40 via-transparent to-transparent"></div>
                                            </div>

                                            {/* Content Layer */}
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="px-8 md:px-16 lg:px-20 max-w-3xl text-white">
                                                    <div className="overflow-hidden mb-6">
                                                        <span className="inline-block px-4 py-1.5 rounded-full bg-electric-orange/10 border border-electric-orange/30 text-electric-orange text-xs lg:text-sm font-bold uppercase tracking-widest backdrop-blur-md relative">
                                                            <span className="absolute inset-0 bg-electric-orange/5 animate-pulse rounded-full"></span>
                                                            {slide.title}
                                                        </span>
                                                    </div>
                                                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-[1.1] tracking-tight drop-shadow-md">
                                                        {slide.subtitle}
                                                    </h2>
                                                    <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-xl leading-relaxed font-light drop-shadow-sm">
                                                        {slide.desc}
                                                    </p>
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                                        <Link href={slide.link} className="inline-flex items-center justify-center gap-3 bg-electric-orange hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold transition-all hover:-translate-y-1 shadow-[0_10px_25px_rgba(234,88,12,0.3)] hover:shadow-[0_15px_35px_rgba(234,88,12,0.4)]">
                                                            {slide.action} <ArrowRight className="h-5 w-5" />
                                                        </Link>
                                                        {slide.price && (
                                                            <div className="flex flex-col">
                                                                <span className="text-sm text-slate-400 line-through font-medium">1.600.000đ</span>
                                                                <span className="text-3xl font-black text-white tracking-tight">{slide.price}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Premium Progress/Dots Indicator */}
                            <div className="absolute bottom-8 left-8 md:left-16 lg:left-20 flex gap-3 z-10">
                                {fallbackSlides.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => scrollTo(idx)}
                                        aria-label={`Go to slide ${idx + 1}`}
                                        className={`h-1.5 rounded-full transition-all duration-500 overflow-hidden relative ${idx === selectedIndex ? "bg-white/30 w-16" : "bg-white/30 hover:bg-white/50 w-8"}`}
                                    >
                                        {/* Active progress fill */}
                                        {idx === selectedIndex && (
                                            <div className="absolute inset-0 bg-electric-orange animate-[progress_5s_linear_forwards] origin-left"></div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Navigation Arrows */}
                            <div className="hidden lg:flex absolute bottom-8 right-8 z-10 gap-2">
                                <button onClick={() => emblaApi?.scrollPrev()} className="w-12 h-12 rounded-full border border-white/20 bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-electric-orange hover:border-electric-orange transition-all">
                                    <ChevronRight className="h-6 w-6 rotate-180" />
                                </button>
                                <button onClick={() => emblaApi?.scrollNext()} className="w-12 h-12 rounded-full border border-white/20 bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-electric-orange hover:border-electric-orange transition-all">
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </section>
    );
}
