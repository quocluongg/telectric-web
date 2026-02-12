import { Metadata } from "next"
import BrandPage from "@/pages/Brand"

export const metadata: Metadata = {
    title: "Thương Hiệu | TELECTRIC - Điểm Tựa Kỹ Thuật",
    description:
        "TELECTRIC - Chuyên gia thiết bị đo điện chính hãng. Cam kết đền gấp 10 lần nếu phát hiện hàng giả. Giao hàng miễn phí, bảo hành 1 đổi 1.",
}

export default function Page() {
    return <BrandPage />
}
