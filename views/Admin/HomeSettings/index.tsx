"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
    Home, Save, Loader2, Zap, Thermometer, Gauge, Wind,
    Settings, Plus, Trash2, LayoutGrid, Search, Tag, ImageIcon, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Category {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    thumbnail: string | null;
}

interface BrandLogo {
    id: string;
    brand_name: string;
    logo_url: string | null;
}

interface HomeFeaturedCategory {
    id?: string;
    category_id: string;
    order_index: number;
    accent_color: string;
    icon_name: string;
    pinned_product_ids: string[];
    banner_url?: string | null;
    section_title?: string | null;
    pinned_brand_names?: string[];
}

const COLORS = [
    { label: "Red", value: "bg-red-600" },
    { label: "Blue", value: "bg-blue-600" },
    { label: "Orange", value: "bg-orange-500" },
    { label: "Green", value: "bg-emerald-600" },
    { label: "Purple", value: "bg-purple-600" },
    { label: "Indigo", value: "bg-indigo-600" },
];

const ICONS = [
    { name: "Zap", icon: <Zap className="h-4 w-4" /> },
    { name: "Gauge", icon: <Gauge className="h-4 w-4" /> },
    { name: "Wind", icon: <Wind className="h-4 w-4" /> },
    { name: "Thermometer", icon: <Thermometer className="h-4 w-4" /> },
    { name: "Settings", icon: <Settings className="h-4 w-4" /> },
    { name: "LayoutGrid", icon: <LayoutGrid className="h-4 w-4" /> },
];

const defaultFeatured = (i: number): HomeFeaturedCategory => ({
    category_id: "", order_index: i,
    accent_color: ["bg-red-600", "bg-blue-600", "bg-orange-500"][i],
    icon_name: ["Gauge", "Wind", "Thermometer"][i],
    pinned_product_ids: [], banner_url: null, section_title: null, pinned_brand_names: [],
});

export default function HomeSettingsPage() {
    const supabase = useMemo(() => createClient(), []);
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [featured, setFeatured] = useState<HomeFeaturedCategory[]>([]);
    const [allBrands, setAllBrands] = useState<BrandLogo[]>([]);

    // Product picker state
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [searchProduct, setSearchProduct] = useState("");
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);

    // Brand picker dialog state
    const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
    const [activeBrandSlotIndex, setActiveBrandSlotIndex] = useState<number | null>(null);

    // Banner upload
    const [uploadingBanner, setUploadingBanner] = useState<number | null>(null);
    const bannerInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

    const handleBannerUpload = async (file: File, index: number) => {
        // Validate portrait orientation
        const checkPortrait = (): Promise<boolean> =>
            new Promise((resolve) => {
                const img = new window.Image();
                img.onload = () => resolve(img.naturalHeight > img.naturalWidth);
                img.onerror = () => resolve(false);
                img.src = URL.createObjectURL(file);
            });

        const isPortrait = await checkPortrait();
        if (!isPortrait) {
            toast({
                title: "❌ Ảnh không hợp lệ",
                description: "Banner phải là ảnh dọc (chiều cao > chiều rộng). Vui lòng chọn ảnh portrait.",
                variant: "destructive",
                duration: 5000,
            });
            return;
        }

        setUploadingBanner(index);
        try {
            const compressed = await imageCompression(file, {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 800,
                useWebWorker: true,
                fileType: "image/webp",
                initialQuality: 0.8,
            });
            const fileName = `banners/section-${index}-${Date.now()}.webp`;
            const { error } = await supabase.storage
                .from("products")
                .upload(fileName, compressed, { contentType: "image/webp", upsert: true });
            if (error) throw error;
            const url = supabase.storage.from("products").getPublicUrl(fileName).data.publicUrl;
            handleUpdateFeatured(index, { banner_url: url });
            toast({ title: "✅ Tải ảnh thành công", className: "bg-green-600 text-white" });
        } catch (err: any) {
            toast({ title: "Lỗi upload", description: err.message, variant: "destructive" });
        } finally {
            setUploadingBanner(null);
        }
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [catRes, settingsRes, prodRes, brandRes] = await Promise.all([
                supabase.from("categories").select("id, name").order("name"),
                supabase.from("home_featured_categories").select("*").order("order_index"),
                supabase.from("products").select("id, name, thumbnail").limit(200),
                supabase.from("brand_logos").select("id, brand_name, logo_url").order("brand_name"),
            ]);

            setCategories(catRes.data || []);
            setAllProducts(prodRes.data || []);
            setAllBrands(brandRes.data || []);

            if (settingsRes.error || !settingsRes.data || settingsRes.data.length === 0) {
                if (settingsRes.error) console.warn("home_featured_categories not found:", settingsRes.error.message);
                setFeatured([0, 1, 2].map(defaultFeatured));
            } else {
                setFeatured(settingsRes.data.map((d: any) => ({
                    ...d,
                    pinned_brand_names: d.pinned_brand_names || [],
                })));
            }
        } catch (err: any) {
            toast({ title: "Lỗi tải dữ liệu", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [supabase, toast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleUpdateFeatured = (index: number, updates: Partial<HomeFeaturedCategory>) => {
        setFeatured(prev => {
            const next = [...prev];
            next[index] = { ...next[index], ...updates };
            return next;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            for (const item of featured) {
                const { error } = await supabase.from("home_featured_categories").upsert(
                    { ...item, updated_at: new Date().toISOString() },
                    { onConflict: "order_index" }
                );
                if (error) throw error;
            }
            toast({ title: "Đã lưu cài đặt!", className: "bg-green-600 text-white" });
        } catch {
            toast({ title: "Lỗi lưu cài đặt", description: "Đảm bảo đã tạo bảng home_featured_categories và thêm các cột mới.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    // ── Product picker ──
    const openProductPicker = (index: number) => { setActiveSlotIndex(index); setIsProductDialogOpen(true); };
    const filteredProducts = useMemo(() =>
        allProducts.filter(p => p.name.toLowerCase().includes(searchProduct.toLowerCase())),
        [allProducts, searchProduct]);

    const togglePinnedProduct = (productId: string) => {
        if (activeSlotIndex === null) return;
        const current = featured[activeSlotIndex].pinned_product_ids || [];
        if (current.includes(productId)) {
            handleUpdateFeatured(activeSlotIndex, { pinned_product_ids: current.filter(id => id !== productId) });
        } else {
            if (current.length >= 8) { toast({ title: "Tối đa 8 sản phẩm", variant: "destructive" }); return; }
            handleUpdateFeatured(activeSlotIndex, { pinned_product_ids: [...current, productId] });
        }
    };

    // ── Brand picker ──
    const openBrandPicker = (index: number) => { setActiveBrandSlotIndex(index); setIsBrandDialogOpen(true); };
    const togglePinnedBrand = (brandName: string) => {
        if (activeBrandSlotIndex === null) return;
        const current = featured[activeBrandSlotIndex].pinned_brand_names || [];
        const next = current.includes(brandName)
            ? current.filter(n => n !== brandName)
            : [...current, brandName];
        handleUpdateFeatured(activeBrandSlotIndex, { pinned_brand_names: next });
    };

    if (loading) {
        return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Home className="h-6 w-6 text-orange-500" /> Cài đặt Trang chủ
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Tùy chỉnh 3 mục danh mục nổi bật trên trang chủ</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-200 dark:shadow-none">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Lưu cấu hình
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[0, 1, 2].map((i) => (
                    <Card key={i} className="border-slate-200 dark:border-white/5 overflow-hidden">
                        <CardHeader className={cn("text-white py-4", featured[i]?.accent_color || "bg-slate-800")}>
                            <CardTitle className="text-lg flex items-center gap-2">
                                {ICONS.find(ic => ic.name === featured[i]?.icon_name)?.icon}
                                {featured[i]?.section_title || `Section ${i + 1}`}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">

                            {/* 1. Tên section */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5 text-orange-500" /> Tên hiển thị (Header)</Label>
                                <Input
                                    placeholder="Ví dụ: Đồng hồ đo điện..."
                                    value={featured[i]?.section_title || ""}
                                    onChange={(e) => handleUpdateFeatured(i, { section_title: e.target.value || null })}
                                />
                            </div>

                            {/* 2. Màu */}
                            <div className="space-y-2">
                                <Label>Màu sắc chủ đạo</Label>
                                <div className="flex flex-wrap gap-2">
                                    {COLORS.map(c => (
                                        <button
                                            key={c.value}
                                            onClick={() => handleUpdateFeatured(i, { accent_color: c.value })}
                                            className={cn("w-8 h-8 rounded-full border-2 transition-transform", c.value, featured[i]?.accent_color === c.value ? "border-slate-900 scale-110" : "border-transparent")}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* 4. Icon */}
                            <div className="space-y-2">
                                <Label>Biểu tượng (Icon)</Label>
                                <div className="flex flex-wrap gap-2">
                                    {ICONS.map(ic => (
                                        <button
                                            key={ic.name}
                                            onClick={() => handleUpdateFeatured(i, { icon_name: ic.name })}
                                            className={cn("p-2 rounded-md border flex items-center justify-center transition-colors", featured[i]?.icon_name === ic.name ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-slate-50 border-slate-200 text-slate-400")}
                                        >
                                            {ic.icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 5. Logo hãng hiển thị */}
                            <div className="space-y-2">
                                <Label className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5"><ImageIcon className="h-3.5 w-3.5 text-orange-500" /> Logo hãng (sidebar)</span>
                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-orange-600" onClick={() => openBrandPicker(i)}>
                                        <Plus className="h-3 w-3 mr-1" /> Chọn
                                    </Button>
                                </Label>
                                {featured[i]?.pinned_brand_names && featured[i].pinned_brand_names!.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {featured[i].pinned_brand_names!.map(name => {
                                            const brand = allBrands.find(b => b.brand_name === name);
                                            return (
                                                <div key={name} className="flex items-center gap-1 px-2 py-1 border rounded-full bg-slate-50 dark:bg-slate-900 text-[10px] group">
                                                    {brand?.logo_url
                                                        ? <img src={brand.logo_url} alt={name} className="w-8 h-4 object-contain" />
                                                        : <span className="font-bold uppercase text-slate-600">{name}</span>
                                                    }
                                                    <button
                                                        onClick={() => {
                                                            const next = (featured[i].pinned_brand_names || []).filter(n => n !== name);
                                                            handleUpdateFeatured(i, { pinned_brand_names: next });
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 text-red-500 ml-1"
                                                    >
                                                        <Trash2 className="h-2.5 w-2.5" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-3 border-2 border-dashed rounded-lg text-center text-[10px] text-slate-400">
                                        Chưa chọn logo nào — sidebar sẽ ẩn
                                    </div>
                                )}
                            </div>

                            {/* 6. Sản phẩm ghim */}
                            <div className="space-y-2">
                                <Label className="flex items-center justify-between">
                                    Sản phẩm ghim (Tối đa 8)
                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-orange-600" onClick={() => openProductPicker(i)}>
                                        <Plus className="h-3 w-3 mr-1" /> Thêm
                                    </Button>
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {featured[i]?.pinned_product_ids?.map(pid => {
                                        const p = allProducts.find(prod => prod.id === pid);
                                        return (
                                            <div key={pid} className="flex items-center gap-2 p-1 border rounded bg-slate-50 dark:bg-slate-900 group">
                                                <img src={p?.thumbnail || ""} className="w-8 h-8 object-contain bg-white rounded" />
                                                <span className="text-[10px] truncate flex-1">{p?.name}</span>
                                                <button
                                                    onClick={() => handleUpdateFeatured(i, { pinned_product_ids: featured[i].pinned_product_ids.filter(id => id !== pid) })}
                                                    className="opacity-0 group-hover:opacity-100 text-red-500"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {(!featured[i]?.pinned_product_ids || featured[i]?.pinned_product_ids.length === 0) && (
                                        <div className="col-span-2 py-4 border-2 border-dashed rounded-lg text-center text-[10px] text-slate-400">
                                            Tự động lấy sản phẩm mới nhất
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 7. Banner URL */}
                            <div className="space-y-2">
                                <Label>URL Ảnh Banner <span className="text-[10px] text-slate-400 font-normal">(chỉ ảnh dọc)</span></Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="https://example.com/banner.jpg"
                                        value={featured[i]?.banner_url || ""}
                                        onChange={(e) => handleUpdateFeatured(i, { banner_url: e.target.value || null })}
                                        className="flex-1"
                                    />
                                    {/* Hidden file input */}
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="hidden"
                                        ref={(el) => { bannerInputRefs.current[i] = el; }}
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) await handleBannerUpload(file, i);
                                            e.target.value = "";
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="shrink-0 px-3"
                                        title="Tải ảnh từ máy (chỉ ảnh dọc)"
                                        onClick={() => bannerInputRefs.current[i]?.click()}
                                        disabled={uploadingBanner === i}
                                    >
                                        {uploadingBanner === i
                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                            : <Upload className="h-4 w-4" />
                                        }
                                    </Button>
                                </div>
                                {featured[i]?.banner_url && (
                                    <div className="mt-2 rounded-md overflow-hidden border border-slate-200 dark:border-white/5 flex justify-center bg-slate-50 dark:bg-slate-900">
                                        <img
                                            src={featured[i].banner_url!}
                                            alt="Preview banner"
                                            className="object-contain max-h-40"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* ── Product Picker Dialog ── */}
            <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Ghim sản phẩm lên trang chủ</DialogTitle>
                        <DialogDescription>Chọn những sản phẩm bạn muốn hiển thị ưu tiên trong phần này.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input placeholder="Tìm kiếm sản phẩm..." className="pl-10" value={searchProduct} onChange={e => setSearchProduct(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                            {filteredProducts.map(p => {
                                const isSelected = activeSlotIndex !== null && featured[activeSlotIndex].pinned_product_ids?.includes(p.id);
                                return (
                                    <div key={p.id} onClick={() => togglePinnedProduct(p.id)}
                                        className={cn("flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                                            isSelected ? "bg-orange-50 border-orange-500 shadow-sm" : "bg-white border-slate-200 hover:border-orange-200")}>
                                        <img src={p.thumbnail || ""} className="w-10 h-10 object-contain bg-slate-50 rounded" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-bold truncate">{p.name}</p>
                                            {isSelected && <Badge className="bg-orange-500 text-[8px] h-4 py-0">Đã chọn</Badge>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Brand Logo Picker Dialog ── */}
            <Dialog open={isBrandDialogOpen} onOpenChange={setIsBrandDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Chọn logo hãng hiển thị</DialogTitle>
                        <DialogDescription>Chọn các thương hiệu để hiển thị logo trong sidebar của section này.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {allBrands.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-6">Chưa có logo hãng nào. Hãy vào <strong>Thương hiệu</strong> để thêm logo.</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                                {allBrands.map(brand => {
                                    const isSelected = activeBrandSlotIndex !== null &&
                                        (featured[activeBrandSlotIndex].pinned_brand_names || []).includes(brand.brand_name);
                                    return (
                                        <div key={brand.id} onClick={() => togglePinnedBrand(brand.brand_name)}
                                            className={cn("flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                                                isSelected ? "bg-orange-50 border-orange-500 shadow-sm" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-orange-200")}>
                                            <div className="w-12 h-8 bg-white rounded border flex items-center justify-center p-1 shrink-0">
                                                {brand.logo_url
                                                    ? <img src={brand.logo_url} alt={brand.brand_name} className="max-w-full max-h-full object-contain" />
                                                    : <span className="text-[9px] font-bold uppercase text-slate-500 text-center leading-tight">{brand.brand_name}</span>
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-bold uppercase truncate">{brand.brand_name}</p>
                                                {isSelected && <Badge className="bg-orange-500 text-[8px] h-4 py-0">Đã chọn</Badge>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
