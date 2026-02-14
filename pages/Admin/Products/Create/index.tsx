"use client";

import React, { useEffect, useMemo, useState, useRef, ChangeEvent } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Save, X, Plus, Package, Image as ImageIcon, Layers, UploadCloud, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InputField } from "@/components/forms/InputField";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import * as z from "zod";
import imageCompression from "browser-image-compression";

const productSchema = z.object({
    name: z.string().min(5, "Tên sản phẩm ít nhất 5 ký tự").max(255),
    description: z.string().max(5000).optional(),
    brand: z.string().min(1, "Vui lòng nhập thương hiệu"),
    origin: z.string().min(1, "Vui lòng nhập xuất xứ"),
    warranty_months: z.coerce.number().min(0, "Không được âm").default(12),
    category_id: z.string().optional().nullable(),
    thumbnail: z.string().min(1, "Ảnh bìa là bắt buộc"),
    images: z.array(z.string()).default([]),
    attrGroups: z.array(z.object({
        name: z.string().min(1, "Tên nhóm không được để trống"),
        values: z.array(z.string()).min(1, "Cần ít nhất 1 giá trị")
    })).default([]),
    variants: z.array(z.object({
        attributes: z.record(z.string(), z.string()),
        price: z.coerce.number().min(0, "Giá không được âm"),
        stock: z.coerce.number().min(0, "Kho không được âm"),
        sku: z.string().optional()
    })).default([])
}) as any;

type ProductFormValues = z.infer<typeof productSchema>;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_GALLERY_FILES = 5;

const sanitizeFileName = (str: string) => {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9.-]/g, '')
        .toLowerCase();
};

interface CategoryOption {
    id: string;
    name: string;
    parent_id: string | null;
}

export default function ProductForm({ initialData }: { initialData?: any }) {
    const supabase = createClient();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Edit mode detection
    const editId = searchParams?.get("edit");
    const isEditMode = Boolean(editId);
    const [isLoadingProduct, setIsLoadingProduct] = useState(isEditMode);

    // Categories
    const [categories, setCategories] = useState<CategoryOption[]>([]);

    // Upload states
    const [isUploadingThumb, setIsUploadingThumb] = useState(false);
    const [galleryFiles, setGalleryFiles] = useState<string[]>(initialData?.images || []);
    const [isUploadingGallery, setIsUploadingGallery] = useState(false);
    const thumbInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const [deletedCombos, setDeletedCombos] = useState<string[]>([]);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            brand: "NoBrand",
            origin: "Việt Nam",
            warranty_months: 12,
            category_id: null,
            thumbnail: "",
            images: [],
            attrGroups: [{ name: "Màu sắc", values: [] }],
            variants: []
        },
    });

    const { fields: attrFields, append: addGroup, remove: removeGroup } = useFieldArray({
        control: form.control,
        name: "attrGroups"
    });

    const watchedGroups = form.watch("attrGroups");

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase
                .from("categories")
                .select("id, name, parent_id")
                .order("name");
            setCategories(data || []);
        };
        fetchCategories();
    }, [supabase]);

    // Load product data when in edit mode
    useEffect(() => {
        if (!isEditMode || !editId) {
            // Reset to create mode - clear form
            setIsLoadingProduct(false);
            form.reset({
                name: "",
                brand: "NoBrand",
                origin: "Việt Nam",
                warranty_months: 12,
                category_id: null,
                description: "",
                thumbnail: "",
                images: [],
                attrGroups: [{ name: "Màu sắc", values: [] }],
                variants: []
            });
            return;
        }

        async function loadProduct() {
            setIsLoadingProduct(true);

            // Fetch product
            const { data: product, error: productError } = await supabase
                .from("products")
                .select("*")
                .eq("id", editId)
                .single();

            if (productError || !product) {
                toast({ title: "Lỗi", description: "Không tìm thấy sản phẩm", variant: "destructive" });
                window.location.href = "/admin/products/list";
                return;
            }

            // Fetch variants
            const { data: variants } = await supabase
                .from("product_variants")
                .select("*")
                .eq("product_id", editId)
                .order("created_at");

            // Build attrGroups from variants
            const attrGroups: Record<string, Set<string>> = {};
            (variants || []).forEach((v: any) => {
                Object.entries(v.attributes || {}).forEach(([key, value]) => {
                    if (!attrGroups[key]) attrGroups[key] = new Set();
                    attrGroups[key].add(value as string);
                });
            });

            const attrGroupsArray = Object.entries(attrGroups).map(([name, values]) => ({
                name,
                values: Array.from(values)
            }));

            // Map variants to form format
            const variantsArray = (variants || []).map((v: any) => ({
                attributes: v.attributes,
                price: v.price,
                stock: v.stock,
                sku: v.sku || ""
            }));

            // Reset form with loaded data
            form.reset({
                name: product.name,
                brand: product.brand || "NoBrand",
                origin: product.origin || "Việt Nam",
                warranty_months: product.warranty_months ?? 12,
                category_id: product.category_id || null,
                description: product.description || "",
                thumbnail: product.thumbnail || "",
                images: product.images || [],
                attrGroups: attrGroupsArray.length > 0 ? attrGroupsArray : [{ name: "Màu sắc", values: [] }],
                variants: variantsArray
            });

            setIsLoadingProduct(false);
        }

        loadProduct();
    }, [editId, isEditMode, supabase, toast, form]);

    // Logic sinh biến thể (Optimized để giữ lại data cũ)
    useEffect(() => {
        // Skip if loading product in edit mode
        if (isLoadingProduct) return;

        const validGroups = watchedGroups.filter((g: { name: string; values: string[] }) => g.name && g.values?.length > 0);
        if (validGroups.length === 0) {
            form.setValue("variants", []);
            return;
        }

        const cartesian = (acc: any[], curr: any) => {
            return curr.values.flatMap((value: string) =>
                acc.map(item => ({ ...item, [curr.name]: value }))
            );
        };

        const combinations = validGroups.reduce(cartesian, [{}]);
        const currentVariants = form.getValues("variants");

        const newVariants = combinations
            .filter((combo: any) => !deletedCombos.includes(JSON.stringify(combo)))
            .map((combo: any) => {
                // Tìm xem biến thể này đã tồn tại chưa để giữ lại Price/Stock/SKU
                const existing = currentVariants.find((v: { attributes: Record<string, string> }) =>
                    JSON.stringify(v.attributes) === JSON.stringify(combo)
                );

                return existing || {
                    attributes: combo,
                    price: 0,
                    stock: 0,
                    sku: ""
                };
            });

        form.setValue("variants", newVariants);
    }, [JSON.stringify(watchedGroups), deletedCombos, isLoadingProduct]);

    const onSubmit = async (values: ProductFormValues) => {
        try {
            if (isEditMode && editId) {
                // === UPDATE MODE ===

                // 1. Update product
                const { error: productError } = await supabase
                    .from("products")
                    .update({
                        name: values.name,
                        description: values.description || null,
                        brand: values.brand,
                        origin: values.origin,
                        warranty_months: values.warranty_months ?? 12,
                        category_id: values.category_id || null,
                        thumbnail: values.thumbnail,
                        images: values.images || [],
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", editId);

                if (productError) throw productError;

                // 2. Fetch existing variants for this product
                const { data: existingVariants } = await supabase
                    .from("product_variants")
                    .select("id, attributes")
                    .eq("product_id", editId);

                const existingList = existingVariants || [];
                const newVariants = values.variants || [];

                // 3. Match new variants to existing ones by attributes
                const matchedExistingIds = new Set<string>();
                const toUpdate: { id: string; data: any }[] = [];
                const toInsert: any[] = [];

                for (const v of newVariants) {
                    const match = existingList.find(
                        (ev: any) =>
                            !matchedExistingIds.has(ev.id) &&
                            JSON.stringify(ev.attributes) === JSON.stringify(v.attributes)
                    );

                    if (match) {
                        matchedExistingIds.add(match.id);
                        toUpdate.push({
                            id: match.id,
                            data: {
                                sku: v.sku || null,
                                price: Number(v.price) || 0,
                                stock: Number(v.stock) || 0,
                                attributes: v.attributes,
                            },
                        });
                    } else {
                        toInsert.push({
                            product_id: editId,
                            sku: v.sku || null,
                            price: Number(v.price) || 0,
                            stock: Number(v.stock) || 0,
                            attributes: v.attributes,
                        });
                    }
                }

                // 4. Update existing variants
                for (const item of toUpdate) {
                    const { error: updateError } = await supabase
                        .from("product_variants")
                        .update(item.data)
                        .eq("id", item.id);
                    if (updateError) throw updateError;
                }

                // 5. Insert new variants
                if (toInsert.length > 0) {
                    const { error: insertError } = await supabase
                        .from("product_variants")
                        .insert(toInsert);
                    if (insertError) throw insertError;
                }

                // 6. Delete variants that are no longer needed (only if not referenced by order_items)
                const unmatchedIds = existingList
                    .filter((ev: any) => !matchedExistingIds.has(ev.id))
                    .map((ev: any) => ev.id);

                if (unmatchedIds.length > 0) {
                    // Check which ones are referenced by order_items
                    const { data: referencedItems } = await supabase
                        .from("order_items")
                        .select("variant_id")
                        .in("variant_id", unmatchedIds);

                    const referencedIds = new Set((referencedItems || []).map((r: any) => r.variant_id));
                    const safeToDelete = unmatchedIds.filter((id: string) => !referencedIds.has(id));
                    const keptVariantIds = unmatchedIds.filter((id: string) => referencedIds.has(id));

                    if (safeToDelete.length > 0) {
                        const { error: deleteError } = await supabase
                            .from("product_variants")
                            .delete()
                            .in("id", safeToDelete);
                        if (deleteError) throw deleteError;
                    }

                    // Notify user about variants that couldn't be removed
                    if (keptVariantIds.length > 0) {
                        // Get the attributes of kept variants for display
                        const keptVariants = existingList.filter((ev: any) => keptVariantIds.includes(ev.id));
                        const keptNames = keptVariants
                            .map((v: any) => Object.values(v.attributes || {}).join(" / "))
                            .join(", ");

                        toast({
                            title: `⚠️ ${keptVariantIds.length} biến thể không thể xóa`,
                            description: `Các biến thể "${keptNames}" đang được liên kết với đơn hàng nên không thể xóa. Chúng sẽ được giữ lại trong hệ thống.`,
                            variant: "destructive",
                            duration: 8000,
                        });
                    }
                }

                toast({ title: "Đã cập nhật!", description: "Sản phẩm đã được cập nhật thành công.", className: "bg-green-600 text-white" });
                window.location.href = `/products/${editId}`;
            } else {
                // === CREATE MODE ===

                // 1. Insert product
                const { data: product, error: productError } = await supabase
                    .from("products")
                    .insert({
                        name: values.name,
                        description: values.description || null,
                        brand: values.brand,
                        origin: values.origin,
                        warranty_months: values.warranty_months ?? 12,
                        category_id: values.category_id || null,
                        thumbnail: values.thumbnail,
                        images: values.images || [],
                    })
                    .select("id")
                    .single();

                if (productError) throw productError;

                // 2. Insert variants
                if (values.variants && values.variants.length > 0) {
                    const variantRows = values.variants.map((v: any) => ({
                        product_id: product.id,
                        sku: v.sku || null,
                        price: Number(v.price) || 0,
                        stock: Number(v.stock) || 0,
                        attributes: v.attributes,
                    }));

                    const { error: variantError } = await supabase
                        .from("product_variants")
                        .insert(variantRows);

                    if (variantError) throw variantError;
                }

                toast({ title: "Thành công!", description: "Sản phẩm đã được tạo", className: "bg-green-600 text-white" });
                window.location.href = `/products/${product.id}`;
            }
        } catch (error: any) {
            console.error(error);
            toast({
                title: isEditMode ? "Lỗi cập nhật sản phẩm" : "Lỗi tạo sản phẩm",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    // --- UPLOAD HELPERS ---
    const compressImage = async (file: File): Promise<File> => {
        const options = {
            maxSizeMB: 0.05, // 100KB max
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: "image/webp" as const,
            initialQuality: 0.7,
        };

        try {
            const compressed = await imageCompression(file, options);
            const sizeMB = compressed.size / 1024;
            console.log(`Ảnh nén: ${(file.size / 1024).toFixed(0)}KB → ${sizeMB.toFixed(0)}KB`);
            return compressed;
        } catch (err) {
            console.warn("Không thể nén ảnh, sử dụng ảnh gốc:", err);
            return file;
        }
    };

    const uploadFileToSupabase = async (file: File): Promise<string | null> => {
        // Compress image before uploading
        const compressed = await compressImage(file);
        const fileName = `${Date.now()}-${sanitizeFileName(file.name.split('.')[0])}.webp`;
        const { error } = await supabase.storage.from('products').upload(fileName, compressed, {
            contentType: 'image/webp',
        });
        if (error) {
            toast({ title: "Upload lỗi", description: error.message, variant: "destructive" });
            return null;
        }
        return supabase.storage.from('products').getPublicUrl(fileName).data.publicUrl;
    };

    const handleThumbnailUpload = async (file: File) => {
        if (file.size > MAX_FILE_SIZE) {
            toast({ title: "File quá lớn", description: "Tối đa 5MB", variant: "destructive" });
            return;
        }
        setIsUploadingThumb(true);
        const url = await uploadFileToSupabase(file);
        if (url) {
            form.setValue("thumbnail", url, { shouldValidate: true });
        }
        setIsUploadingThumb(false);
    };

    const handleGalleryUpload = async (files: FileList) => {
        const currentImages = form.getValues("images") || [];
        const remaining = MAX_GALLERY_FILES - currentImages.length;
        if (remaining <= 0) {
            toast({ title: "Quá tải", description: `Tối đa ${MAX_GALLERY_FILES} ảnh`, variant: "destructive" });
            return;
        }
        const selected = Array.from(files).slice(0, remaining);
        setIsUploadingGallery(true);
        const urls: string[] = [];
        for (const file of selected) {
            if (file.size > MAX_FILE_SIZE) {
                toast({ title: "File quá lớn", description: `${file.name} vượt quá 5MB`, variant: "destructive" });
                continue;
            }
            const url = await uploadFileToSupabase(file);
            if (url) urls.push(url);
        }
        if (urls.length > 0) {
            form.setValue("images", [...currentImages, ...urls]);
        }
        setIsUploadingGallery(false);
    };

    const removeGalleryImage = (index: number) => {
        const current = form.getValues("images") || [];
        form.setValue("images", current.filter((_: string, i: number) => i !== index));
    };

    // Loading state for edit mode
    if (isLoadingProduct) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                    <p className="text-sm text-slate-500">Đang tải dữ liệu sản phẩm...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24">
            <div className="max-w-7xl mx-auto p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* CỘT TRÁI: THÔNG TIN CHÍNH */}
                        <div className="lg:col-span-8 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-primary" /> Thông tin cơ bản
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <InputField control={form.control} name="name" label="Tên sản phẩm" placeholder="Ví dụ: Áo thun nam co giãn..." />

                                    <div className="grid grid-cols-3 gap-4">
                                        <InputField control={form.control} name="brand" label="Thương hiệu" />
                                        <InputField control={form.control} name="origin" label="Xuất xứ" />
                                        <FormField
                                            control={form.control}
                                            name="warranty_months"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Bảo hành (tháng)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min={0} placeholder="12" {...field} className="h-10" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Category Selector */}
                                    <FormField
                                        control={form.control}
                                        name="category_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Danh mục</FormLabel>
                                                <FormControl>
                                                    <select
                                                        value={field.value || ""}
                                                        onChange={e => field.onChange(e.target.value || null)}
                                                        className="w-full h-10 px-3 rounded-md border bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
                                                    >
                                                        <option value="">— Chưa phân loại</option>
                                                        {categories.filter(c => !c.parent_id).map(parent => (
                                                            <React.Fragment key={parent.id}>
                                                                <option value={parent.id}>{parent.name}</option>
                                                                {categories.filter(c => c.parent_id === parent.id).map(child => (
                                                                    <option key={child.id} value={child.id}>&nbsp;&nbsp;↳ {child.name}</option>
                                                                ))}
                                                            </React.Fragment>
                                                        ))}
                                                    </select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Mô tả sản phẩm</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} rows={6} placeholder="Nhập mô tả chi tiết sản phẩm..." />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* PHẦN BIẾN THỂ */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Layers className="h-5 w-5 text-primary" /> Phân loại sản phẩm
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {attrFields.map((field, index) => (
                                        <div key={field.id} className="p-4 border rounded-lg bg-slate-50 relative group">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => removeGroup(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <InputField control={form.control} name={`attrGroups.${index}.name`} label="Tên nhóm" placeholder="Màu sắc..." />
                                                <div className="md:col-span-2 space-y-2">
                                                    <FormLabel>Giá trị phân loại</FormLabel>
                                                    <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-white min-h-[42px]">
                                                        {form.watch(`attrGroups.${index}.values`).map((val: string, vIdx: number) => (
                                                            <span key={vIdx} className="bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded text-sm flex items-center gap-1">
                                                                {val}
                                                                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => {
                                                                    const current = form.getValues(`attrGroups.${index}.values`);
                                                                    form.setValue(`attrGroups.${index}.values`, current.filter((_: string, i: number) => i !== vIdx));
                                                                }} />
                                                            </span>
                                                        ))}
                                                        <input
                                                            className="flex-1 outline-none text-sm min-w-[120px]"
                                                            placeholder="Nhấn Enter để thêm..."
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    e.preventDefault();
                                                                    const val = e.currentTarget.value.trim();
                                                                    if (val) {
                                                                        const current = form.getValues(`attrGroups.${index}.values`);
                                                                        if (!current.includes(val)) {
                                                                            form.setValue(`attrGroups.${index}.values`, [...current, val]);
                                                                        }
                                                                        e.currentTarget.value = "";
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {attrFields.length < 2 && (
                                        <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => addGroup({ name: "", values: [] })}>
                                            <Plus className="h-4 w-4 mr-2" /> Thêm nhóm thuộc tính (Ví dụ: Size, Chất liệu)
                                        </Button>
                                    )}

                                    {/* BẢNG BIẾN THỂ */}
                                    {form.watch("variants").length > 0 && (
                                        <div className="mt-4 overflow-x-auto border rounded-lg">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-slate-50 border-b">
                                                    <tr>
                                                        <th className="p-3 font-semibold">Biến thể</th>
                                                        <th className="p-3 font-semibold w-32">Giá bán</th>
                                                        <th className="p-3 font-semibold w-28">Kho hàng</th>
                                                        <th className="p-3 font-semibold">Mã SKU</th>
                                                        <th className="p-3 font-semibold w-12 text-center">Xóa</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {form.watch("variants").map((variant: { attributes: Record<string, string>; price: number; stock: number; sku?: string }, vIdx: number) => (
                                                        <tr key={vIdx} className="border-b last:border-0 hover:bg-slate-50/50">
                                                            <td className="p-3 font-medium text-slate-700">
                                                                {Object.values(variant.attributes).join(" / ")}
                                                            </td>
                                                            <td className="p-3">
                                                                <Input type="number" {...form.register(`variants.${vIdx}.price`)} className="h-9" />
                                                            </td>
                                                            <td className="p-3">
                                                                <Input type="number" {...form.register(`variants.${vIdx}.stock`)} className="h-9" />
                                                            </td>
                                                            <td className="p-3">
                                                                <Input {...form.register(`variants.${vIdx}.sku`)} placeholder="SKU..." className="h-9" />
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                    onClick={() => {
                                                                        const variant = form.getValues(`variants.${vIdx}`);
                                                                        setDeletedCombos(prev => [...prev, JSON.stringify(variant.attributes)]);
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* CỘT PHẢI: HÌNH ẢNH & MEDIA */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* THUMBNAIL */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <ImageIcon className="h-4 w-4" /> Ảnh bìa sản phẩm
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {form.watch("thumbnail") ? (
                                        <div className="relative rounded-lg overflow-hidden border group">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={form.watch("thumbnail")} alt="Thumbnail" className="w-full aspect-square object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => form.setValue("thumbnail", "")}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors relative"
                                            onClick={() => thumbInputRef.current?.click()}
                                        >
                                            <input
                                                ref={thumbInputRef}
                                                type="file"
                                                accept="image/png, image/jpeg, image/webp"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) handleThumbnailUpload(e.target.files[0]);
                                                    e.target.value = "";
                                                }}
                                            />
                                            {isUploadingThumb ? (
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            ) : (
                                                <>
                                                    <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                                                    <p className="text-sm font-medium text-slate-600">Bấm để tải ảnh bìa</p>
                                                    <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP. Tối đa 5MB</p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    {form.formState.errors.thumbnail && (
                                        <p className="text-[0.8rem] font-medium text-red-500 mt-2">
                                            {form.formState.errors.thumbnail.message as string}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* GALLERY */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <ImageIcon className="h-4 w-4" /> Album hình ảnh ({(form.watch("images") || []).length}/{MAX_GALLERY_FILES})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-3 gap-2">
                                        {(form.watch("images") || []).map((url: string, i: number) => (
                                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border group">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeGalleryImage(i)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {(form.watch("images") || []).length < MAX_GALLERY_FILES && (
                                        <div
                                            className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
                                            onClick={() => galleryInputRef.current?.click()}
                                        >
                                            <input
                                                ref={galleryInputRef}
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files.length > 0) handleGalleryUpload(e.target.files);
                                                    e.target.value = "";
                                                }}
                                            />
                                            {isUploadingGallery ? (
                                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            ) : (
                                                <>
                                                    <UploadCloud className="h-6 w-6 text-slate-400 mb-1" />
                                                    <p className="text-xs text-slate-500">Thêm ảnh chi tiết</p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* FIXED FOOTER */}
                        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t p-4 z-50 shadow-lg">
                            <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
                                <div className="hidden md:block text-sm text-muted-foreground">
                                    Đang chỉnh sửa: <span className="font-medium text-slate-900">{form.watch("name") || "Sản phẩm mới"}</span>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    <Button type="button" variant="outline" className="flex-1 md:flex-none" onClick={() => window.history.back()}>
                                        Hủy bỏ
                                    </Button>
                                    <Button type="submit" className="bg-[#020080] hover:bg-[#020080]/90 px-10 flex-1 md:flex-none" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                                        Lưu sản phẩm
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}