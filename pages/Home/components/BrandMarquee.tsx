"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

export function BrandMarquee() {
    const [emblaRef] = useEmblaCarousel({ loop: true, dragFree: true }, [
        Autoplay({ delay: 0, playOnInit: true, stopOnInteraction: false, stopOnMouseEnter: false })
    ]);

    // Example logos - replace with real brand logos
    const logos = Array(12).fill(null).map((_, i) => `https://logo.clearbit.com/sony.com`);

    // Custom brand logos for real look
    const brandLogos = [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Fluke_Corporation_logo.svg/1200px-Fluke_Corporation_logo.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Schneider_Electric_2024.svg/1024px-Schneider_Electric_2024.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Siemens_logo.svg/1200px-Siemens_logo.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/ABB_logo.svg/1200px-ABB_logo.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Bosch_logo.svg/1200px-Bosch_logo.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Philips_logo.svg/1200px-Philips_logo.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Honeywell_logo.svg/1200px-Honeywell_logo.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Omron_Logo.svg/1200px-Omron_Logo.svg.png"
    ];

    return (
        <section className="py-12 bg-white dark:bg-[#1e2330] border-t border-slate-200 dark:border-white/5 transition-colors duration-300 overflow-hidden">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                        Đối tác & Thương hiệu <span className="text-electric-orange">Hàng đầu</span>
                    </h2>
                    <p className="text-slate-500 mt-2">Phân phối chính hãng các thương hiệu nổi tiếng thế giới</p>
                </div>

                {/* Continuous Ticker */}
                <div className="embla w-full overflow-hidden mask-image-linear" ref={emblaRef}>
                    <div className="flex" style={{ animation: 'marquee 30s linear infinite' }}>
                        {/* Duplicate the array to create an infinite scroll illusion */}
                        {[...brandLogos, ...brandLogos, ...brandLogos].map((src, index) => (
                            <div key={index} className="flex-[0_0_150px] md:flex-[0_0_200px] min-w-0 mx-4 h-24 bg-slate-50 dark:bg-industrial-black rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center p-4 hover:border-electric-orange dark:hover:border-electric-orange hover:shadow-md transition-all duration-300 group cursor-pointer">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={src}
                                    alt="Brand Logo"
                                    className="max-w-[80%] max-h-[80%] object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
