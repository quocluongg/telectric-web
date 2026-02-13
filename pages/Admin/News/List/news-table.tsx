"use client";

import { News } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Newspaper,
    ChevronLeft,
    ChevronRight,
    Globe,
    FileText,
} from "lucide-react";

interface NewsTableProps {
    initialArticles: News[];
    totalCount: number;
    currentPage: number;
    itemsPerPage: number;
}

export default function NewsTable({
    initialArticles,
    totalCount,
    currentPage,
    itemsPerPage,
}: NewsTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [search, setSearch] = useState(searchParams?.get("search") || "");
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        params.set("page", "1");
        router.push(`/admin/news?${params.toString()}`);
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xoá bài viết "${title}"?`)) return;

        const supabase = createClient();
        const { error } = await supabase.from("news").delete().eq("id", id);

        if (error) {
            toast({ title: "Lỗi", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Đã xoá", description: `Bài viết "${title}" đã được xoá.` });
            router.refresh();
        }
    };

    const goToPage = (page: number) => {
        const params = new URLSearchParams(searchParams?.toString());
        params.set("page", page.toString());
        router.push(`/admin/news?${params.toString()}`);
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Quản lý Bài viết
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {totalCount} bài viết
                    </p>
                </div>
                <Link href="/admin/news/create">
                    <Button className="bg-electric-orange hover:bg-orange-600 text-white gap-2">
                        <Plus size={18} />
                        Thêm bài viết
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                        placeholder="Tìm kiếm bài viết..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </form>

            {/* Table */}
            {initialArticles.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Newspaper className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400">Chưa có bài viết nào.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                    <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-4">
                                        Bài viết
                                    </th>
                                    <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 py-4">
                                        Trạng thái
                                    </th>
                                    <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 py-4">
                                        Ngày tạo
                                    </th>
                                    <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-4">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {initialArticles.map((article) => (
                                    <tr key={article.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 relative shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                                    {article.thumbnail ? (
                                                        <Image
                                                            src={article.thumbnail}
                                                            alt={article.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                            <Newspaper size={18} className="text-slate-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                                                        {article.title}
                                                    </p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                                        /{article.slug}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {article.is_published ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2.5 py-1 rounded-full">
                                                    <Globe size={12} />
                                                    Đã xuất bản
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-400 px-2.5 py-1 rounded-full">
                                                    <FileText size={12} />
                                                    Nháp
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                                            {new Date(article.created_at).toLocaleDateString("vi-VN")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/news/${article.slug}`} target="_blank">
                                                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-500">
                                                        <Eye size={16} />
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/news/${article.id}/edit`}>
                                                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-electric-orange">
                                                        <Edit size={16} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-slate-500 hover:text-red-500"
                                                    onClick={() => handleDelete(article.id, article.title)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Trang {currentPage} / {totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage <= 1}
                                    onClick={() => goToPage(currentPage - 1)}
                                >
                                    <ChevronLeft size={16} />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => goToPage(currentPage + 1)}
                                >
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
