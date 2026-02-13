"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Home, Package, Zap, LifeBuoy, Percent, Sun, Moon, Megaphone } from "lucide-react";
import { useTheme } from "next-themes";

export const NavBar = () => {
    return (
        <div className="w-full bg-white dark:bg-industrial-black border-b border-slate-200 dark:border-white/5 relative z-10 transition-colors duration-300">
            <div className="container mx-auto max-w-7xl px-4 flex items-center justify-between h-12">

                {/* Main Navigation */}
                <nav className="flex items-center h-full">
                    <ul className="flex items-center gap-6 h-full">
                        <NavItem href="/" icon={<Home size={16} />} label="Trang Chủ" active />
                        <NavItem href="/products" icon={<Package size={16} />} label="Sản Phẩm" />
                        <NavItem href="/brands" icon={<Zap size={16} />} label="Thương Hiệu" />
                        <NavItem href="/promotions" icon={<Percent size={16} />} label="Khuyến Mãi" />
                        <NavItem href="/news" icon={<Megaphone size={16} />} label="Bài viết" />
                        <NavItem href="/contact" icon={<LifeBuoy size={16} />} label="Liên Hệ" />
                    </ul>
                </nav>

                {/* Right Side: Theme Switcher */}
                <div className="flex items-center">
                    <ThemeToggle />
                </div>
            </div>
        </div>
    );
};

const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className="flex items-center gap-2 bg-slate-100 dark:bg-[#1e2330] hover:bg-slate-200 dark:hover:bg-[#2a3040] border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-white transition-colors opacity-50 cursor-not-allowed">
                <span className="w-4 h-4" />
            </button>
        )
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-2 bg-slate-100 dark:bg-[#1e2330] hover:bg-slate-200 dark:hover:bg-[#2a3040] border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-white transition-colors"
        >
            {theme === "dark" ? (
                <>
                    <Moon size={14} className="text-yellow-400" />
                    <span>Tối</span>
                </>
            ) : (
                <>
                    <Sun size={14} className="text-electric-orange" />
                    <span>Sáng</span>
                </>
            )}
        </button>
    )
}


const NavItem = ({ href, icon, label, active }: { href: string, icon?: React.ReactNode, label: string, active?: boolean }) => {
    return (
        <li className="h-full flex items-center">
            <Link
                href={href}
                className={`flex items-center gap-2 text-sm font-semibold transition-colors h-full border-b-2 ${active ? 'text-electric-orange border-electric-orange' : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-electric-orange dark:hover:text-white hover:border-electric-orange'}`}
            >
                {icon}
                <span>{label}</span>
            </Link>
        </li>
    )
}
