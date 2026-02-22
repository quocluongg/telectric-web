"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Plus, Search, Tag, Calendar, Trash, ChevronRight, Check } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function CampaignDetailPage({ campaignId }: { campaignId: string }) {
    const id = campaignId;
    const supabase = createClient();
    const { toast } = useToast();

    const [campaign, setCampaign] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 3-step add flow
    const [step, setStep] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [productVariants, setProductVariants] = useState<any[]>([]);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [salePrice, setSalePrice] = useState("");
    const [addingItem, setAddingItem] = useState(false);

    useEffect(() => {
        if (id) {
            fetchCampaignDetails();
            fetchCampaignItems();
        }
    }, [id]);

    const fetchCampaignDetails = async () => {
        const { data } = await supabase.from("campaigns").select("*").eq("id", id).single();
        if (data) setCampaign(data);
    };

    const fetchCampaignItems = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("campaign_items")
            .select(`id, sale_price, stock_quantity, variant_id, products ( id, name, thumbnail ), product_variants ( id, sku, price, attributes, stock )`)
            .eq("campaign_id", id);
        if (data) setItems(data);
        setLoading(false);
    };

    const handleSearchProducts = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        const { data } = await supabase.from("products").select("id, name, thumbnail").ilike("name", `%${searchQuery}%`).limit(10);
        if (data) setSearchResults(data);
        setIsSearching(false);
    };

    const handleSelectProduct = async (prod: any) => {
        setSelectedProduct(prod);
        const { data } = await supabase.from("product_variants").select("id, sku, price, stock, attributes").eq("product_id", prod.id).order("created_at");
        setProductVariants(data || []);
        setStep(1);
    };

    const handleSelectVariant = (variant: any) => {
        setSelectedVariant(variant);
        setSalePrice(String(variant.price));
        setStep(2);
    };

    const handleAddItem = async () => {
        if (!selectedVariant || !salePrice) {
            toast({ title: "Lỗi", description: "Vui lòng chọn phân loại và nhập giá Sale.", variant: "destructive" });
            return;
        }
        setAddingItem(true);
        const { error } = await supabase.from("campaign_items").insert({
            campaign_id: id,
            product_id: selectedProduct.id,
            variant_id: selectedVariant.id,
            sale_price: parseFloat(salePrice.replace(/,/g, "")),
            stock_quantity: selectedVariant.stock || 100,
        });
        setAddingItem(false);
        if (error) {
            toast({ title: "Thất bại", description: "Phân loại này có thể đã tồn tại trong chiến dịch.", variant: "destructive" });
        } else {
            toast({ title: "Thành công", description: "Đã thêm vào Siêu Sale!" });
            resetForm();
            fetchCampaignItems();
        }
    };

    const resetForm = () => {
        setStep(0);
        setSearchQuery("");
        setSearchResults([]);
        setSelectedProduct(null);
        setProductVariants([]);
        setSelectedVariant(null);
        setSalePrice("");
    };

    const handleRemoveItem = async (itemId: string) => {
        if (!confirm("Bạn có chắc muốn xóa phân loại này khỏi chiến dịch?")) return;
        const { error } = await supabase.from("campaign_items").delete().eq("id", itemId);
        if (!error) {
            toast({ title: "Đã xóa" });
            setItems(items.filter(i => i.id !== itemId));
        }
    };

    const toggleCampaignStatus = async () => {
        const newStatus = !campaign.is_active;
        const { error } = await supabase.from("campaigns").update({ is_active: newStatus }).eq("id", campaign.id);
        if (!error) {
            setCampaign({ ...campaign, is_active: newStatus });
            toast({ title: "Thành công", description: `Chiến dịch đã được ${newStatus ? "BẬT" : "TẮT"}.` });
        }
    };

    if (!campaign) return <div className="p-8 text-center text-slate-500">Đang tải...</div>;

    const isActiveTime = new Date() >= new Date(campaign.start_time) && new Date() <= new Date(campaign.end_time);
    const fmt = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-industrial-black p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon" className="rounded-full bg-slate-50 dark:bg-slate-800">
                        <Link href="/admin/campaigns"><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{campaign.name}</h1>
                            {campaign.is_active ? (
                                isActiveTime
                                    ? <Badge className="bg-green-500">Đang chạy</Badge>
                                    : <Badge variant="outline" className="text-electric-orange border-electric-orange">Sắp diễn ra</Badge>
                            ) : <Badge variant="secondary">Đã tắt</Badge>}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                            <Calendar className="h-4 w-4" />
                            <span>Bắt đầu: {format(new Date(campaign.start_time), "HH:mm dd/MM/yyyy", { locale: vi })}</span>
                            <span>&bull;</span>
                            <span className="text-red-500">Kết thúc: {format(new Date(campaign.end_time), "HH:mm dd/MM/yyyy", { locale: vi })}</span>
                        </div>
                    </div>
                </div>
                <Button
                    variant={campaign.is_active ? "destructive" : "default"}
                    onClick={toggleCampaignStatus}
                    className={!campaign.is_active ? "bg-green-600 hover:bg-green-700" : ""}
                >
                    {campaign.is_active ? "Tắt Chiến Dịch" : "Bật Chiến Dịch"}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT: Add Product Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-industrial-black rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Plus className="h-5 w-5 text-electric-orange" /> Thêm Phân Loại Vào Sale
                        </h3>

                        {/* Step Indicator */}
                        <div className="flex items-center gap-1 text-xs mb-5">
                            {["Tìm SP", "Chọn loại", "Giá Sale"].map((label, i) => (
                                <div key={i} className="flex items-center gap-1">
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] border ${step > i ? "bg-green-500 border-green-500 text-white" : step === i ? "bg-electric-orange border-electric-orange text-white" : "border-slate-300 text-slate-400"}`}>
                                        {step > i ? <Check className="w-3 h-3" /> : i + 1}
                                    </span>
                                    <span className={step === i ? "text-electric-orange font-semibold" : "text-slate-400"}>{label}</span>
                                    {i < 2 && <ChevronRight className="w-3 h-3 text-slate-300" />}
                                </div>
                            ))}
                        </div>

                        {/* Step 0: Search */}
                        {step === 0 && (
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <Input placeholder="Tìm sản phẩm..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearchProducts()} />
                                    <Button onClick={handleSearchProducts} disabled={isSearching} className="bg-slate-800 dark:bg-slate-700 px-3">
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {searchResults.map((prod) => (
                                        <div key={prod.id} onClick={() => handleSelectProduct(prod)} className="flex items-center gap-3 p-2 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-electric-orange cursor-pointer transition-colors">
                                            <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded flex-shrink-0 overflow-hidden">
                                                {prod.thumbnail && <img src={prod.thumbnail} alt="" className="w-full h-full object-cover" />}
                                            </div>
                                            <span className="text-sm font-medium line-clamp-2">{prod.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 1: Pick Variant */}
                        {step === 1 && selectedProduct && (
                            <div className="space-y-3">
                                <div className="p-3 bg-orange-50 dark:bg-slate-800/50 rounded-lg flex items-center gap-3 border border-electric-orange/30">
                                    {selectedProduct.thumbnail && <img src={selectedProduct.thumbnail} alt="" className="w-10 h-10 rounded object-cover" />}
                                    <p className="text-sm font-semibold line-clamp-2 flex-1">{selectedProduct.name}</p>
                                    <Button variant="ghost" size="sm" onClick={resetForm} className="h-6 px-2 text-slate-400 hover:text-red-500">Hủy</Button>
                                </div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chọn phân loại cần Sale:</p>
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                    {productVariants.map((variant) => {
                                        const alreadyAdded = items.some(it => it.variant_id === variant.id);
                                        const attrLabel = Object.entries(variant.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(" | ");
                                        return (
                                            <button key={variant.id} onClick={() => !alreadyAdded && handleSelectVariant(variant)} disabled={alreadyAdded}
                                                className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${alreadyAdded ? "border-dashed border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed" : "border-slate-200 dark:border-slate-700 hover:border-electric-orange hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer"}`}>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold text-slate-800 dark:text-slate-100">{attrLabel || variant.sku || "Mặc định"}</p>
                                                        {variant.sku && <p className="text-[11px] text-slate-400 mt-0.5">SKU: {variant.sku}</p>}
                                                    </div>
                                                    <div className="text-right flex-shrink-0 ml-2">
                                                        <p className="font-bold text-electric-orange">{fmt(variant.price)}</p>
                                                        <p className="text-[11px] text-slate-400">Tồn: {variant.stock}</p>
                                                    </div>
                                                </div>
                                                {alreadyAdded && <span className="text-[10px] text-green-600 font-semibold mt-1 inline-block">✓ Đã trong chiến dịch</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Set Price */}
                        {step === 2 && selectedVariant && (
                            <div className="space-y-4">
                                <div className="p-3 bg-orange-50 dark:bg-slate-800/50 rounded-lg border border-electric-orange/30 space-y-2">
                                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Đang thiết lập Sale cho:</p>
                                    <p className="text-sm font-bold">{selectedProduct.name}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">Phân loại: <span className="font-semibold text-electric-orange">{Object.entries(selectedVariant.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(" | ") || selectedVariant.sku || "Mặc định"}</span></p>
                                    <p className="text-xs text-slate-500">Giá gốc: <span className="line-through">{fmt(selectedVariant.price)}</span></p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Giá Flash Sale (VNĐ)</label>
                                    <Input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className="border-electric-orange focus-visible:ring-electric-orange h-10 text-lg font-bold text-electric-orange" />
                                    {salePrice && Number(salePrice) < selectedVariant.price && (
                                        <p className="text-xs text-green-600 mt-1 font-semibold">Giảm {Math.round((1 - Number(salePrice) / selectedVariant.price) * 100)}% so với giá gốc</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setStep(1)} className="flex-none">← Chọn lại</Button>
                                    <Button onClick={handleAddItem} disabled={addingItem} className="flex-1 bg-electric-orange hover:bg-orange-600 font-bold">
                                        {addingItem ? "Đang thêm..." : "Xác nhận Sale"} <Tag className="ml-2 w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Items Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-industrial-black rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="font-bold flex items-center gap-2">
                                Phân loại đang Sale <Badge variant="secondary" className="ml-2">{items.length}</Badge>
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-white dark:bg-[#1e2330]">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Sản phẩm</th>
                                        <th className="px-4 py-3 font-medium">Phân loại</th>
                                        <th className="px-4 py-3 font-medium">Giá gốc</th>
                                        <th className="px-4 py-3 font-medium">Giá Sale</th>
                                        <th className="px-4 py-3 font-medium text-right">Gỡ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={5} className="text-center py-8">Đang tải...</td></tr>
                                    ) : items.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center py-12 text-slate-500">Chưa có phân loại nào. Hãy thêm từ cột bên trái.</td></tr>
                                    ) : (
                                        items.map((item) => {
                                            const attrLabel = Object.entries(item.product_variants?.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(" | ");
                                            return (
                                                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-orange-50/50 dark:hover:bg-slate-800/20">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-white rounded border border-slate-200 flex-shrink-0 overflow-hidden">
                                                                {item.products?.thumbnail && <img src={item.products.thumbnail} alt="" className="w-full h-full object-cover" />}
                                                            </div>
                                                            <span className="font-medium line-clamp-2 max-w-[150px]">{item.products?.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono">
                                                            {attrLabel || item.product_variants?.sku || "Mặc định"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-400 line-through text-sm">
                                                        {item.product_variants?.price ? fmt(item.product_variants.price) : "—"}
                                                    </td>
                                                    <td className="px-4 py-3 font-black text-electric-orange">{fmt(item.sale_price)}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleRemoveItem(item.id)}>
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
