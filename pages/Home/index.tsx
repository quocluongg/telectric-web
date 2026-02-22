"use client";

import React from "react";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { HomeHero } from "./components/HomeHero";
import { TrustBadges } from "./components/TrustBadges";
import { FlashSale } from "./components/FlashSale";
import { CategorySection } from "./components/CategorySection";
import { BrandMarquee } from "./components/BrandMarquee";
import { Gauge, Thermometer, Wind } from "lucide-react";

export default function HomePage() {
    return (
        <DefaultLayout>
            <div className="bg-slate-100 dark:bg-industrial-black min-h-screen">
                <HomeHero />
                <TrustBadges />
                <FlashSale />

                {/* Đồng hồ đo điện */}
                <CategorySection
                    categoryName="Đồng hồ đo điện"
                    categorySlug="thiet-bi-do-dien"
                    accentColor="bg-red-600"
                    icon={<Gauge className="w-4 h-4" />}
                    bannerText="ĐỒNG HỒ ĐO"
                    bannerSubText="Chính hãng, bảo hành 1 đổi 1"
                    bannerBg="from-red-600 to-orange-500"
                />

                {/* Máy đo môi trường */}
                <CategorySection
                    categoryName="Máy đo môi trường"
                    categorySlug="thiet-bi-do-moi-truong"
                    accentColor="bg-blue-600"
                    icon={<Wind className="w-4 h-4" />}
                    bannerText="MÁY ĐO ĐA CHỨC NĂNG"
                    bannerSubText="Đo ánh sáng, tốc độ gió, độ ồn"
                    bannerBg="from-blue-600 to-cyan-500"
                />

                {/* Thiết bị đo nhiệt độ */}
                <CategorySection
                    categoryName="Thiết bị đo nhiệt độ"
                    categorySlug="thiet-bi-do-nhiet-do"
                    accentColor="bg-orange-600"
                    icon={<Thermometer className="w-4 h-4" />}
                    bannerText="ĐO NHIỆT ĐỘ"
                    bannerSubText="Hồng ngoại, tiếp xúc, camera nhiệt"
                    bannerBg="from-orange-500 to-yellow-500"
                />

                <BrandMarquee />
            </div>
        </DefaultLayout>
    );
}
