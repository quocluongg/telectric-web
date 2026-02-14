"use client";

import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Save,
    Loader2,
    Upload,
    X,
    Eye,
    ArrowLeft,
    Globe,
    FileText,
    Newspaper,
    ImageIcon,
    Type,
} from "lucide-react";

// Dynamic import for Quill (requires browser)
const ReactQuill = dynamic(
    async () => {
        const { default: RQ } = await import("react-quill-new");
        return function QuillWrapper({ forwardedRef, ...props }: any) {
            return <RQ ref={forwardedRef} {...props} />;
        };
    },
    { ssr: false }
);

interface AdminNewsCreateProps {
    editId?: string;
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}

export default function AdminNewsCreate({ editId }: AdminNewsCreateProps) {
    const router = useRouter();
    const { toast } = useToast();
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const quillRef = useRef<any>(null);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [slugManual, setSlugManual] = useState(false);
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [isPublished, setIsPublished] = useState(false);

    // Auto-generate slug from title
    useEffect(() => {
        if (!slugManual && !editId) {
            setSlug(slugify(title));
        }
    }, [title, slugManual, editId]);

    // Load existing article for editing OR reset for creating
    useEffect(() => {
        if (!editId) {
            setTitle("");
            setSlug("");
            setSlugManual(false);
            setExcerpt("");
            setContent("");
            setThumbnail("");
            setIsPublished(false);
            setLoading(false);
            return;
        }

        setLoading(true);
        (async () => {
            const { data, error } = await supabase
                .from("news")
                .select("*")
                .eq("id", editId)
                .single();

            if (error || !data) {
                toast({ title: "Lỗi", description: "Không tìm thấy bài viết.", variant: "destructive" });
                router.push("/admin/news");
                return;
            }

            setTitle(data.title);
            setSlug(data.slug);
            setSlugManual(true);
            setExcerpt(data.excerpt || "");
            setContent(data.content || "");
            setThumbnail(data.thumbnail || "");
            setIsPublished(data.is_published);
            setLoading(false);
        })();
    }, [editId]);

    // Upload thumbnail
    const handleThumbnailUpload = async (file: File) => {
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "Lỗi", description: "File quá lớn (tối đa 5MB).", variant: "destructive" });
            return;
        }

        const ext = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
        const filePath = `thumbnails/${fileName}`;

        const { error } = await supabase.storage.from("news").upload(filePath, file);

        if (error) {
            toast({ title: "Upload thất bại", description: error.message, variant: "destructive" });
            return;
        }

        const { data: urlData } = supabase.storage.from("news").getPublicUrl(filePath);
        setThumbnail(urlData.publicUrl);
        toast({ title: "Đã upload ảnh thumbnail" });
    };

    // Upload image into Quill editor content
    const imageHandler = useCallback(() => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
                toast({ title: "Lỗi", description: "File quá lớn (tối đa 5MB).", variant: "destructive" });
                return;
            }

            const ext = file.name.split(".").pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
            const filePath = `content/${fileName}`;

            const { error } = await supabase.storage.from("news").upload(filePath, file);

            if (error) {
                toast({ title: "Upload thất bại", description: error.message, variant: "destructive" });
                return;
            }

            const { data: urlData } = supabase.storage.from("news").getPublicUrl(filePath);
            const quill = quillRef.current?.getEditor();
            if (quill) {
                const range = quill.getSelection(true);
                quill.insertEmbed(range.index, "image", urlData.publicUrl);
                quill.setSelection(range.index + 1);
            }

            toast({ title: "Đã chèn ảnh vào nội dung" });
        };
    }, [supabase, toast]);

    // Quill modules config
    const modules = useMemo(
        () => ({
            toolbar: {
                container: [
                    [{ header: [1, 2, 3, 4, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ color: [] }, { background: [] }],
                    [{ align: [] }],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["blockquote", "code-block"],
                    ["link", "image", "video"],
                    ["clean"],
                ],
                handlers: {
                    image: imageHandler,
                },
            },
            clipboard: {
                matchVisual: false,
            },
        }),
        [imageHandler]
    );

    const formats = [
        "header",
        "bold", "italic", "underline", "strike",
        "color", "background",
        "align",
        "list",
        "blockquote", "code-block",
        "link", "image", "video",
    ];

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast({ title: "Lỗi", description: "Vui lòng nhập tiêu đề.", variant: "destructive" });
            return;
        }
        if (!slug.trim()) {
            toast({ title: "Lỗi", description: "Vui lòng nhập slug.", variant: "destructive" });
            return;
        }

        setSaving(true);

        const payload = {
            title: title.trim(),
            slug: slug.trim(),
            excerpt: excerpt.trim() || null,
            content: content.trim() || null,
            thumbnail: thumbnail || null,
            is_published: isPublished,
            published_at: isPublished ? new Date().toISOString() : null,
        };

        let error;

        if (editId) {
            const res = await supabase.from("news").update(payload).eq("id", editId);
            error = res.error;
        } else {
            const res = await supabase.from("news").insert(payload);
            error = res.error;
        }

        setSaving(false);

        if (error) {
            toast({ title: "Lỗi", description: error.message, variant: "destructive" });
        } else {
            toast({
                title: editId ? "Đã cập nhật" : "Đã tạo",
                description: `Bài viết "${title}" đã được ${editId ? "cập nhật" : "tạo"} thành công.`,
                className: "bg-green-600 text-white",
            });
            router.push("/admin/news");
            router.refresh();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                    <p className="text-sm text-slate-500">Đang tải dữ liệu bài viết...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 pb-24">
            {/* Quill CSS */}
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css" />
            <style>{`
                .ql-editor {
                    min-height: 350px;
                    max-height: 600px;
                    overflow-y: auto;
                    font-size: 15px;
                    line-height: 1.8;
                }
                .ql-toolbar.ql-snow {
                    border-radius: 8px 8px 0 0;
                    border-color: hsl(var(--border));
                    background: hsl(var(--muted));
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                .ql-container.ql-snow {
                    border-radius: 0 0 8px 8px;
                    border-color: hsl(var(--border));
                    font-family: inherit;
                }
                .ql-editor.ql-blank::before {
                    color: hsl(var(--muted-foreground));
                    font-style: normal;
                }
                .ql-snow .ql-stroke {
                    stroke: hsl(var(--foreground));
                }
                .ql-snow .ql-fill {
                    fill: hsl(var(--foreground));
                }
                .ql-snow .ql-picker-label {
                    color: hsl(var(--foreground));
                }
                .ql-editor img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                    margin: 12px 0;
                }
            `}</style>

            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/admin/news")}
                        className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {editId ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
                        </h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: Main content */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Basic Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Type className="h-5 w-5 text-orange-600" /> Thông tin cơ bản
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Tiêu đề *
                                    </Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Nhập tiêu đề bài viết..."
                                        className="text-lg h-12"
                                    />
                                </div>

                                {/* Slug */}
                                <div className="space-y-2">
                                    <Label htmlFor="slug" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Slug (URL)
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-400 whitespace-nowrap">/news/</span>
                                        <Input
                                            id="slug"
                                            value={slug}
                                            onChange={(e) => {
                                                setSlug(e.target.value);
                                                setSlugManual(true);
                                            }}
                                            placeholder="tieu-de-bai-viet"
                                        />
                                    </div>
                                </div>

                                {/* Excerpt */}
                                <div className="space-y-2">
                                    <Label htmlFor="excerpt" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Mô tả ngắn
                                    </Label>
                                    <Textarea
                                        id="excerpt"
                                        value={excerpt}
                                        onChange={(e) => setExcerpt(e.target.value)}
                                        placeholder="Mô tả ngắn gọn nội dung bài viết..."
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Content Card - Quill Editor */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Newspaper className="h-5 w-5 text-orange-600" /> Nội dung bài viết
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ReactQuill
                                    forwardedRef={quillRef}
                                    theme="snow"
                                    value={content}
                                    onChange={setContent}
                                    modules={modules}
                                    formats={formats}
                                    placeholder="Viết nội dung bài viết tại đây..."
                                />
                                <p className="text-xs text-slate-400 mt-2">
                                    Sử dụng toolbar để định dạng văn bản. Bấm nút hình ảnh trên toolbar để chèn ảnh.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Media & Settings */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Thumbnail Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <ImageIcon className="h-4 w-4" /> Ảnh thumbnail
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {thumbnail ? (
                                    <div className="relative rounded-lg overflow-hidden border group">
                                        <Image src={thumbnail} alt="Thumbnail" width={400} height={225} className="w-full aspect-video object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setThumbnail("")}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 hover:border-orange-400 transition-colors"
                                    >
                                        <Upload className="h-8 w-8 text-slate-400 mb-2" />
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Bấm để tải ảnh</p>
                                        <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP. Tối đa 5MB</p>
                                    </div>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleThumbnailUpload(file);
                                    }}
                                />
                            </CardContent>
                        </Card>

                        {/* Publish Toggle Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Globe className="h-4 w-4" /> Trạng thái xuất bản
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-orange-300 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={isPublished}
                                        onChange={(e) => setIsPublished(e.target.checked)}
                                        className="w-5 h-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                                    />
                                    <div className="flex items-center gap-2">
                                        {isPublished ? (
                                            <>
                                                <Globe size={16} className="text-green-500" />
                                                <span className="font-semibold text-green-600 dark:text-green-400">
                                                    Xuất bản công khai
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <FileText size={16} className="text-slate-400" />
                                                <span className="font-semibold text-slate-500 dark:text-slate-400">
                                                    Lưu nháp
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </label>

                                {editId && slug && (
                                    <a href={`/news/${slug}`} target="_blank" rel="noopener noreferrer" className="block mt-3">
                                        <Button type="button" variant="outline" className="w-full gap-2" size="sm">
                                            <Eye size={14} />
                                            Xem bài viết
                                        </Button>
                                    </a>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* FIXED FOOTER */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 p-4 z-50 shadow-lg">
                        <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
                            <div className="hidden md:block text-sm text-muted-foreground">
                                Đang chỉnh sửa: <span className="font-medium text-slate-900 dark:text-white">{title || "Bài viết mới"}</span>
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 md:flex-none"
                                    onClick={() => router.push("/admin/news")}
                                >
                                    Huỷ bỏ
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-10 flex-1 md:flex-none"
                                >
                                    {saving ? (
                                        <Loader2 size={18} className="animate-spin mr-2" />
                                    ) : (
                                        <Save size={18} className="mr-2" />
                                    )}
                                    {editId ? "Cập nhật" : "Tạo bài viết"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
