"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import imageCompression from "browser-image-compression";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ImageIcon, Save, RefreshCw, Plus, Upload, Loader2 } from "lucide-react";

interface BrandLogo {
    id?: string;
    brand_name: string;
    logo_url: string | null;
}

export default function BrandsManagementView() {
    const supabase = createClient();
    const { toast } = useToast();
    const [brands, setBrands] = useState<BrandLogo[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [uploading, setUploading] = useState<string | null>(null); // brand_name đang upload
    const [newBrandName, setNewBrandName] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    // Refs for hidden file inputs per brand row, keyed by brand_name
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const { data: productBrands } = await supabase
                .from("products").select("brand").not("brand", "is", null);

            const productUniqueNames = [
                ...new Set((productBrands || []).map((p) => p.brand)),
            ] as string[];

            const { data: existingLogos } = await supabase.from("brand_logos").select("*");

            const currentLogos: BrandLogo[] = (existingLogos || []).map((l) => ({
                id: l.id, brand_name: l.brand_name, logo_url: l.logo_url,
            }));

            productUniqueNames.forEach((name) => {
                if (!currentLogos.find((l) => l.brand_name.toLowerCase() === name.toLowerCase())) {
                    currentLogos.push({ brand_name: name, logo_url: null });
                }
            });

            setBrands(currentLogos.sort((a, b) => a.brand_name.localeCompare(b.brand_name)));
        } catch {
            toast({ title: "Thông báo", description: "Vui lòng chạy SQL setup để tạo bảng brand_logos.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBrands(); }, []);

    // ── Compress & Upload ──
    const compressAndUpload = async (file: File, brandName: string): Promise<string | null> => {
        try {
            const compressed = await imageCompression(file, {
                maxSizeMB: 0.15,          // 150KB — giữ chất lượng logo SVG/PNG
                maxWidthOrHeight: 400,    // Logo không cần lớn
                useWebWorker: true,
                fileType: "image/webp",
                initialQuality: 0.85,
            });

            const safeName = brandName.toLowerCase().replace(/[^a-z0-9]/g, "-");
            const fileName = `brand-logos/${safeName}-${Date.now()}.webp`;

            const { error } = await supabase.storage
                .from("products")
                .upload(fileName, compressed, { contentType: "image/webp", upsert: true });

            if (error) throw error;

            return supabase.storage.from("products").getPublicUrl(fileName).data.publicUrl;
        } catch (err: any) {
            toast({ title: "Upload lỗi", description: err.message, variant: "destructive" });
            return null;
        }
    };

    const handleFileUpload = async (file: File, brand: BrandLogo) => {
        setUploading(brand.brand_name);
        const url = await compressAndUpload(file, brand.brand_name);
        if (url) {
            // Cập nhật state local
            setBrands((prev) => prev.map((b) =>
                b.brand_name === brand.brand_name ? { ...b, logo_url: url } : b
            ));
            // Auto-save
            await handleSave({ ...brand, logo_url: url });
        }
        setUploading(null);
    };

    const handleAddManual = async () => {
        if (!newBrandName.trim()) return;
        const name = newBrandName.trim();
        if (brands.find((b) => b.brand_name.toLowerCase() === name.toLowerCase())) {
            toast({ title: "Lỗi", description: "Thương hiệu này đã tồn tại." });
            return;
        }
        setBrands((prev) => [...prev, { brand_name: name, logo_url: null }]
            .sort((a, b) => a.brand_name.localeCompare(b.brand_name)));
        setNewBrandName("");
        setIsAdding(false);
    };

    const updateLogoUrl = (name: string, url: string) => {
        setBrands((prev) => prev.map((b) => b.brand_name === name ? { ...b, logo_url: url } : b));
    };

    const handleSave = async (brand: BrandLogo) => {
        setSaving(brand.brand_name);
        try {
            if (brand.id) {
                const { error } = await supabase.from("brand_logos")
                    .update({ logo_url: brand.logo_url }).eq("id", brand.id);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from("brand_logos")
                    .upsert({ brand_name: brand.brand_name, logo_url: brand.logo_url }, { onConflict: "brand_name" })
                    .select().single();
                if (error) throw error;
                setBrands((prev) => prev.map((b) => b.brand_name === brand.brand_name ? { ...b, id: data.id } : b));
            }
            toast({ title: "Thành công", description: `Đã lưu logo cho ${brand.brand_name}`, className: "bg-green-600 text-white" });
        } catch {
            toast({ title: "Lỗi lưu dữ liệu", description: "Đảm bảo bạn đã chạy SQL tạo bảng brand_logos.", variant: "destructive" });
        } finally {
            setSaving(null);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold">Quản lý thương hiệu</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Gán logo cho các thương hiệu. Tự động nhận diện từ sản phẩm hoặc thêm mới thủ công.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {isAdding ? (
                            <div className="flex gap-2 animate-in slide-in-from-right-2">
                                <Input
                                    placeholder="Tên hãng mới..."
                                    className="w-48 h-9"
                                    value={newBrandName}
                                    onChange={(e) => setNewBrandName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddManual()}
                                    autoFocus
                                />
                                <Button size="sm" onClick={handleAddManual}>Thêm</Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Hủy</Button>
                            </div>
                        ) : (
                            <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
                                <Plus className="w-4 h-4 mr-2" /> Thêm nhanh hãng
                            </Button>
                        )}
                        <Button variant="outline" size="icon" onClick={fetchBrands} disabled={loading}>
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[180px]">Tên hãng</TableHead>
                                <TableHead className="w-[90px]">Xem trước</TableHead>
                                <TableHead>URL Logo (dán link hoặc tải ảnh lên)</TableHead>
                                <TableHead className="text-right w-[200px]">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10">Đang tải...</TableCell>
                                </TableRow>
                            ) : brands.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                        Chưa có thương hiệu nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                brands.map((brand) => (
                                    <TableRow key={brand.brand_name}>
                                        <TableCell className="font-bold uppercase tracking-tight">
                                            {brand.brand_name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="w-14 h-10 rounded border bg-white flex items-center justify-center overflow-hidden p-1">
                                                {brand.logo_url ? (
                                                    <img src={brand.logo_url} alt={brand.brand_name} className="max-w-full max-h-full object-contain" />
                                                ) : (
                                                    <ImageIcon className="w-5 h-5 text-slate-200" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                placeholder="https://example.com/logo.png"
                                                value={brand.logo_url || ""}
                                                onChange={(e) => updateLogoUrl(brand.brand_name, e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Hidden file input */}
                                                <input
                                                    type="file"
                                                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                                    className="hidden"
                                                    ref={(el) => { fileInputRefs.current[brand.brand_name] = el; }}
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) await handleFileUpload(file, brand);
                                                        e.target.value = "";
                                                    }}
                                                />
                                                {/* Upload button */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => fileInputRefs.current[brand.brand_name]?.click()}
                                                    disabled={uploading === brand.brand_name}
                                                    title="Tải ảnh từ máy tính (tự động nén)"
                                                >
                                                    {uploading === brand.brand_name
                                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                                        : <Upload className="w-4 h-4" />
                                                    }
                                                </Button>
                                                {/* Save button */}
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSave(brand)}
                                                    disabled={saving === brand.brand_name}
                                                >
                                                    {saving === brand.brand_name
                                                        ? <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                                        : <Save className="w-4 h-4 mr-2" />
                                                    }
                                                    Lưu
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
