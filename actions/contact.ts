"use server";

import nodemailer from "nodemailer";
import { z } from "zod";

const contactSchema = z.object({
    name: z.string().min(2, "Tên quá ngắn"),
    email: z.string().email("Email không hợp lệ"),
    phone: z.string().min(8, "Số điện thoại không hợp lệ").optional().or(z.literal("")),
    message: z.string().min(10, "Tin nhắn phải có ít nhất 10 ký tự"),
});

export async function sendContactEmail(formData: z.infer<typeof contactSchema>) {
    try {
        const validatedData = contactSchema.parse(formData);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.SMTP_EMAIL,
            to: process.env.SMTP_EMAIL, // Send to the owner's configured email
            subject: `Website Liên Hệ: ${validatedData.name}`,
            html: `
        <h3>Bạn có một liên hệ mới từ website:</h3>
        <p><strong>Họ và tên:</strong> ${validatedData.name}</p>
        <p><strong>Email:</strong> ${validatedData.email}</p>
        <p><strong>Số điện thoại:</strong> ${validatedData.phone || "Không cung cấp"}</p>
        <br/>
        <p><strong>Nội dung tin nhắn:</strong></p>
        <p>${validatedData.message.replace(/\n/g, '<br>')}</p>
      `,
        };

        // If no credentials, simulate success so the form still "works" for the user during development
        if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
            console.warn("SMTP_EMAIL or SMTP_PASSWORD is not set. Simulation mode.");
            console.log("Would have sent email:", mailOptions);
            return { success: true, message: "Gửi yêu cầu thành công (Mô phỏng chưa có mail thật)" };
        }

        await transporter.sendMail(mailOptions);
        return { success: true, message: "Gửi yêu cầu thành công! Chúng tôi sẽ sớm liên hệ mặt." };
    } catch (error) {
        console.error("Error sending contact email:", error);
        return { success: false, message: "Có lỗi xảy ra, vui lòng thử lại sau." };
    }
}
