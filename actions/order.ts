"use server";

import nodemailer from "nodemailer";

export async function sendOrderEmails(orderData: any, customerEmail: string | null, shouldSendToCustomer: boolean) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        // Generate Items HTML
        const itemsHtml = orderData.items.map((item: any) => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.productName || 'Sản phẩm'} ${item.variantName ? `(${item.variantName})` : ''}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${new Intl.NumberFormat('vi-VN').format(item.price)} đ</td>
            </tr>
        `).join("");

        // Admin Email Template (always sent)
        const adminMailOptions = {
            from: process.env.SMTP_EMAIL,
            to: process.env.SMTP_EMAIL,
            subject: `[ĐƠN HÀNG MỚI] - ${orderData.orderId}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #ea580c;">CÓ ĐƠN ĐẶT HÀNG MỚI!</h2>
                    <p><strong>Mã đơn hàng:</strong> ${orderData.orderId}</p>
                    <p><strong>Khách hàng:</strong> ${orderData.customerName}</p>
                    <p><strong>Điện thoại:</strong> ${orderData.customerPhone}</p>
                    <p><strong>Địa chỉ:</strong> ${orderData.shippingAddress}</p>
                    <p><strong>Thanh toán:</strong> ${orderData.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản'}</p>
                    <p><strong>Ghi chú:</strong> ${orderData.notes || 'Không có'}</p>
                    
                    <h3 style="border-bottom: 2px solid #ea580c; padding-bottom: 5px;">Chi tiết sản phẩm</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f8fafc;">
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #cbd5e1;">Sản phẩm</th>
                                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #cbd5e1;">SL</th>
                                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #cbd5e1;">Đơn giá</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Tổng cộng:</td>
                                <td style="padding: 10px; text-align: right; font-weight: bold; color: #ea580c; font-size: 16px;">
                                    ${new Intl.NumberFormat('vi-VN').format(orderData.totalAmount)} đ
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            `,
        };

        // Send to Admin
        await transporter.sendMail(adminMailOptions);

        // Customer Email Template (sent only if valid email and requested)
        if (shouldSendToCustomer && customerEmail) {
            const customerMailOptions = {
                from: process.env.SMTP_EMAIL,
                to: customerEmail,
                subject: `Xác nhận đơn hàng #${orderData.orderId} từ TLECTRIC`,
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                        <div style="background-color: #ea580c; padding: 20px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 24px;">TLECTRIC</h1>
                        </div>
                        <div style="padding: 20px;">
                            <h2>Cảm ơn bạn đã đặt hàng!</h2>
                            <p>Xin chào <strong>${orderData.customerName}</strong>,</p>
                            <p>Chúng tôi đã nhận được đơn hàng của bạn và đang tiến hành xử lý. Dưới đây là thông tin chi tiết đơn hàng của bạn:</p>
                            
                            <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                                <p style="margin: 0 0 10px 0;"><strong>Mã đơn hàng:</strong> <span style="color: #ea580c; font-weight: bold;">#${orderData.orderId}</span></p>
                                <p style="margin: 0 0 10px 0;"><strong>Địa chỉ giao hàng:</strong> ${orderData.shippingAddress}</p>
                                <p style="margin: 0 0 10px 0;"><strong>Số điện thoại:</strong> ${orderData.customerPhone}</p>
                                <p style="margin: 0;"><strong>Phương thức thanh toán:</strong> ${orderData.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng'}</p>
                            </div>

                            <h3 style="border-bottom: 2px solid #ea580c; padding-bottom: 5px;">Thành tiền</h3>
                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                                <thead>
                                    <tr style="background-color: #f8fafc;">
                                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #cbd5e1;">Sản phẩm</th>
                                        <th style="padding: 10px; text-align: center; border-bottom: 2px solid #cbd5e1;">SL</th>
                                        <th style="padding: 10px; text-align: right; border-bottom: 2px solid #cbd5e1;">Giá</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHtml}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Tổng cộng:</td>
                                        <td style="padding: 10px; text-align: right; font-weight: bold; color: #ea580c; font-size: 18px;">
                                            ${new Intl.NumberFormat('vi-VN').format(orderData.totalAmount)} đ
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>

                            <p style="color: #64748b; font-size: 14px;">Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email này hoặc gọi hotline miễn phí.</p>
                        </div>
                        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; color: #64748b; font-size: 12px;">
                            <p style="margin: 0;">© ${new Date().getFullYear()} TLECTRIC. All rights reserved.</p>
                            <p style="margin: 5px 0 0 0;">Bạn nhận được email này vì bạn vừa mua hàng tại hệ thống của chúng tôi.</p>
                        </div>
                    </div>
                `,
            };

            await transporter.sendMail(customerMailOptions);
        }

        return { success: true };
    } catch (error) {
        console.error("Error sending order emails:", error);
        return { success: false, error: "Failed to send emails" };
    }
}
