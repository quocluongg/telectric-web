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
import {
    Save,
    Loader2,
    Upload,
    X,
    Eye,
    ArrowLeft,
    Globe,
    FileText,
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
            // Reset form for create mode
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
            });
            router.push("/admin/news");
            router.refresh();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-electric-orange" />
            </div>
        );
    }

    return (
        <div>
            {/* Quill CSS */}
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css" />
            <style>{`
                .ql-editor {
                    min-height: 300px;
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

            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
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
                        className="text-lg"
                    />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                    <Label htmlFor="slug" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Slug (URL)
                    </Label>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">/news/</span>
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

                {/* Thumbnail Upload */}
                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Ảnh thumbnail
                    </Label>

                    {thumbnail ? (
                        <div className="relative w-full max-w-md aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                            <Image src={thumbnail} alt="Thumbnail" fill className="object-cover" />
                            <button
                                type="button"
                                onClick={() => setThumbnail("")}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full max-w-md aspect-video rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-electric-orange hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-colors"
                        >
                            <Upload className="w-8 h-8 text-slate-400" />
                            <span className="text-sm text-slate-500">Click để upload ảnh</span>
                            <span className="text-xs text-slate-400">Tối đa 5MB</span>
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
                </div>

                {/* Content - Quill Editor */}
                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Nội dung bài viết
                    </Label>
                    <ReactQuill
                        forwardedRef={quillRef}
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        formats={formats}
                        placeholder="Viết nội dung bài viết tại đây..."
                    />
                    <p className="text-xs text-slate-400">
                        Sử dụng toolbar để định dạng văn bản. Bấm nút hình ảnh trên toolbar để chèn ảnh.
                    </p>
                </div>

                {/* Publish Toggle */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isPublished}
                            onChange={(e) => setIsPublished(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-electric-orange focus:ring-electric-orange"
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
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4">
                    <Button
                        type="submit"
                        disabled={saving}
                        className="bg-electric-orange hover:bg-orange-600 text-white gap-2 px-6"
                    >
                        {saving ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        {editId ? "Cập nhật" : "Tạo bài viết"}
                    </Button>

                    {editId && slug && (
                        <a href={`/news/${slug}`} target="_blank" rel="noopener noreferrer">
                            <Button type="button" variant="outline" className="gap-2">
                                <Eye size={16} />
                                Xem bài viết
                            </Button>
                        </a>
                    )}

                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.push("/admin/news")}
                        className="text-slate-500"
                    >
                        Huỷ
                    </Button>
                </div>
            </form>
        </div>
    );
}
