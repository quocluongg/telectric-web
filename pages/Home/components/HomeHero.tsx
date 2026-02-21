"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
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

    const slides = [
        {
            title: "Ưu Đãi Đặc Biệt Kháng Khuẩn Đỉnh Cao",
            subtitle: "Thiết Bị Đo Độ Mặn AZ-8373",
            desc: "Đo độ mặn, TDS, nhiệt độ chính xác cực cao. Bảo hành 12 tháng.",
            action: "Mua Ngay",
            image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1200",
            price: "1.299.000đ"
        },
        {
            title: "Giải Pháp Tự Động Hóa 2026",
            subtitle: "Cam Kết Hàng Chính Hãng",
            desc: "Trang bị nhà máy của bạn bằng công nghệ hiện đại nhất.",
            action: "Khám Phá",
            image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200",
            price: ""
        }
    ];

    return (
        <section className="bg-slate-50 dark:bg-industrial-black/50 py-4 md:py-6">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Left: Category Sidebar */}
                    <div className="hidden lg:flex w-64 flex-col bg-white dark:bg-[#1e2330] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-shrink-0">
                        <div className="p-4 bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                                <Zap className="h-5 w-5 text-electric-orange" />
                                Danh mục sản phẩm
                            </h3>
                        </div>
                        <ul className="flex-1 overflow-y-auto max-h-[380px] py-2">
                            {loadingCats ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="animate-spin text-slate-300 w-6 h-6" />
                                </div>
                            ) : (
                                categories.map((cat) => (
                                    <li key={cat.id}>
                                        <Link
                                            href={`/products?category=${cat.slug}`}
                                            className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-[#2a3040] hover:text-electric-orange group transition-colors"
                                        >
                                            <span className="truncate pr-2">{cat.name}</span>
                                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-electric-orange transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    {/* Right: Dynamic Hero Carousel */}
                    <div className="flex-1 min-w-0 relative rounded-xl overflow-hidden shadow-sm group">
                        <div className="overflow-hidden w-full h-full min-h-[350px] md:min-h-[420px]" ref={emblaRef}>
                            <div className="flex h-full">
                                {slides.map((slide, idx) => (
                                    <div key={idx} className="flex-[0_0_100%] min-w-0 relative">
                                        {/* Image */}
                                        <div className="absolute inset-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-r from-industrial-black/80 via-industrial-black/50 to-transparent"></div>
                                        </div>

                                        {/* Content */}
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="px-8 md:px-16 max-w-2xl text-white">
                                                <span className="inline-block px-3 py-1 mb-4 rounded-full bg-electric-orange/20 border border-electric-orange/30 text-electric-orange text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                                                    {slide.title}
                                                </span>
                                                <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight tracking-tight">
                                                    {slide.subtitle}
                                                </h2>
                                                <p className="text-slate-200 text-base md:text-lg mb-8 max-w-lg leading-relaxed">
                                                    {slide.desc}
                                                </p>
                                                <div className="flex items-center gap-6">
                                                    <Link href="/products" className="inline-flex items-center justify-center gap-2 bg-electric-orange hover:bg-orange-600 text-white px-6 py-3.5 rounded-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(234,88,12,0.4)]">
                                                        {slide.action} <ArrowRight className="h-5 w-5" />
                                                    </Link>
                                                    {slide.price && (
                                                        <div className="flex flex-col">
                                                            <span className="text-sm text-slate-300 line-through">1.600.000đ</span>
                                                            <span className="text-2xl font-black text-electric-orange">{slide.price}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Carousel Dots */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                            {slides.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => scrollTo(idx)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === selectedIndex ? "bg-electric-orange w-8" : "bg-white/50 hover:bg-white/80"}`}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
