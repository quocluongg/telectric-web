import { Metadata } from "next";
import ContactPage from "@/views/Contact/ContactPage";

export const metadata: Metadata = {
    title: "Liên Hệ | TELECTRIC - Điểm Tựa Kỹ Thuật",
    description:
        "Liên hệ TELECTRIC để được tư vấn thiết bị đo lường chính hãng. Hỗ trợ nhanh chóng qua hotline, email và showroom.",
    openGraph: {
        title: "Liên Hệ | TELECTRIC - Điểm Tựa Kỹ Thuật",
        description:
            "Liên hệ TELECTRIC để được tư vấn thiết bị đo lường chính hãng. Hỗ trợ nhanh chóng qua hotline, email và showroom.",
        type: "website",
    },
};

export default function Page() {
    return <ContactPage />;
}
