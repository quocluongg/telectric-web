"use client";

import { ShieldCheck, Truck, RotateCcw, Award } from "lucide-react";

export function TrustBadges() {
    const badges = [
        {
            icon: <Award className="w-8 h-8 text-electric-orange" />,
            title: "Hàng Chính Hãng 100%",
            desc: "Cam kết chất lượng từ nhà sản xuất",
        },
        {
            icon: <Truck className="w-8 h-8 text-electric-orange" />,
            title: "Giao Hàng Miễn Phí",
            desc: "Nhận hàng trong 24-72 tiếng",
        },
        {
            icon: <ShieldCheck className="w-8 h-8 text-electric-orange" />,
            title: "Bảo Hành 12 Tháng",
            desc: "Mọi sản phẩm trên TLECTRIC",
        },
        {
            icon: <RotateCcw className="w-8 h-8 text-electric-orange" />,
            title: "1 Đổi 1 Trong 30 Ngày",
            desc: "Đối với lỗi từ nhà sản xuất",
        },
    ];

    return (
        <section className="bg-white dark:bg-[#1e2330] py-8 border-y border-slate-200 dark:border-white/5 transition-colors duration-300">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {badges.map((badge, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-[#2a3040] transition-colors group cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                        >
                            <div className="bg-orange-50 dark:bg-industrial-black p-3 rounded-full group-hover:scale-110 transition-transform duration-300 shadow-sm border border-orange-100 dark:border-white/5">
                                {badge.icon}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-electric-orange transition-colors">
                                    {badge.title}
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {badge.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
