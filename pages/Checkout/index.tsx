"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    getCart, clearCart, removeFromCart, updateCartItemQuantity,
    setCartItemGrace, getCartTotal, CartItem, formatVND
} from "@/lib/cart";
import {
    ChevronLeft, Trash2, Loader2, ShieldCheck, Truck,
    CreditCard, Banknote, Package, Minus, Plus, Tag, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Vietnam Provinces API types
interface Province { code: number; name: string; }
interface District { code: number; name: string; }
interface Ward { code: number; name: string; }

export default function CheckoutPage() {
    const supabase = createClient();
    const { toast } = useToast();
    const router = useRouter();

    // Cart
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Customer form
    const [form, setForm] = useState({
        email: "",
        name: "",
        phone: "",
        address: "",
        notes: ""
    });

    // Province / District / Ward
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedWard, setSelectedWard] = useState("");
    const [provinceName, setProvinceName] = useState("");
    const [districtName, setDistrictName] = useState("");
    const [wardName, setWardName] = useState("");

    // Payment
    const [paymentMethod, setPaymentMethod] = useState("cod");

    // Coupon
    const [couponCode, setCouponCode] = useState("");

    // Order state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderId, setOrderId] = useState("");

    // Validation
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load cart & handle flash sale grace periods
    useEffect(() => {
        const loadAndCleanCart = async () => {
            const raw = getCart();
            const nowMs = Date.now();
            const now = new Date(nowMs).toISOString();

            // ── Step A: Remove items whose grace period has already expired ──
            const graceExpired = raw.filter(
                i => i.saleGraceExpiresAt && new Date(i.saleGraceExpiresAt).getTime() <= nowMs
            );
            let workingCart = raw;
            if (graceExpired.length > 0) {
                graceExpired.forEach(i => { workingCart = removeFromCart(i.variantId); });
                const names = graceExpired.map(i => `• ${i.productName}`).join("\n");
                toast({
                    title: "⏱ Thời gian gia hạn đã hết",
                    description: `Các sản phẩm sau đã bị xóa (hết 5 phút gia hạn):\n${names}`,
                    variant: "destructive",
                });
            }

            // ── Step B: Skip items that are still within an active grace period ──
            const variantIds = workingCart
                .filter(i => !i.saleGraceExpiresAt) // already-graced items are fine
                .map(i => i.variantId)
                .filter(Boolean);

            if (variantIds.length === 0) {
                setCartItems(workingCart);
                setIsLoaded(true);
                return;
            }

            // ── Step C: Fetch real prices for non-graced suspects ──
            const { data: variantData } = await supabase
                .from("product_variants")
                .select("id, price")
                .in("id", variantIds);

            const variantPriceMap: Record<string, number> = {};
            (variantData || []).forEach((v: any) => { variantPriceMap[v.id] = v.price; });

            const suspectVariantIds = workingCart
                .filter(item => {
                    if (item.saleGraceExpiresAt) return false; // already in grace
                    const realPrice = variantPriceMap[item.variantId ?? ""];
                    return realPrice !== undefined && item.price < realPrice;
                })
                .map(item => item.variantId!);

            if (suspectVariantIds.length === 0) {
                setCartItems(workingCart);
                setIsLoaded(true);
                return;
            }

            // ── Step D: Check which suspects still have an active campaign ──
            const { data: activeSaleItems } = await supabase
                .from("campaign_items")
                .select("variant_id, campaigns!inner(is_active, start_time, end_time)")
                .in("variant_id", suspectVariantIds)
                .eq("campaigns.is_active", true)
                .lte("campaigns.start_time", now)
                .gte("campaigns.end_time", now);

            const stillActiveSet = new Set(
                (activeSaleItems || []).map((si: any) => si.variant_id)
            );

            // ── Step E: For items whose sale ended → stamp grace (don't remove yet) ──
            suspectVariantIds.forEach(vid => {
                if (!stillActiveSet.has(vid)) {
                    workingCart = setCartItemGrace(vid) ?? workingCart;
                }
            });

            setCartItems(getCart()); // re-read after grace stamps
            setIsLoaded(true);
        };

        loadAndCleanCart();
    }, []);


    // Fetch provinces
    useEffect(() => {
        fetch("https://provinces.open-api.vn/api/p/")
            .then(res => res.json())
            .then(data => setProvinces(data))
            .catch(() => { });
    }, []);

    // Fetch districts when province selected
    useEffect(() => {
        if (!selectedProvince) { setDistricts([]); return; }
        fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
            .then(res => res.json())
            .then(data => {
                setDistricts(data.districts || []);
                setProvinceName(data.name || "");
            })
            .catch(() => { });
        setSelectedDistrict("");
        setSelectedWard("");
        setWards([]);
    }, [selectedProvince]);

    // Fetch wards when district selected
    useEffect(() => {
        if (!selectedDistrict) { setWards([]); return; }
        fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
            .then(res => res.json())
            .then(data => {
                setWards(data.wards || []);
                setDistrictName(data.name || "");
            })
            .catch(() => { });
        setSelectedWard("");
    }, [selectedDistrict]);

    // Ward name
    const handleWardChange = (wardCode: string) => {
        setSelectedWard(wardCode);
        const w = wards.find(w => w.code.toString() === wardCode);
        setWardName(w?.name || "");
    };

    // Total
    const subtotal = getCartTotal(cartItems);
    const total = subtotal; // can add discount logic later

    // --- Cart actions ---
    const handleQuantity = (variantId: string, delta: number) => {
        const item = cartItems.find(c => c.variantId === variantId);
        if (!item) return;
        const newQty = Math.max(1, Math.min(item.quantity + delta, item.stock));
        const updated = updateCartItemQuantity(variantId, newQty);
        setCartItems([...updated]);
    };

    const handleRemove = (variantId: string) => {
        const updated = removeFromCart(variantId);
        setCartItems([...updated]);
    };

    // --- Validate ---
    const validate = useCallback(() => {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = "Vui lòng nhập họ tên";
        if (!form.phone.trim()) e.phone = "Vui lòng nhập số điện thoại";
        else if (!/^(0|\+84)\d{9,10}$/.test(form.phone.replace(/\s/g, "")))
            e.phone = "Số điện thoại không hợp lệ";
        if (!form.address.trim()) e.address = "Vui lòng nhập địa chỉ";
        if (!selectedProvince) e.province = "Bạn chưa chọn tỉnh thành";
        if (!selectedDistrict) e.district = "Bạn chưa chọn quận huyện";
        if (!selectedWard) e.ward = "Bạn chưa chọn phường xã";
        if (cartItems.length === 0) e.cart = "Giỏ hàng trống";
        setErrors(e);
        return Object.keys(e).length === 0;
    }, [form, selectedProvince, selectedDistrict, selectedWard, cartItems]);

    // --- Submit order ---
    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);

        try {
            const fullAddress = `${form.address}, ${wardName}, ${districtName}, ${provinceName}`;

            // ── Safety-net: remove items whose grace window has now expired ──
            const now = Date.now();
            const graceExpired = cartItems.filter(
                i => i.saleGraceExpiresAt && new Date(i.saleGraceExpiresAt).getTime() <= now
            );
            if (graceExpired.length > 0) {
                let updatedCart = cartItems;
                graceExpired.forEach(i => { updatedCart = removeFromCart(i.variantId); });
                setCartItems(updatedCart);
                setIsSubmitting(false);
                toast({
                    title: "⏱ Thời gian gia hạn đã hết",
                    description: `Thời gian 5 phút đã hết, các sản phẩm sale sau đã bị xóa:\n${graceExpired.map(i => `• ${i.productName}`).join("\n")}\n\nVui lòng xem lại giỏ hàng.`,
                    variant: "destructive",
                });
                return;
            }
            // ── END safety-net ───────────────────────────────────────────────

            const items = cartItems.map(item => ({
                product_id: item.productId,
                variant_id: item.variantId,
                quantity: item.quantity,
                price: item.price
            }));

            // Get current user ID if logged in
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase.rpc("create_order_v2", {
                p_customer_name: form.name,
                p_customer_phone: form.phone.replace(/\s/g, ""),
                p_shipping_address: fullAddress,
                p_items: items,
                p_user_id: user?.id || null
            });

            if (error) throw error;

            setOrderId((data as string) || "");
            setOrderSuccess(true);
            clearCart();
            setCartItems([]);
        } catch (err: any) {
            toast({
                title: "Lỗi đặt hàng",
                description: err.message || "Vui lòng thử lại",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };


    // --- Loading ---
    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        );
    }

    // --- Success ---
    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Đặt hàng thành công!</h1>
                    <p className="text-slate-500 mb-4">
                        Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ xác nhận sớm nhất.
                    </p>
                    {orderId && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-orange-700 font-medium">Mã đơn hàng</p>
                            <p className="text-lg font-mono font-black text-orange-600 mt-1">
                                #{orderId.slice(0, 8).toUpperCase()}
                            </p>
                        </div>
                    )}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => router.push("/")}
                        >
                            Về trang chủ
                        </Button>
                        <Button
                            className="flex-1 bg-orange-600 hover:bg-orange-700"
                            onClick={() => router.push("/products")}
                        >
                            Tiếp tục mua sắm
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // --- Empty cart ---
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-700 mb-2">Giỏ hàng trống</h2>
                    <p className="text-slate-500 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
                    <Button asChild className="bg-orange-600 hover:bg-orange-700">
                        <Link href="/products">Khám phá sản phẩm</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-orange-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-black text-sm">T</span>
                        </div>
                        <span className="font-black text-lg text-slate-900">TLECTRIC</span>
                    </Link>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                        <span>Thanh toán an toàn & bảo mật</span>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
                {/* Back */}
                <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-orange-600 transition-colors mb-6"
                >
                    <ChevronLeft className="h-4 w-4" /> Quay lại mua sắm
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* ========= LEFT: FORM ========= */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* --- Customer Info --- */}
                        <div className="bg-white rounded-xl border p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                                Thông tin nhận hàng
                            </h2>

                            <div className="space-y-4">
                                {/* Email */}
                                <div>
                                    <Label className="text-sm font-medium text-slate-700">Email (tùy chọn)</Label>
                                    <Input
                                        placeholder="email@example.com"
                                        value={form.email}
                                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        className="mt-1.5"
                                    />
                                </div>

                                {/* Name */}
                                <div>
                                    <Label className="text-sm font-medium text-slate-700">
                                        Họ và tên <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        placeholder="Nguyễn Văn A"
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        className={cn("mt-1.5", errors.name && "border-red-400")}
                                    />
                                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                </div>

                                {/* Phone */}
                                <div>
                                    <Label className="text-sm font-medium text-slate-700">
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="flex mt-1.5">
                                        <div className="flex items-center gap-1.5 px-3 bg-gray-50 border border-r-0 rounded-l-md text-sm text-slate-500">
                                            🇻🇳
                                        </div>
                                        <Input
                                            placeholder="0912 345 678"
                                            value={form.phone}
                                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                            className={cn("rounded-l-none", errors.phone && "border-red-400")}
                                        />
                                    </div>
                                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                                </div>

                                {/* Address */}
                                <div>
                                    <Label className="text-sm font-medium text-slate-700">
                                        Địa chỉ <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        placeholder="Số nhà, tên đường..."
                                        value={form.address}
                                        onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                                        className={cn("mt-1.5", errors.address && "border-red-400")}
                                    />
                                    {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                                </div>

                                {/* Province / District / Ward */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <Label className="text-sm font-medium text-slate-700">Tỉnh thành</Label>
                                        <select
                                            value={selectedProvince}
                                            onChange={e => setSelectedProvince(e.target.value)}
                                            className={cn(
                                                "w-full mt-1.5 h-10 px-3 rounded-md border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all",
                                                errors.province && "border-red-400"
                                            )}
                                        >
                                            <option value="">Tỉnh thành</option>
                                            {provinces.map(p => (
                                                <option key={p.code} value={p.code}>{p.name}</option>
                                            ))}
                                        </select>
                                        {errors.province && <p className="text-xs text-red-500 mt-1">{errors.province}</p>}
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-slate-700">Quận huyện</Label>
                                        <select
                                            value={selectedDistrict}
                                            onChange={e => setSelectedDistrict(e.target.value)}
                                            disabled={!selectedProvince}
                                            className={cn(
                                                "w-full mt-1.5 h-10 px-3 rounded-md border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                                                errors.district && "border-red-400"
                                            )}
                                        >
                                            <option value="">Quận huyện</option>
                                            {districts.map(d => (
                                                <option key={d.code} value={d.code}>{d.name}</option>
                                            ))}
                                        </select>
                                        {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-slate-700">Phường xã</Label>
                                        <select
                                            value={selectedWard}
                                            onChange={e => handleWardChange(e.target.value)}
                                            disabled={!selectedDistrict}
                                            className={cn(
                                                "w-full mt-1.5 h-10 px-3 rounded-md border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                                                errors.ward && "border-red-400"
                                            )}
                                        >
                                            <option value="">Phường xã</option>
                                            {wards.map(w => (
                                                <option key={w.code} value={w.code}>{w.name}</option>
                                            ))}
                                        </select>
                                        {errors.ward && <p className="text-xs text-red-500 mt-1">{errors.ward}</p>}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <Label className="text-sm font-medium text-slate-700">Ghi chú</Label>
                                    <textarea
                                        placeholder="Ghi chú thêm cho đơn hàng..."
                                        value={form.notes}
                                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                        rows={2}
                                        className="w-full mt-1.5 px-3 py-2 rounded-md border text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* --- Payment Method --- */}
                        <div className="bg-white rounded-xl border p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-5">Thanh toán</h2>

                            <div className="space-y-3">
                                {/* COD */}
                                <label
                                    className={cn(
                                        "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                        paymentMethod === "cod"
                                            ? "border-orange-400 bg-orange-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        checked={paymentMethod === "cod"}
                                        onChange={() => setPaymentMethod("cod")}
                                        className="accent-orange-600 w-4 h-4"
                                    />
                                    <Banknote className="h-5 w-5 text-green-600" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm text-slate-900">Thanh Toán Khi Giao Hàng (Ship COD)</p>
                                        <p className="text-xs text-slate-500 mt-0.5">Thanh toán bằng tiền mặt khi nhận hàng</p>
                                    </div>
                                </label>

                                {/* Bank Transfer */}
                                <label
                                    className={cn(
                                        "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                        paymentMethod === "bank_transfer"
                                            ? "border-orange-400 bg-orange-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="bank_transfer"
                                        checked={paymentMethod === "bank_transfer"}
                                        onChange={() => setPaymentMethod("bank_transfer")}
                                        className="accent-orange-600 w-4 h-4"
                                    />
                                    <CreditCard className="h-5 w-5 text-blue-600" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm text-slate-900">Chuyển Khoản Qua Ngân Hàng</p>
                                        <p className="text-xs text-slate-500 mt-0.5">Chuyển khoản trước khi giao hàng</p>
                                    </div>
                                </label>
                            </div>

                            {/* Trust note */}
                            <div className="mt-5 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
                                <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-blue-800">
                                    Bạn chỉ phải thanh toán khi nhận được hàng hóa chuẩn chính hãng và chất lượng đúng như cam kết!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ========= RIGHT: ORDER SUMMARY ========= */}
                    <div className="lg:col-span-5">
                        <div className="bg-orange-600 rounded-xl p-6 text-white sticky top-20">
                            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Đơn hàng ({cartItems.length} sản phẩm)
                            </h2>

                            {/* Items */}
                            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-1">
                                {cartItems.map((item) => (
                                    <div key={item.variantId} className="flex items-start gap-3">
                                        <div className="relative flex-shrink-0">
                                            {item.thumbnail ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={item.thumbnail}
                                                    alt={item.productName}
                                                    className="w-14 h-14 rounded-lg object-cover border-2 border-orange-400"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 rounded-lg bg-orange-500 flex items-center justify-center">
                                                    <Package className="h-6 w-6 text-orange-200" />
                                                </div>
                                            )}
                                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-orange-600 rounded-full text-[10px] font-black flex items-center justify-center shadow">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm leading-tight truncate">{item.productName}</p>
                                            <div className="flex gap-1 mt-1 flex-wrap">
                                                {Object.entries(item.attributes).map(([k, v]) => (
                                                    <span key={k} className="text-[10px] bg-orange-500/50 px-1.5 py-0.5 rounded">
                                                        {k}: {v}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="font-bold text-sm whitespace-nowrap">{formatVND(item.price * item.quantity)}</span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleQuantity(item.variantId, -1)}
                                                    className="w-5 h-5 rounded bg-orange-500 hover:bg-orange-400 flex items-center justify-center transition"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleQuantity(item.variantId, 1)}
                                                    className="w-5 h-5 rounded bg-orange-500 hover:bg-orange-400 flex items-center justify-center transition"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                                <button
                                                    onClick={() => handleRemove(item.variantId)}
                                                    className="ml-1 w-5 h-5 rounded bg-red-500 hover:bg-red-400 flex items-center justify-center transition"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Divider */}
                            <div className="border-t border-orange-400/50 my-4" />

                            {/* Coupon */}
                            <div className="flex gap-2 mb-4">
                                <div className="flex-1 relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-300" />
                                    <input
                                        placeholder="Nhập mã giảm giá"
                                        value={couponCode}
                                        onChange={e => setCouponCode(e.target.value)}
                                        className="w-full h-10 pl-9 pr-3 rounded-lg bg-orange-500/40 border border-orange-400/50 text-white placeholder-orange-200 text-sm outline-none focus:border-white transition"
                                    />
                                </div>
                                <button className="px-4 h-10 bg-white text-orange-600 rounded-lg text-sm font-bold hover:bg-orange-50 transition">
                                    Áp dụng
                                </button>
                            </div>

                            {/* Subtotal */}
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm text-orange-100">
                                    <span>Tạm tính</span>
                                    <span>{formatVND(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-orange-100">
                                    <span>Phí vận chuyển</span>
                                    <span className="text-green-300 font-medium">Miễn phí</span>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="border-t border-orange-400/50 pt-4 mb-6">
                                <div className="flex justify-between items-baseline">
                                    <span className="font-bold">Tổng cộng</span>
                                    <span className="text-2xl font-black">{formatVND(total)}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/products"
                                    className="text-sm text-orange-200 hover:text-white transition flex items-center gap-1"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                    Quay về giỏ hàng
                                </Link>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="ml-auto bg-white text-orange-600 hover:bg-orange-50 font-bold text-base px-8 h-12 rounded-lg shadow-lg transition-all hover:shadow-xl"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...</>
                                    ) : (
                                        "ĐẶT HÀNG"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
