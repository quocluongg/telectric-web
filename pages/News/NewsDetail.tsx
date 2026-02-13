"use client";

import { News } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowLeft, Newspaper, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface NewsDetailPageProps {
    article: News;
    relatedArticles: News[];
}

export default function NewsDetailPage({ article, relatedArticles }: NewsDetailPageProps) {
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
            {/* Breadcrumb */}
            <div className="bg-white dark:bg-[#0f111a] border-b border-slate-200 dark:border-slate-800">
                <div className="container mx-auto max-w-7xl px-4 py-3">
                    <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Link href="/" className="hover:text-electric-orange transition-colors">
                            Trang chủ
                        </Link>
                        <span>/</span>
                        <Link href="/news" className="hover:text-electric-orange transition-colors">
                            Bài viết
                        </Link>
                        <span>/</span>
                        <span className="text-slate-900 dark:text-white font-medium line-clamp-1">
                            {article.title}
                        </span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <article className="flex-1">
                        {/* Back link */}
                        <Link
                            href="/news"
                            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-electric-orange transition-colors mb-6"
                        >
                            <ArrowLeft size={16} />
                            <span>Quay lại danh sách</span>
                        </Link>

                        <Card className="bg-white dark:bg-[#1e2330] border-slate-200 dark:border-slate-800 overflow-hidden">
                            <CardContent className="p-6 sm:p-8">
                                {/* Title */}
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
                                    {article.title}
                                </h1>

                                {/* Date */}
                                {formattedDate && (
                                    <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 mb-6">
                                        <Calendar size={15} />
                                        <span>{formattedDate}</span>
                                    </div>
                                )}

                                {/* Divider */}
                                <div className="w-16 h-1 bg-electric-orange rounded-full mb-6" />

                                {/* Article Content Styles */}
                                <style>{`
                                    .article-body {
                                        color: #475569;
                                        font-size: 16px;
                                        line-height: 1.8;
                                        overflow: hidden;
                                        word-wrap: break-word;
                                        overflow-wrap: break-word;
                                    }
                                    .dark .article-body {
                                        color: #94a3b8;
                                    }
                                    
                                    /* Center text content */
                                    .article-body > p, 
                                    .article-body > h1, 
                                    .article-body > h2, 
                                    .article-body > h3, 
                                    .article-body > h4, 
                                    .article-body > h5, 
                                    .article-body > h6, 
                                    .article-body > ul, 
                                    .article-body > ol, 
                                    .article-body > blockquote {
                                        max-width: 65ch;
                                        margin-left: auto;
                                        margin-right: auto;
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
                                    
                                    .article-body p {
                                        margin-bottom: 20px;
                                    }
                                    
                                    .article-body h1, .article-body h2, .article-body h3, .article-body h4 {
                                        font-weight: 700;
                                        margin-top: 40px;
                                        margin-bottom: 16px;
                                        letter-spacing: -0.01em;
                                        line-height: 1.3;
                                    }
                                    .article-body h1 { font-size: 1.8em; }
                                    .article-body h2 { font-size: 1.5em; }
                                    .article-body h3 { font-size: 1.25em; }
                                    .article-body h4 { font-size: 1.1em; }
                                    
                                    .dark .article-body h1,
                                    .dark .article-body h2,
                                    .dark .article-body h3,
                                    .dark .article-body h4 {
                                        color: #f1f5f9;
                                    }
                                    
                                    .article-body a {
                                        color: #f97316;
                                        text-decoration: none;
                                        font-weight: 500;
                                    }
                                    .article-body a:hover {
                                        text-decoration: underline;
                                    }
                                    
                                    .article-body strong, .article-body b {
                                        color: #1e293b;
                                        font-weight: 600;
                                    }
                                    .dark .article-body strong, .dark .article-body b {
                                        color: #f1f5f9;
                                    }
                                    
                                    .article-body ul, .article-body ol {
                                        padding-left: 20px;
                                        margin-bottom: 20px;
                                    }
                                    .article-body ul { list-style: disc inside; }
                                    .article-body ol { list-style: decimal inside; }
                                    .article-body li {
                                        margin-bottom: 8px;
                                    }
                                    
                                    .article-body blockquote {
                                        border-left: 4px solid #f97316;
                                        padding: 16px 24px;
                                        margin-top: 32px;
                                        margin-bottom: 32px;
                                        background: #f8fafc;
                                        border-radius: 0 12px 12px 0;
                                        color: #475569;
                                        font-style: italic;
                                        font-size: 1.1em;
                                    }
                                    .dark .article-body blockquote {
                                        background: #1e293b;
                                        color: #94a3b8;
                                    }
                                    
                                    .article-body pre {
                                        max-width: 65ch;
                                        margin-left: auto;
                                        margin-right: auto;
                                        background: #1e293b;
                                        color: #e2e8f0;
                                        padding: 20px;
                                        border-radius: 12px;
                                        overflow-x: auto;
                                        margin-top: 24px;
                                        margin-bottom: 24px;
                                        font-size: 14px;
                                        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                                    }
                                    .article-body code {
                                        background: #f1f5f9;
                                        padding: 3px 6px;
                                        border-radius: 6px;
                                        font-size: 0.9em;
                                        color: #ef4444;
                                        font-weight: 500;
                                    }
                                    .dark .article-body code {
                                        background: #334155;
                                        color: #fca5a5;
                                    }
                                `}</style>

                                {/* Article Body */}
                                <div
                                    className="article-body"
                                    dangerouslySetInnerHTML={{ __html: article.content || "" }}
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
                                            <SidebarArticle key={a.id} article={a} />
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
function SidebarArticle({ article }: { article: News }) {
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
