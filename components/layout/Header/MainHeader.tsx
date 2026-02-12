"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Zap, User, LogOut, Settings, UserCircle, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AuthModal } from "@/components/auth/AuthModal";
import { createClient } from "@/lib/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export const MainHeader = () => {
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const supabase = createClient();
    const router = useRouter();

    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authDefaultView, setAuthDefaultView] = useState<"login" | "register">("login");

    const openAuthModal = (view: "login" | "register") => {
        setAuthDefaultView(view);
        setAuthModalOpen(true);
    };

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    return (
        <div className="w-full bg-white dark:bg-industrial-black py-4 border-b border-slate-200 dark:border-white/5 relative z-20 transition-colors duration-300">
            <div className="container mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-electric-orange text-white p-1.5 rounded transform group-hover:scale-105 transition-transform duration-300">
                        <Zap size={24} fill="currentColor" />
                    </div>
                    {/* <img src="/logo.png" alt="Logo" className="h-10" /> OPTIONAL: Use image if available */}
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none group-hover:text-electric-orange transition-colors">
                            TLECTRIC
                        </span>
                    </div>
                </Link>

                {/* Search Bar */}
                <div className="flex-1 w-full max-w-2xl px-4">
                    <div className="relative flex items-center w-full group">
                        <Input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm, danh mục..."
                            className="w-full pl-5 pr-12 py-5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-[#1e2330] text-slate-900 dark:text-white focus-visible:ring-1 focus-visible:ring-electric-orange focus-visible:border-electric-orange transition-all placeholder:text-slate-500 dark:placeholder:text-slate-500"
                        />
                        <Search size={18} className="absolute right-4 text-slate-500 group-focus-within:text-electric-orange transition-colors" />
                    </div>
                </div>

                {/* Login Action / User Profile */}
                <div className="flex items-center">
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 bg-slate-100 dark:bg-[#1e2330] hover:bg-slate-200 dark:hover:bg-[#2a3040] text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors text-sm font-medium outline-none">
                                    <div className="bg-electric-orange rounded-full p-1">
                                        <User size={14} className="text-white" />
                                    </div>
                                    <span className="max-w-[150px] truncate">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
                                    <ChevronDown size={14} className="text-slate-500 dark:text-slate-400" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 bg-white dark:bg-[#1e2330] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200" align="end">
                                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                                <DropdownMenuItem asChild>
                                    <Link href="/account" className="focus:bg-slate-100 dark:focus:bg-[#2a3040] focus:text-slate-900 dark:focus:text-white cursor-pointer w-full flex items-center">
                                        <UserCircle className="mr-2 h-4 w-4" />
                                        <span>Hồ sơ</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-slate-100 dark:focus:bg-[#2a3040] focus:text-slate-900 dark:focus:text-white cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Cài đặt</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                                <DropdownMenuItem onClick={handleLogout} className="focus:bg-slate-100 dark:focus:bg-[#2a3040] focus:text-red-500 dark:focus:text-red-400 text-red-500 dark:text-red-400 cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Đăng xuất</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 bg-slate-100 dark:bg-[#1e2330] hover:bg-slate-200 dark:hover:bg-[#2a3040] text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors text-sm font-medium outline-none">
                                    <div className="bg-slate-200 dark:bg-slate-700 rounded-full p-1">
                                        <User size={14} className="text-slate-500 dark:text-slate-300" />
                                    </div>
                                    <span>Đăng nhập</span>
                                    <ChevronDown size={14} className="text-slate-500 dark:text-slate-400" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 bg-white dark:bg-[#1e2330] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200" align="end">
                                <DropdownMenuLabel>Khách</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                                <DropdownMenuItem onClick={() => openAuthModal("login")} className="focus:bg-slate-100 dark:focus:bg-[#2a3040] focus:text-slate-900 dark:focus:text-white cursor-pointer">
                                    <div className="flex items-center gap-2 w-full">
                                        <LogOut className="mr-2 h-4 w-4 rotate-180" /> {/* Simulate Login Icon */}
                                        <span>Đăng nhập</span>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openAuthModal("register")} className="focus:bg-slate-100 dark:focus:bg-[#2a3040] focus:text-slate-900 dark:focus:text-white cursor-pointer">
                                    <div className="flex items-center gap-2 w-full">
                                        <UserCircle className="mr-2 h-4 w-4" />
                                        <span>Đăng ký</span>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            <AuthModal
                open={authModalOpen}
                onOpenChange={setAuthModalOpen}
                defaultView={authDefaultView}
            />
        </div>
    );
};
