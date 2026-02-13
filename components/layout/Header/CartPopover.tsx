"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    getCart,
    removeFromCart,
    updateCartItemQuantity,
    getCartTotal,
    getCartItemCount,
    formatVND,
    CartItem
} from "@/lib/cart";
import { cn } from "@/lib/utils";

export function CartPopover() {
    const [items, setItems] = useState<CartItem[]>([]);
    const [count, setCount] = useState(0);
    const [total, setTotal] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const updateState = () => {
        const cart = getCart();
        setItems(cart);
        setCount(getCartItemCount(cart));
        setTotal(getCartTotal(cart));
    };

    useEffect(() => {
        updateState();
        window.addEventListener("cart-updated", updateState);
        return () => window.removeEventListener("cart-updated", updateState);
    }, []);

    const handleQuantity = (variantId: string, delta: number) => {
        const item = items.find(i => i.variantId === variantId);
        if (!item) return;
        updateCartItemQuantity(variantId, item.quantity + delta);
    };

    const handleRemove = (variantId: string) => {
        removeFromCart(variantId);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button
                    className="relative p-2.5 bg-slate-100 dark:bg-[#1e2330] hover:bg-slate-200 dark:hover:bg-[#2a3040] text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 transition-all hover:text-electric-orange group outline-none"
                    aria-label="Open cart"
                >
                    <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                    {count > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-electric-orange text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-industrial-black animate-in zoom-in duration-300">
                            {count > 99 ? "99+" : count}
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 sm:w-96 p-0 bg-white dark:bg-[#1e2330] border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden" align="end">
                <div className="p-4 border-b dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider text-primary">
                        <ShoppingBag className="h-4 w-4" /> Giỏ hàng của tôi
                    </h3>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                        {count} sản phẩm
                    </span>
                </div>

                <ScrollArea className="h-[400px]">
                    {items.length > 0 ? (
                        <div className="p-4 space-y-4">
                            {items.map((item) => (
                                <div key={item.variantId} className="flex gap-4 group">
                                    <div className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white">
                                        {item.thumbnail ? (
                                            <img
                                                src={item.thumbnail}
                                                alt={item.productName}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                                <ShoppingBag className="h-8 w-8 text-slate-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-0.5">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 leading-tight mb-1 group-hover:text-electric-orange transition-colors">
                                                {item.productName}
                                            </h4>
                                            <div className="flex flex-wrap gap-1">
                                                {Object.entries(item.attributes).map(([k, v]) => (
                                                    <span key={k} className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                        {k}: {v}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-md p-1 scale-90 -translate-x-2">
                                                <button
                                                    onClick={() => handleQuantity(item.variantId, -1)}
                                                    className="w-5 h-5 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded transition shadow-sm disabled:opacity-30"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="h-2.5 w-2.5" />
                                                </button>
                                                <span className="text-[11px] font-bold w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleQuantity(item.variantId, 1)}
                                                    className="w-5 h-5 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded transition shadow-sm disabled:opacity-30"
                                                    disabled={item.quantity >= item.stock}
                                                >
                                                    <Plus className="h-2.5 w-2.5" />
                                                </button>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-black text-rose-600 dark:text-rose-500">
                                                    {formatVND(item.price * item.quantity)}
                                                </span>
                                                <button
                                                    onClick={() => handleRemove(item.variantId)}
                                                    className="text-[10px] text-slate-400 hover:text-rose-500 flex items-center gap-0.5 transition-colors mt-1"
                                                >
                                                    <Trash2 className="h-3 w-3" /> Gỡ bỏ
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                <ShoppingBag className="h-8 w-8 text-slate-300" />
                            </div>
                            <p className="font-bold text-slate-900 dark:text-white mb-1">Giỏ hàng trống</p>
                            <p className="text-xs">Tiếp tục khám phá sản phẩm của chúng tôi nhé!</p>
                        </div>
                    )}
                </ScrollArea>

                {items.length > 0 && (
                    <div className="p-4 border-t dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Tạm tính:</span>
                            <span className="text-lg font-black text-slate-900 dark:text-white">{formatVND(total)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Button asChild variant="outline" size="sm" className="w-full border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 font-bold" onClick={() => setIsOpen(false)}>
                                <Link href="/checkout">Giỏ hàng</Link>
                            </Button>
                            <Button asChild size="sm" className="w-full bg-electric-orange hover:bg-orange-600 font-bold shadow-lg shadow-orange-500/20" onClick={() => setIsOpen(false)}>
                                <Link href="/checkout" className="flex items-center gap-1.5">
                                    Thanh toán <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
