"use client";

import { News } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// shadcn UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

// Icons
import {
    Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, Copy,
    ChevronLeft, ChevronRight, Newspaper, Loader2, AlertTriangle,
    RefreshCw, Globe, FileText,
} from "lucide-react";

// ============================================
// TYPES
// ============================================
interface NewsTableProps {
    initialArticles: News[];
    totalCount: number;
    currentPage: number;
    itemsPerPage: number;
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
    });
}

// ============================================
// SUB-COMPONENT: Toolbar
// ============================================
function NewsTableToolbar({
    onSearch,
    selectedCount,
    onDeleteSelected,
}: {
    onSearch: (term: string) => void;
    selectedCount: number;
    onDeleteSelected: () => void;
}) {
    const [searchValue, setSearchValue] = useState("");

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Tìm kiếm bài viết..."
                        value={searchValue}
                        onChange={(e) => {
                            setSearchValue(e.target.value);
                            onSearch(e.target.value);
                        }}
                        className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-10"
                    />
                </div>
                {selectedCount > 0 && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={onDeleteSelected}
                        className="whitespace-nowrap"
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Xoá ({selectedCount})
                    </Button>
                )}
            </div>
            <div className="flex items-center gap-2">
                <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm">
                    <Link href="/admin/news/create">
                        <Plus className="h-4 w-4 mr-2" /> Thêm bài viết
                    </Link>
                </Button>
            </div>
        </div>
    );
}

// ============================================
// SUB-COMPONENT: News Row
// ============================================
function NewsRow({
    article,
    isSelected,
    onToggleSelect,
    onDelete,
}: {
    article: News;
    isSelected: boolean;
    onToggleSelect: () => void;
    onDelete: () => void;
}) {
    const router = useRouter();

    return (
        <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
            <TableCell className="w-[40px]">
                <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} />
            </TableCell>

            {/* Thumbnail + Title */}
            <TableCell>
                <div className="flex items-center gap-3">
                    <div className="w-14 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white flex-shrink-0">
                        {article.thumbnail ? (
                            <Image
                                src={article.thumbnail}
                                alt={article.title}
                                width={56}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <Newspaper size={16} className="text-slate-400" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <Link
                            href={`/news/${article.slug}`}
                            target="_blank"
                            className="font-semibold text-sm text-slate-900 dark:text-white hover:text-orange-600 transition-colors line-clamp-1"
                        >
                            {article.title}
                        </Link>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">/{article.slug}</p>
                    </div>
                </div>
            </TableCell>

            {/* Status */}
            <TableCell>
                {article.is_published ? (
                    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400 gap-1">
                        <Globe size={12} /> Đã xuất bản
                    </Badge>
                ) : (
                    <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 gap-1">
                        <FileText size={12} /> Nháp
                    </Badge>
                )}
            </TableCell>

            {/* Date */}
            <TableCell className="text-xs text-slate-500">
                {formatDate(article.created_at)}
            </TableCell>

            {/* Actions */}
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => window.open(`/news/${article.slug}`, "_blank")}>
                            <Eye className="h-4 w-4 mr-2" /> Xem bài viết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/news/${article.id}/edit`)}>
                            <Pencil className="h-4 w-4 mr-2" /> Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(article.id)}>
                            <Copy className="h-4 w-4 mr-2" /> Sao chép ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" /> Xoá bài viết
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

// ============================================
// SUB-COMPONENT: Delete Dialog
// ============================================
function DeleteDialog({
    open,
    onOpenChange,
    articleTitle,
    onConfirm,
    isDeleting,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    articleTitle: string;
    onConfirm: () => void;
    isDeleting: boolean;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" /> Xác nhận xoá
                    </DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn xoá bài viết <strong className="text-slate-900 dark:text-white">{articleTitle}</strong>?
                        Hành động này không thể hoàn tác.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
                        Huỷ bỏ
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                        Xoá
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ============================================
// SUB-COMPONENT: Pagination
// ============================================
function PaginationBar({
    currentPage,
    totalPages,
    totalCount,
    itemsPerPage,
    onPageChange,
}: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}) {
    const from = (currentPage - 1) * itemsPerPage + 1;
    const to = Math.min(currentPage * itemsPerPage, totalCount);

    return (
        <div className="flex items-center justify-between pt-4">
            <p className="text-xs text-slate-500">
                Hiển thị <strong>{from}-{to}</strong> trong <strong>{totalCount}</strong> bài viết
            </p>
            <div className="flex items-center gap-1">
                <Button
                    variant="outline" size="icon"
                    className="h-8 w-8"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                        pageNum = i + 1;
                    } else if (currentPage <= 3) {
                        pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                    } else {
                        pageNum = currentPage - 2 + i;
                    }
                    return (
                        <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="icon"
                            className={`h-8 w-8 text-xs ${currentPage === pageNum ? "bg-orange-600 hover:bg-orange-700 text-white" : ""}`}
                            onClick={() => onPageChange(pageNum)}
                        >
                            {pageNum}
                        </Button>
                    );
                })}

                <Button
                    variant="outline" size="icon"
                    className="h-8 w-8"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function NewsTable({
    initialArticles,
    totalCount,
    currentPage,
    itemsPerPage,
}: NewsTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    const { toast } = useToast();

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [deleteTarget, setDeleteTarget] = useState<News | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPending, startTransition] = useTransition();

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Compute stats
    const publishedCount = initialArticles.filter(a => a.is_published).length;
    const draftCount = initialArticles.length - publishedCount;

    // --- Search ---
    const handleSearch = useCallback((term: string) => {
        const params = new URLSearchParams(searchParams?.toString() || "");
        if (term) params.set("search", term); else params.delete("search");
        params.set("page", "1");
        startTransition(() => {
            router.push(`?${params.toString()}`);
        });
    }, [searchParams, router]);

    // --- Pagination ---
    const handlePageChange = useCallback((page: number) => {
        const params = new URLSearchParams(searchParams?.toString() || "");
        params.set("page", page.toString());
        startTransition(() => {
            router.push(`?${params.toString()}`);
        });
    }, [searchParams, router]);

    // --- Selection ---
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === initialArticles.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(initialArticles.map(a => a.id)));
        }
    };

    // --- Delete Single ---
    const handleDeleteSingle = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        const { error } = await supabase.from("news").delete().eq("id", deleteTarget.id);
        setIsDeleting(false);
        setDeleteTarget(null);

        if (error) {
            toast({ title: "Lỗi xoá bài viết", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Đã xoá!", description: `"${deleteTarget.title}" đã được xoá.`, className: "bg-green-600 text-white" });
            router.refresh();
        }
    };

    // --- Delete Selected ---
    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) return;
        setIsDeleting(true);
        const { error } = await supabase.from("news").delete().in("id", Array.from(selectedIds));
        setIsDeleting(false);

        if (error) {
            toast({ title: "Lỗi xoá", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Đã xoá!", description: `${selectedIds.size} bài viết đã được xoá.`, className: "bg-green-600 text-white" });
            setSelectedIds(new Set());
            router.refresh();
        }
    };

    // --- Stats ---
    const stats = [
        { label: "Tổng bài viết", value: totalCount, color: "text-orange-600" },
        { label: "Đã xuất bản", value: publishedCount, color: "text-green-600" },
        { label: "Bản nháp", value: draftCount, color: "text-slate-500" },
        { label: "Trang hiện tại", value: `${currentPage}/${totalPages || 1}`, color: "text-blue-600" },
    ];

    return (
        <>
            {/* STATS ROW */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <CardContent className="p-4">
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{stat.label}</p>
                            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* MAIN TABLE CARD */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                        <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                            <Newspaper className="h-5 w-5 text-orange-600" />
                            Quản lý bài viết
                        </CardTitle>
                        <Button
                            variant="ghost" size="sm"
                            onClick={() => router.refresh()}
                            className="text-slate-500 hover:text-orange-600"
                        >
                            <RefreshCw className={`h-4 w-4 mr-1 ${isPending ? "animate-spin" : ""}`} />
                            Làm mới
                        </Button>
                    </div>
                    <NewsTableToolbar
                        onSearch={handleSearch}
                        selectedCount={selectedIds.size}
                        onDeleteSelected={handleDeleteSelected}
                    />
                </CardHeader>

                <CardContent>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700">
                                    <TableHead className="w-[40px]">
                                        <Checkbox
                                            checked={initialArticles.length > 0 && selectedIds.size === initialArticles.length}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead className="font-semibold">Bài viết</TableHead>
                                    <TableHead className="font-semibold">Trạng thái</TableHead>
                                    <TableHead className="font-semibold">Ngày tạo</TableHead>
                                    <TableHead className="text-right font-semibold w-[60px]">
                                        <span className="sr-only">Thao tác</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialArticles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-16">
                                            <div className="flex flex-col items-center gap-3 text-slate-400">
                                                <Newspaper className="h-12 w-12 opacity-30" />
                                                <p className="font-medium">Chưa có bài viết nào</p>
                                                <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700 text-white mt-2">
                                                    <Link href="/admin/news/create">
                                                        <Plus className="h-4 w-4 mr-1" /> Thêm bài viết đầu tiên
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    initialArticles.map(article => (
                                        <NewsRow
                                            key={article.id}
                                            article={article}
                                            isSelected={selectedIds.has(article.id)}
                                            onToggleSelect={() => toggleSelect(article.id)}
                                            onDelete={() => setDeleteTarget(article)}
                                        />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalCount > 0 && (
                        <PaginationBar
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalCount={totalCount}
                            itemsPerPage={itemsPerPage}
                            onPageChange={handlePageChange}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <DeleteDialog
                open={!!deleteTarget}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                articleTitle={deleteTarget?.title || ""}
                onConfirm={handleDeleteSingle}
                isDeleting={isDeleting}
            />
        </>
    );
}
