"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
<<<<<<< HEAD
import { Home, Package, Zap, LifeBuoy, Percent, Sun, Moon, ChevronDown, Layers } from "lucide-react";
=======
import { Home, Package, Zap, LifeBuoy, Percent, Sun, Moon, ChevronDown, Layers, Megaphone } from "lucide-react";
>>>>>>> admin-dashboard
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Category {
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
}

export const NavBar = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase
                .from("categories")
                .select("id, name, slug, parent_id")
                .order("name");
            setCategories(data || []);
        };
        fetchCategories();
    }, [supabase]);

    const rootCategories = useMemo(() => categories.filter(c => !c.parent_id), [categories]);
    const getChildren = (parentId: string) => categories.filter(c => c.parent_id === parentId);

    return (
        <div className="w-full bg-white dark:bg-industrial-black border-b border-slate-200 dark:border-white/5 relative z-10 transition-colors duration-300">
            <div className="container mx-auto max-w-7xl px-4 flex items-center justify-between h-12">

                {/* Main Navigation */}
                <nav className="flex items-center h-full">
                    <ul className="flex items-center gap-6 h-full">
                        <NavItem href="/" icon={<Home size={16} />} label="Trang Chủ" />
                        <NavItem href="/products" icon={<Package size={16} />} label="Sản Phẩm" />

                        {/* Categories Mega-Dropdown */}
                        {rootCategories.length > 0 && (
                            <li className="h-full flex items-center relative group">
                                <button className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-electric-orange dark:hover:text-white transition-colors h-full border-b-2 border-transparent group-hover:border-electric-orange group-hover:text-electric-orange">
                                    <Layers size={16} />
                                    <span>Danh Mục</span>
                                    <ChevronDown size={12} className="transition-transform group-hover:rotate-180" />
                                </button>

                                {/* Dropdown */}
                                <div className="absolute top-full left-0 pt-0 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-4 min-w-[480px] grid grid-cols-2 gap-x-6 gap-y-1">
                                        {rootCategories.map(parent => {
                                            const children = getChildren(parent.id);
                                            return (
                                                <div key={parent.id} className="py-2">
                                                    <Link
                                                        href={`/products?category=${parent.slug}`}
                                                        className="text-sm font-bold text-slate-900 dark:text-white hover:text-electric-orange transition-colors flex items-center gap-2 mb-1.5"
                                                    >
                                                        <div className="w-6 h-6 rounded-md bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                                                            <Layers className="h-3.5 w-3.5 text-orange-500" />
                                                        </div>
                                                        {parent.name}
                                                    </Link>
                                                    {children.length > 0 && (
                                                        <div className="ml-8 space-y-0.5">
                                                            {children.map(child => (
                                                                <Link
                                                                    key={child.id}
                                                                    href={`/products?category=${child.slug}`}
                                                                    className="block text-xs text-slate-500 dark:text-slate-400 hover:text-electric-orange transition-colors py-0.5 hover:pl-1 transition-all"
                                                                >
                                                                    {child.name}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </li>
                        )}

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
