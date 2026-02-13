"use client";

import { useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
    ChevronLeft, ChevronRight, Package, Loader2, AlertTriangle,
    ArrowUpDown, Filter, Download, RefreshCw
} from "lucide-react";

// ============================================
// TYPES
// ============================================
export interface ProductRow {
    id: string;
    name: string;
    brand: string;
    origin: string;
    thumbnail: string;
    images: string[];
    created_at: string;
    updated_at: string;
    variant_count: number;
    min_price: number;
    max_price: number;
    total_stock: number;
}

interface ProductTableProps {
    initialProducts: ProductRow[];
    totalCount: number;
    currentPage: number;
    itemsPerPage: number;
}

// ============================================
// HELPER: Format VND
// ============================================
function formatVND(value: number) {
    if (!value && value !== 0) return "—";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric"
    });
}

// ============================================
// SUB-COMPONENT: Toolbar (Search + Actions)
// ============================================
function ProductTableToolbar({
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
                        placeholder="Tìm kiếm sản phẩm..."
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
                    <Link href="/admin/products/create">
                        <Plus className="h-4 w-4 mr-2" /> Thêm sản phẩm
                    </Link>
                </Button>
            </div>
        </div>
    );
}

// ============================================
// SUB-COMPONENT: Table Row
// ============================================
function ProductRow({
    product,
    isSelected,
    onToggleSelect,
    onDelete,
}: {
    product: ProductRow;
    isSelected: boolean;
    onToggleSelect: () => void;
    onDelete: () => void;
}) {
    const router = useRouter();

    return (
        <TableRow
            className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
        >
            {/* Checkbox */}
            <TableCell className="w-[40px]">
                <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} />
            </TableCell>

            {/* Image + Name */}
            <TableCell>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={product.thumbnail || "https://placehold.co/100x100/f1f5f9/94a3b8?text=No+Img"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="min-w-0">
                        <Link
                            href={`/products/${product.id}`}
                            className="font-semibold text-sm text-slate-900 dark:text-white hover:text-orange-600 transition-colors line-clamp-1"
                        >
                            {product.name}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">{product.brand} • {product.origin}</p>
                    </div>
                </div>
            </TableCell>

            {/* Price Range */}
            <TableCell>
                {product.min_price !== null && product.min_price !== undefined ? (
                    <div>
                        <p className="font-bold text-sm text-red-600">
                            {product.min_price === product.max_price
                                ? formatVND(product.min_price)
                                : `${formatVND(product.min_price)}`
                            }
                        </p>
                        {product.min_price !== product.max_price && (
                            <p className="text-[10px] text-slate-400">→ {formatVND(product.max_price)}</p>
                        )}
                    </div>
                ) : (
                    <span className="text-xs text-slate-400">Chưa có giá</span>
                )}
            </TableCell>

            {/* Stock */}
            <TableCell>
                <Badge
                    variant="outline"
                    className={
                        product.total_stock > 20
                            ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : product.total_stock > 0
                                ? "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }
                >
                    {product.total_stock ?? 0}
                </Badge>
            </TableCell>

            {/* Variants */}
            <TableCell>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {product.variant_count ?? 0}
                </span>
            </TableCell>

            {/* Date */}
            <TableCell className="text-xs text-slate-500">
                {formatDate(product.created_at)}
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
                        <DropdownMenuItem onClick={() => router.push(`/products/${product.id}`)}>
                            <Eye className="h-4 w-4 mr-2" /> Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/products/create?edit=${product.id}`)}>
                            <Pencil className="h-4 w-4 mr-2" /> Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                            navigator.clipboard.writeText(product.id);
                        }}>
                            <Copy className="h-4 w-4 mr-2" /> Sao chép ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" /> Xoá sản phẩm
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

// ============================================
// SUB-COMPONENT: Delete Confirmation Dialog
// ============================================
function DeleteDialog({
    open,
    onOpenChange,
    productName,
    onConfirm,
    isDeleting,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productName: string;
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
                        Bạn có chắc chắn muốn xoá <strong className="text-slate-900">{productName}</strong>?
                        Hành động này không thể hoàn tác. Tất cả biến thể liên quan cũng sẽ bị xoá.
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
function Pagination({
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
                Hiển thị <strong>{from}-{to}</strong> trong <strong>{totalCount}</strong> sản phẩm
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

                {/* Page numbers */}
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
// MAIN COMPONENT: ProductTable
// ============================================
export default function ProductTable({
    initialProducts,
    totalCount,
    currentPage,
    itemsPerPage,
}: ProductTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    const { toast } = useToast();

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPending, startTransition] = useTransition();

    const totalPages = Math.ceil(totalCount / itemsPerPage);

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
        if (selectedIds.size === initialProducts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(initialProducts.map(p => p.id)));
        }
    };

    // --- Delete ---
    const handleDeleteSingle = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        const { error } = await supabase.from("products").delete().eq("id", deleteTarget.id);
        setIsDeleting(false);
        setDeleteTarget(null);

        if (error) {
            toast({ title: "Lỗi xoá sản phẩm", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Đã xoá!", description: `${deleteTarget.name} đã được xoá.`, className: "bg-green-600 text-white" });
            router.refresh();
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) return;
        setIsDeleting(true);
        const { error } = await supabase.from("products").delete().in("id", Array.from(selectedIds));
        setIsDeleting(false);

        if (error) {
            toast({ title: "Lỗi xoá", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Đã xoá!", description: `${selectedIds.size} sản phẩm đã được xoá.`, className: "bg-green-600 text-white" });
            setSelectedIds(new Set());
            router.refresh();
        }
    };

    // --- Stats ---
    const stats = [
        { label: "Tổng sản phẩm", value: totalCount, color: "text-orange-600" },
        { label: "Trang hiện tại", value: `${currentPage}/${totalPages}`, color: "text-blue-600" },
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
                            <Package className="h-5 w-5 text-orange-600" />
                            Quản lý sản phẩm
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
                    <ProductTableToolbar
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
                                            checked={initialProducts.length > 0 && selectedIds.size === initialProducts.length}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead className="font-semibold">Sản phẩm</TableHead>
                                    <TableHead className="font-semibold">Giá bán</TableHead>
                                    <TableHead className="font-semibold">Tồn kho</TableHead>
                                    <TableHead className="font-semibold">Biến thể</TableHead>
                                    <TableHead className="font-semibold">Ngày tạo</TableHead>
                                    <TableHead className="text-right font-semibold w-[60px]">
                                        <span className="sr-only">Thao tác</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialProducts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-16">
                                            <div className="flex flex-col items-center gap-3 text-slate-400">
                                                <Package className="h-12 w-12 opacity-30" />
                                                <p className="font-medium">Không có sản phẩm nào</p>
                                                <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700 text-white mt-2">
                                                    <Link href="/admin/products/create">
                                                        <Plus className="h-4 w-4 mr-1" /> Thêm sản phẩm đầu tiên
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    initialProducts.map(product => (
                                        <ProductRow
                                            key={product.id}
                                            product={product}
                                            isSelected={selectedIds.has(product.id)}
                                            onToggleSelect={() => toggleSelect(product.id)}
                                            onDelete={() => setDeleteTarget(product)}
                                        />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalCount > 0 && (
                        <Pagination
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
                productName={deleteTarget?.name || ""}
                onConfirm={handleDeleteSingle}
                isDeleting={isDeleting}
            />
        </>
    );
}