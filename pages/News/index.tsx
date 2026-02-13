"use client";

import { News } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight, Newspaper, TrendingUp, Clock, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NewsListPageProps {
    articles: News[];
    recentArticles: News[];
}

export default function NewsListPage({ articles, recentArticles }: NewsListPageProps) {
    return (
        <div className="bg-gray-50 dark:bg-[#0a0d14] min-h-screen font-sans">
            {/* Breadcrumb */}
            <div className="bg-white dark:bg-[#0f111a] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm backdrop-blur-md bg-white/80 dark:bg-[#0f111a]/80 supports-[backdrop-filter]:bg-white/60">
                <div className="container mx-auto max-w-7xl px-4 py-3">
                    <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Link
                            href="/"
                            className="hover:text-electric-orange transition-colors duration-200 flex items-center gap-1"
                        >
                            Trang chủ
                        </Link>
                        <ChevronRight size={14} className="text-slate-300" />
                        <span className="text-slate-900 dark:text-white font-medium">Bài viết</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Page Header */}
                        <div className="mb-10 text-center lg:text-left">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
                                Bài Viết & <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-orange to-orange-500">Tin Tức</span>
                            </h1>
                            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0">
                                Cập nhật những tin tức mới nhất, chia sẻ kiến thức và kinh nghiệm sử dụng thiết bị đo điện chính xác.
                            </p>
                        </div>

                        {/* Articles List */}
                        {articles.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-[#1e2330] rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                <Newspaper className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Chưa có bài viết nào</h3>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Hiện tại chưa có bài viết nào trong chuyên mục này. Vui lòng quay lại sau.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {articles.map((article) => (
                                    <ArticleCard key={article.id} article={article} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="w-full lg:w-80 shrink-0 space-y-8">
                        {/* Search could go here */}

                        {/* Recent Articles */}
                        <div className="bg-white dark:bg-[#1e2330] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 sticky top-20">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={18} className="text-electric-orange" />
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                                        Bài viết liên quan
                                    </h3>
                                </div>
                            </div>

                            <div className="p-5">
                                {recentArticles.length === 0 ? (
                                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                                        Chưa có bài viết liên quan.
                                    </p>
                                ) : (
                                    <div className="space-y-6">
                                        {recentArticles.map((article) => (
                                            <SidebarArticle key={article.id} article={article} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Banner/Ad placeholder could go here */}
                    </aside>
                </div>
            </div>
        </div>
    );
}

/* ─── Article Card (Horizontal List) ─── */
function ArticleCard({ article }: { article: News }) {
    const formattedDate = article.published_at
        ? new Date(article.published_at).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
        : "";

    return (
        <Link href={`/news/${article.slug}`} className="block group">
            <Card className="bg-white dark:bg-[#1e2330] border-slate-200 dark:border-slate-800 hover:border-electric-orange/30 hover:shadow-xl hover:shadow-electric-orange/5 transition-all duration-300 overflow-hidden flex flex-col md:flex-row rounded-2xl h-full">
                {/* Thumbnail Container */}
                <div className="relative overflow-hidden w-full md:w-72 lg:w-80 shrink-0 aspect-video md:aspect-[4/3] lg:aspect-square xl:aspect-[4/3]">
                    {article.thumbnail ? (
                        <Image
                            src={article.thumbnail}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center pattern-grid-lg">
                            <Newspaper className="w-12 h-12 text-slate-300 dark:text-slate-600 opacity-50" />
                        </div>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <CardContent className="flex-1 p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-400 dark:text-slate-500 mb-3">
                        {formattedDate && (
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-slate-600 dark:text-slate-300">
                                <Calendar size={12} />
                                <span>{formattedDate}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <Clock size={12} />
                            <span>5 phút đọc</span>
                        </div>
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-electric-orange transition-colors line-clamp-2 leading-tight">
                        {article.title}
                    </h2>

                    {article.excerpt && (
                        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4 md:mb-6">
                            {article.excerpt}
                        </p>
                    )}

                    <div className="mt-auto flex items-center text-electric-orange font-semibold text-sm group-hover:gap-2 transition-all duration-300">
                        <span>Đọc chi tiết</span>
                        <ArrowRight size={16} className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

/* ─── Sidebar Article (Horizontal) ─── */
function SidebarArticle({ article }: { article: News }) {
    const formattedDate = article.published_at
        ? new Date(article.published_at).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
        : "";

    return (
        <Link
            href={`/news/${article.slug}`}
            className="flex gap-4 group items-start"
        >
            <div className="w-20 h-20 relative shrink-0 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm">
                {article.thumbnail ? (
                    <Image
                        src={article.thumbnail}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Newspaper className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0 py-0.5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-electric-orange transition-colors line-clamp-2 leading-snug mb-1.5">
                    {article.title}
                </h4>
                {formattedDate && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                        <Calendar size={11} />
                        <span>{formattedDate}</span>
                    </div>
                )}
            </div>
        </Link>
    );
}
