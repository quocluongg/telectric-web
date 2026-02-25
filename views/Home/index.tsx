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
            <div className="bg-[#f5f5f7] dark:bg-[#0f1118] min-h-screen">
                <HomeHero />
                <TrustBadges />
                <FlashSale />

                <CategorySection
                    categoryName="Đồng hồ đo điện"
                    categorySlug="dong-ho"
                    accentColor="bg-red-600"
                    accentBorderColor="border-red-500"
                    icon={<Gauge className="w-4 h-4" />}
                />

                <CategorySection
                    categoryName="Thiết bị điện tử"
                    categorySlug="thiet-bi-dien-tu"
                    accentColor="bg-blue-600"
                    accentBorderColor="border-blue-500"
                    icon={<Wind className="w-4 h-4" />}
                />

                <CategorySection
                    categoryName="Thiết bị đo nhiệt độ"
                    categorySlug="ngan"
                    accentColor="bg-orange-500"
                    accentBorderColor="border-orange-500"
                    icon={<Thermometer className="w-4 h-4" />}
                />

                <BrandMarquee />
            </div>
        </DefaultLayout>
    );
}
