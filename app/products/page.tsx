import { Metadata } from "next";
import ProductsPage from "@/views/Products";

export const metadata: Metadata = {
    title: "Sản Phẩm | TELECTRIC - Dụng Cụ Đo Lường Chính Hãng",
    description:
        "Khám phá toàn bộ dụng cụ đo lường điện chính hãng tại TELECTRIC. Ampe kìm, đồng hồ vạn năng, máy đo điện trở và nhiều sản phẩm khác với giá tốt nhất.",
    openGraph: {
        title: "Sản Phẩm | TELECTRIC - Dụng Cụ Đo Lường Chính Hãng",
        description:
            "Khám phá toàn bộ dụng cụ đo lường điện chính hãng tại TELECTRIC. Ampe kìm, đồng hồ vạn năng, máy đo điện trở và nhiều sản phẩm khác.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Sản Phẩm | TELECTRIC - Dụng Cụ Đo Lường Chính Hãng",
        description:
            "Khám phá toàn bộ dụng cụ đo lường điện chính hãng tại TELECTRIC.",
    },
};

export default function Page() {
    return <ProductsPage />;
}
