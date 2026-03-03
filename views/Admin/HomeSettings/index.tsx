"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
    Home, Save, Loader2, Zap, Thermometer, Gauge, Wind,
    Settings, Plus, Trash2, LayoutGrid, Search, Tag, ImageIcon, Upload,
    Link2, GripVertical, X, ExternalLink, Image as ImgIcon, ChevronUp, ChevronDown
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

// =============================================================================
// BANNER MANAGER
// =============================================================================
interface HomeBanner {
    id?: string;
    image_url: string;
    link_url: string;
    alt_text: string;
    order_index: number;
    is_active: boolean;
}

function BannerManager({ supabase, toast }: { supabase: any; toast: any }) {
    const [banners, setBanners] = useState<HomeBanner[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null); // id or 'new'
    const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
    const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

    // Edit dialog
    const [editBanner, setEditBanner] = useState<(HomeBanner & { _idx: number }) | null>(null);
    const [editForm, setEditForm] = useState({ image_url: "", link_url: "", alt_text: "" });
    const [uploadingEdit, setUploadingEdit] = useState(false);
    const editFileRef = useRef<HTMLInputElement | null>(null);

    const fetchBanners = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("home_banners")
            .select("*")
            .order("order_index");
        if (!error && data) setBanners(data);
        setLoading(false);
    }, [supabase]);

    useEffect(() => { fetchBanners(); }, [fetchBanners]);

    const handleUploadImage = async (file: File, onSuccess: (url: string) => void, setUploading: (v: boolean) => void) => {
        setUploading(true);
        try {
            const compressed = await imageCompression(file, {
                maxSizeMB: 1.5,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                fileType: "image/webp",
                initialQuality: 0.85,
            });
            const fileName = `hero-banners/banner-${Date.now()}.webp`;
            const { error } = await supabase.storage
                .from("products")
                .upload(fileName, compressed, { contentType: "image/webp", upsert: true });
            if (error) throw error;
            const url = supabase.storage.from("products").getPublicUrl(fileName).data.publicUrl;
            onSuccess(url);
            toast({ title: "✅ Tải ảnh thành công", className: "bg-green-600 text-white" });
        } catch (err: any) {
            toast({ title: "Lỗi upload", description: err.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const openEdit = (banner: HomeBanner, idx: number) => {
        setEditBanner({ ...banner, _idx: idx });
        setEditForm({ image_url: banner.image_url, link_url: banner.link_url, alt_text: banner.alt_text });
    };

    const openAdd = () => {
        setEditBanner({ id: undefined, image_url: "", link_url: "", alt_text: "", order_index: banners.length, is_active: true, _idx: -1 });
        setEditForm({ image_url: "", link_url: "", alt_text: "" });
    };

    const handleSaveBanner = async () => {
        if (!editForm.image_url.trim()) {
            toast({ title: "Vui lòng chọn ảnh banner", variant: "destructive" }); return;
        }
        setSaving(editBanner?.id || "new");
        try {
            if (editBanner?.id) {
                // Update
                const { error } = await supabase.from("home_banners").update({
                    image_url: editForm.image_url,
                    link_url: editForm.link_url,
                    alt_text: editForm.alt_text,
                    updated_at: new Date().toISOString(),
                }).eq("id", editBanner.id);
                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase.from("home_banners").insert({
                    image_url: editForm.image_url,
                    link_url: editForm.link_url,
                    alt_text: editForm.alt_text,
                    order_index: banners.length,
                    is_active: true,
                });
                if (error) throw error;
            }
            toast({ title: "Đã lưu banner!", className: "bg-green-600 text-white" });
            setEditBanner(null);
            await fetchBanners();
        } catch (err: any) {
            toast({ title: "Lỗi lưu banner", description: err.message, variant: "destructive" });
        } finally {
            setSaving(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Xóa banner này?")) return;
        const { error } = await supabase.from("home_banners").delete().eq("id", id);
        if (error) toast({ title: "Lỗi xóa", description: error.message, variant: "destructive" });
        else toast({ title: "Đã xóa banner", className: "bg-green-600 text-white" });
        await fetchBanners();
    };

    const handleToggleActive = async (banner: HomeBanner) => {
        await supabase.from("home_banners").update({ is_active: !banner.is_active }).eq("id", banner.id);
        await fetchBanners();
    };

    const handleReorder = async (idx: number, dir: "up" | "down") => {
        const next = [...banners];
        const swap = dir === "up" ? idx - 1 : idx + 1;
        if (swap < 0 || swap >= next.length) return;
        [next[idx], next[swap]] = [next[swap], next[idx]];
        const updated = next.map((b, i) => ({ ...b, order_index: i }));
        setBanners(updated);
        // Save new orders
        await Promise.all(updated.map(b =>
            supabase.from("home_banners").update({ order_index: b.order_index }).eq("id", b.id)
        ));
    };

    return (
        <div className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <ImgIcon className="h-5 w-5 text-orange-500" />
                        Banner Trang Chủ
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Ảnh banner hiển thị trong hero carousel — mỗi banner có thể gắn link click vào</p>
                </div>
                <Button
                    onClick={openAdd}
                    className="bg-orange-600 hover:bg-orange-700 text-white gap-2 shadow-md shadow-orange-200 dark:shadow-none"
                    size="sm"
                >
                    <Plus className="h-4 w-4" /> Thêm banner
                </Button>
            </div>

            {/* Banner List */}
            {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin h-6 w-6 text-orange-500" /></div>
            ) : banners.length === 0 ? (
                <div
                    onClick={openAdd}
                    className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl py-14 flex flex-col items-center gap-3 text-slate-400 cursor-pointer hover:border-orange-300 dark:hover:border-orange-500/50 hover:text-orange-500 transition-all"
                >
                    <ImgIcon className="h-10 w-10 opacity-40" />
                    <p className="font-medium text-sm">Chưa có banner nào — nhấn để thêm</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {banners.map((banner, idx) => (
                        <div
                            key={banner.id}
                            className={cn(
                                "flex items-center gap-4 p-3 rounded-2xl border transition-all",
                                banner.is_active
                                    ? "bg-white dark:bg-[#1e2330] border-slate-200 dark:border-white/5 shadow-sm"
                                    : "bg-slate-50 dark:bg-[#14161f] border-slate-100 dark:border-white/5 opacity-60"
                            )}
                        >
                            {/* Order Controls */}
                            <div className="flex flex-col gap-0.5 flex-shrink-0">
                                <button
                                    onClick={() => handleReorder(idx, "up")}
                                    disabled={idx === 0}
                                    className="p-1 rounded text-slate-300 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-20 transition-colors"
                                ><ChevronUp className="h-3.5 w-3.5" /></button>
                                <span className="text-[10px] text-slate-400 text-center font-bold">{idx + 1}</span>
                                <button
                                    onClick={() => handleReorder(idx, "down")}
                                    disabled={idx === banners.length - 1}
                                    className="p-1 rounded text-slate-300 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-20 transition-colors"
                                ><ChevronDown className="h-3.5 w-3.5" /></button>
                            </div>

                            {/* Thumbnail */}
                            <div className="w-32 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200 dark:border-white/5">
                                {banner.image_url ? (
                                    <img src={banner.image_url} alt={banner.alt_text || "Banner"} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <ImgIcon className="h-6 w-6" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                                    {banner.alt_text || `Banner ${idx + 1}`}
                                </p>
                                {banner.link_url ? (
                                    <a
                                        href={banner.link_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-orange-500 hover:underline truncate max-w-xs"
                                    >
                                        <Link2 className="h-3 w-3" />
                                        {banner.link_url}
                                        <ExternalLink className="h-2.5 w-2.5" />
                                    </a>
                                ) : (
                                    <span className="text-xs text-slate-400 italic">Không có link</span>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {/* Active toggle */}
                                <button
                                    onClick={() => handleToggleActive(banner)}
                                    className={cn(
                                        "text-xs font-medium px-3 py-1.5 rounded-full border transition-all",
                                        banner.is_active
                                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                                    )}
                                >
                                    {banner.is_active ? "Hiện" : "Ẩn"}
                                </button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 text-xs"
                                    onClick={() => openEdit(banner, idx)}
                                >
                                    Sửa
                                </Button>
                                <button
                                    onClick={() => banner.id && handleDelete(banner.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit/Add Dialog */}
            <Dialog open={!!editBanner} onOpenChange={(open) => { if (!open) setEditBanner(null); }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ImgIcon className="h-5 w-5 text-orange-500" />
                            {editBanner?.id ? "Chỉnh sửa banner" : "Thêm banner mới"}
                        </DialogTitle>
                        <DialogDescription>
                            Banner là ảnh hiển thị full-width trong hero carousel trang chủ, có thể gắn link click vào.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-2">
                        {/* Image Upload / URL */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-1.5 font-semibold">
                                <ImgIcon className="h-3.5 w-3.5 text-orange-500" /> Ảnh Banner
                                <span className="text-[10px] text-slate-400 font-normal">(khuyến nghị 1920×600px, landscape)</span>
                            </Label>

                            {/* Preview */}
                            {editForm.image_url && (
                                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-800 h-40">
                                    <img src={editForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setEditForm(f => ({ ...f, image_url: "" }))}
                                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Input
                                    placeholder="https://example.com/banner.jpg"
                                    value={editForm.image_url}
                                    onChange={e => setEditForm(f => ({ ...f, image_url: e.target.value }))}
                                    className="flex-1"
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={editFileRef}
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            await handleUploadImage(
                                                file,
                                                (url) => setEditForm(f => ({ ...f, image_url: url })),
                                                setUploadingEdit
                                            );
                                        }
                                        e.target.value = "";
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0 gap-1.5"
                                    onClick={() => editFileRef.current?.click()}
                                    disabled={uploadingEdit}
                                >
                                    {uploadingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                    Upload
                                </Button>
                            </div>
                        </div>

                        {/* Link URL */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-1.5 font-semibold">
                                <Link2 className="h-3.5 w-3.5 text-blue-500" /> Link khi click
                                <span className="text-[10px] text-slate-400 font-normal">(tuỳ chọn)</span>
                            </Label>
                            <Input
                                placeholder="/products?category=... hoặc https://..."
                                value={editForm.link_url}
                                onChange={e => setEditForm(f => ({ ...f, link_url: e.target.value }))}
                            />
                            <p className="text-[11px] text-slate-400">Để trống nếu banner chỉ là hình ảnh, không điều hướng.</p>
                        </div>

                        {/* Alt text */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-1.5 font-semibold">
                                <Tag className="h-3.5 w-3.5 text-purple-500" /> Tên / Mô tả banner
                            </Label>
                            <Input
                                placeholder="Ưu đãi tháng 3, Flash sale..."
                                value={editForm.alt_text}
                                onChange={e => setEditForm(f => ({ ...f, alt_text: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-white/5">
                        <Button variant="outline" onClick={() => setEditBanner(null)}>Huỷ</Button>
                        <Button
                            onClick={handleSaveBanner}
                            disabled={!!saving || !editForm.image_url}
                            className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Lưu banner
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

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
    category_id: string | null;
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
    category_id: null, order_index: i,
    accent_color: ["bg-red-600", "bg-blue-600", "bg-orange-500"][i],
    icon_name: ["Gauge", "Wind", "Thermometer"][i],
    pinned_product_ids: [], banner_url: null, section_title: null, pinned_brand_names: [],
});

export default function HomeSettingsPage() {
    const supabase = useMemo(() => createClient(), []);
    const { toast } = useToast();
    const toastRef = useRef(toast);
    useEffect(() => { toastRef.current = toast; }, [toast]);

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
    const [bannerUrlError, setBannerUrlError] = useState<Record<number, string | null>>({});

    const checkImagePortrait = (src: string): Promise<boolean | null> =>
        new Promise((resolve) => {
            const img = new window.Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img.naturalHeight > img.naturalWidth);
            img.onerror = () => resolve(null);
            img.src = src;
        });

    const validateBannerUrl = async (url: string, index: number) => {
        if (!url.trim()) { setBannerUrlError(prev => ({ ...prev, [index]: null })); return; }
        const result = await checkImagePortrait(url);
        if (result === null) {
            // CORS / broken URL — warn but don't block
            setBannerUrlError(prev => ({ ...prev, [index]: "Không thể kiểm tra ảnh (CORS hoặc URL lỗi). Đảm bảo ảnh là dọc trước khi lưu." }));
        } else if (!result) {
            handleUpdateFeatured(index, { banner_url: null });
            setBannerUrlError(prev => ({ ...prev, [index]: "❌ Ảnh ngang không hợp lệ. Vui lòng chọn ảnh dọc (chiều cao > chiều rộng)." }));
            toast({ title: "❌ Ảnh không hợp lệ", description: "Banner phải là ảnh dọc (chiều cao > chiều rộng).", variant: "destructive" });
        } else {
            setBannerUrlError(prev => ({ ...prev, [index]: null }));
        }
    };


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
                const loaded = [0, 1, 2].map(i => {
                    const found = settingsRes.data.find((d: any) => d.order_index === i);
                    if (found) {
                        return { ...found, pinned_brand_names: found.pinned_brand_names || [] };
                    }
                    return defaultFeatured(i);
                });
                setFeatured(loaded);
            }
        } catch (err: any) {
            toastRef.current({ title: "Lỗi tải dữ liệu", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [supabase]);

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
            let idx = 0;
            for (const item of featured) {
                const payload = {
                    ...item,
                    category_id: item.category_id || null,
                    order_index: typeof item.order_index === "number" ? item.order_index : idx,
                    updated_at: new Date().toISOString()
                };
                const { error } = await supabase.from("home_featured_categories").upsert(
                    payload,
                    { onConflict: "order_index" }
                );
                if (error) throw error;
                idx++;
            }
            toast({ title: "Đã lưu cài đặt!", className: "bg-green-600 text-white" });
        } catch (err: any) {
            console.error("Save Error:", err);
            toast({ title: "Lỗi lưu cài đặt", description: err.message || "Lỗi không xác định.", variant: "destructive" });
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
        <div className="space-y-10">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Home className="h-6 w-6 text-orange-500" /> Cài đặt Trang chủ
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Quản lý banner hero và các mục danh mục nổi bật</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-200 dark:shadow-none">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Lưu cấu hình danh mục
                </Button>
            </div>

            {/* ── BANNER MANAGER ── */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#1e2330] p-6 shadow-sm space-y-4">
                <BannerManager supabase={supabase} toast={toast} />
            </div>

            {/* ── Divider ── */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/5" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Danh mục nổi bật trang chủ</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/5" />
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

                            {/* 1.5 Danh mục liên kết */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1.5"><LayoutGrid className="h-3.5 w-3.5 text-blue-500" /> Danh mục liên kết</Label>
                                <select
                                    value={featured[i]?.category_id || ""}
                                    onChange={(e) => handleUpdateFeatured(i, { category_id: e.target.value })}
                                    className="w-full h-10 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">— Chọn danh mục —</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{cat.name}</option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-slate-400 italic">Sản phẩm trong danh mục này sẽ hiển thị ở tab "Tất cả".</p>
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
                                        onChange={(e) => {
                                            handleUpdateFeatured(i, { banner_url: e.target.value || null });
                                            if (!e.target.value) setBannerUrlError(prev => ({ ...prev, [i]: null }));
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value) validateBannerUrl(e.target.value, i);
                                        }}
                                        className={`flex-1 ${bannerUrlError[i] ? "border-red-400 focus-visible:ring-red-300" : ""}`}
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
                                {bannerUrlError[i] && (
                                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                                        {bannerUrlError[i]}
                                    </p>
                                )}
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
