"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { sendContactEmail } from "@/actions/contact";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
    name: z.string().min(2, "Vui lòng nhập họ và tên của bạn."),
    email: z.string().email("Vui lòng nhập địa chỉ email hợp lệ."),
    phone: z.string().min(8, "Vui lòng nhập số điện thoại hợp lệ.").optional().or(z.literal("")),
    message: z.string().min(10, "Lời nhắn của bạn phải có ít nhất 10 ký tự."),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContactForm() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            message: "",
        },
    });

    async function onSubmit(data: FormValues) {
        setIsLoading(true);
        try {
            const response = await sendContactEmail(data);

            if (response.success) {
                toast({
                    title: "Thành công!",
                    description: response.message,
                    variant: "default",
                });
                form.reset();
            } else {
                toast({
                    title: "Lỗi!",
                    description: response.message,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Lỗi hệ thống",
                description: "Không thể gửi yêu cầu lúc này.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            placeholder="Họ và tên"
                                            {...field}
                                            className="h-12 bg-slate-50 dark:bg-[#151923] border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-1 focus-visible:ring-electric-orange transition-all placeholder:text-slate-400"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs ml-1" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            placeholder="Địa chỉ Email"
                                            type="email"
                                            {...field}
                                            className="h-12 bg-slate-50 dark:bg-[#151923] border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-1 focus-visible:ring-electric-orange transition-all placeholder:text-slate-400"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs ml-1" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        placeholder="Số điện thoại (Tuỳ chọn)"
                                        type="tel"
                                        {...field}
                                        className="h-12 bg-slate-50 dark:bg-[#151923] border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-1 focus-visible:ring-electric-orange transition-all placeholder:text-slate-400"
                                    />
                                </FormControl>
                                <FormMessage className="text-xs ml-1" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea
                                        placeholder="Nội dung cần hỗ trợ..."
                                        className="min-h-[160px] p-4 resize-none bg-slate-50 dark:bg-[#151923] border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-1 focus-visible:ring-electric-orange transition-all placeholder:text-slate-400"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-xs ml-1" />
                            </FormItem>
                        )}
                    />

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-electric-orange to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold tracking-wide shadow-lg shadow-electric-orange/20 hover:shadow-electric-orange/40 transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Đang gửi...
                                </span>
                            ) : (
                                "GIAO THÔNG TIN"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
