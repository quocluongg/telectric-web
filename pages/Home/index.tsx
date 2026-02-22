"use client";

import React from "react";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { HomeHero } from "./components/HomeHero";
import { TrustBadges } from "./components/TrustBadges";
import { FlashSale } from "./components/FlashSale";
import { CategoryShowcase } from "./components/CategoryShowcase";
import { BrandMarquee } from "./components/BrandMarquee";

export default function HomePage() {
    return (
        <DefaultLayout>
            <div className="bg-slate-50 dark:bg-industrial-black min-h-screen">
                <HomeHero />
                <TrustBadges />
                <FlashSale />

                {/* Dong-ho-do-dien - Using 'dong-ho-chuyen-dung-khac' for now as placeholder if needed, update slug later */}
                <CategoryShowcase
                    categoryName="ĐỒNG HỒ ĐO ĐIỆN"
                    categorySlug="thiet-bi-do-dien"
                    bannerColor="from-red-600 to-orange-500"
                    brandImages={[
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Fluke_Corporation_logo.svg/1200px-Fluke_Corporation_logo.svg.png",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJ6QpxRBY4i-hQ6x3A1jOHTg8bS-Wq9I081Q&s",
                        "https://kyoritsu.com.vn/wp-content/uploads/2019/08/logo-Kyoritsu.png",
                        "https://kyoritsu.net.vn/wp-content/uploads/2019/08/logo-Kyoritsu.png"
                    ]}
                />

                {/* May do moi truong */}
                <CategoryShowcase
                    categoryName="MÁY ĐO MÔI TRƯỜNG"
                    categorySlug="thiet-bi-do-moi-truong"
                    bannerColor="from-blue-600 to-cyan-500"
                    brandImages={[
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Omron_Logo.svg/1200px-Omron_Logo.svg.png",
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Siemens_logo.svg/1200px-Siemens_logo.svg.png",
                        "https://testo.com/favicon.ico",
                        "https://extech.com/favicon.ico"
                    ]}
                />

                <BrandMarquee />
            </div>
        </DefaultLayout>
    );
}
