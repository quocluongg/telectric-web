"use client";

import { News } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowLeft, Newspaper, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// 1. Định nghĩa lại Type cho bài viết liên quan (chỉ cần các trường cần thiết)
interface RelatedArticleMinimal {
    id: string | number;
    title: string;
    slug: string;
    thumbnail?: string | null;
    published_at?: string | null;
}

interface NewsDetailPageProps {
    article: News;
    // 2. Cho phép relatedArticles nhận vào kiểu News hoặc bản rút gọn
    relatedArticles: (News | RelatedArticleMinimal)[];
}

export default function NewsDetailPage({ article, relatedArticles }: NewsDetailPageProps) {
    // ... Giữ nguyên phần logic bên dưới ...
    const formattedDate = article.published_at
        ? new Date(article.published_at).toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
        : "";

    return (
        <div className="bg-gray-50 dark:bg-[#0a0d14] min-h-screen">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <article className="flex-1">
                        <Link
                            href="/news"
                            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-electric-orange transition-colors mb-6"
                        >
                            <ArrowLeft size={16} />
                            <span>Quay lại danh sách</span>
                        </Link>

                        <Card className="bg-white dark:bg-[#1e2330] border-slate-200 dark:border-slate-800 overflow-hidden">
                            <CardContent className="p-6 sm:p-8">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
                                    {article.title}
                                </h1>

                                {formattedDate && (
                                    <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 mb-6">
                                        <Calendar size={15} />
                                        <span>{formattedDate}</span>
                                    </div>
                                )}

                                <div className="w-16 h-1 bg-electric-orange rounded-full mb-6" />

                                <style>{`
                                    .article-body {
                                        color: #475569;
                                        font-size: 16px;
                                        line-height: 1.8;
                                        overflow: hidden;
                                        word-wrap: break-word;
                                        overflow-wrap: break-word;
                                        text-align: justify;
                                        hyphens: none;
                                    }
                                    .dark .article-body {
                                        color: #94a3b8;
                                    }
                                    .article-body > p, .article-body > h1, .article-body > h2, .article-body > h3, .article-body > h4, .article-body > h5, .article-body > h6, .article-body > ul, .article-body > ol, .article-body > blockquote {
                                        max-width: 100%;
                                    }
                                    .article-body img {
                                        max-width: 100%;
                                        height: auto;
                                        border-radius: 12px;
                                        margin: 32px auto;
                                        display: block;
                                        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                                        object-fit: contain;
                                    }
                                `}</style>

                                <div
                                    className="article-body"
                                    dangerouslySetInnerHTML={{
                                        __html: (article.content || "")
                                            .replace(/[\u00AD\u200B\u200C\u200D\u2060\uFEFF]/g, '') // Remove zero-width chars
                                            .replace(/&nbsp;/g, ' ') // Replace HTML non-breaking spaces
                                            .replace(/\u00A0/g, ' ') // Replace Unicode non-breaking spaces
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </article>

                    {/* Sidebar */}
                    <aside className="w-full lg:w-80 shrink-0 space-y-6">
                        <Card className="bg-white dark:bg-[#1e2330] border-slate-200 dark:border-slate-800">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp size={18} className="text-electric-orange" />
                                    <h3 className="font-bold text-slate-900 dark:text-white">
                                        Bài viết liên quan
                                    </h3>
                                </div>
                                {relatedArticles.length === 0 ? (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Chưa có bài viết liên quan.
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {relatedArticles.map((a) => (
                                            <SidebarArticle key={a.id} article={a as any} />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </div>
        </div>
    );
}

/* ─── Sidebar Article ─── */
// Sửa Type ở đây để nhận vào kiểu News hoặc rút gọn
function SidebarArticle({ article }: { article: News | RelatedArticleMinimal }) {
    const formattedDate = article.published_at
        ? new Date(article.published_at).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
        : "";

    return (
        <Link href={`/news/${article.slug}`} className="flex gap-3 group">
            <div className="w-16 h-16 relative shrink-0 rounded-lg overflow-hidden">
                {article.thumbnail ? (
                    <Image
                        src={article.thumbnail}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Newspaper className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-electric-orange transition-colors line-clamp-2 leading-snug">
                    {article.title}
                </h4>
                {formattedDate && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-1">
                        <Calendar size={11} />
                        <span>{formattedDate}</span>
                    </div>
                )}
            </div>
        </Link>
    );
}