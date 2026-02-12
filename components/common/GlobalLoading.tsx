"use client";

import { cn } from "@/lib/utils";

interface GlobalLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
    message?: string;
    imageSrc?: string;
}

export function GlobalLoading({
    className,
    message = "Đang tải trang, chờ chút nhé ...",
    imageSrc = "/images/loading-character.png",
    ...props
}: GlobalLoadingProps) {
    return (
        <div
            className={cn(
                "flex min-h-[50vh] w-full flex-col items-center justify-center space-y-4",
                className
            )}
            {...props}
        >
            <div className="relative h-32 w-32 animate-bounce">
                <img
                    src={imageSrc}
                    alt="Loading..."
                    className="h-full w-full object-contain"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                    }}
                />
                <div className="absolute inset-0 -z-10 flex items-center justify-center rounded-full bg-muted/20">
                    <span className="sr-only">Loading</span>
                </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
                {message}
            </p>
        </div>
    );
}
