import { GlobalLoading } from "@/components/common/GlobalLoading";

export default function Loading() {
    return (
        <div className="flex h-full w-full items-center justify-center p-8">
            <GlobalLoading />
        </div>
    );
}
