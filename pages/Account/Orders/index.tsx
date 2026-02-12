import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function OrdersPage() {
    return (
        <div className="space-y-6">
            <Card className="bg-[#1e2330] border-0 text-white">
                <CardHeader>
                    <CardTitle className="text-sm font-medium uppercase text-gray-400">
                        Lịch sử đơn hàng
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-gray-700">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-gray-700 hover:bg-transparent">
                                    <TableHead className="text-gray-400">Mã đơn</TableHead>
                                    <TableHead className="text-gray-400">Sản phẩm</TableHead>
                                    <TableHead className="text-gray-400">Ngày mua</TableHead>
                                    <TableHead className="text-gray-400">Trạng thái</TableHead>
                                    <TableHead className="text-right text-gray-400">Tổng tiền</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="border-gray-700 hover:bg-[#2a3040]">
                                    <TableCell className="font-medium text-white">#ORD-001</TableCell>
                                    <TableCell className="text-white">Spotify Premium 1 Năm</TableCell>
                                    <TableCell className="text-gray-400">11/02/2026</TableCell>
                                    <TableCell><Badge className="bg-green-600">Hoàn thành</Badge></TableCell>
                                    <TableCell className="text-right text-[#00b4d8] font-bold">299.000 đ</TableCell>
                                </TableRow>
                                <TableRow className="border-gray-700 hover:bg-[#2a3040]">
                                    <TableCell className="font-medium text-white">#ORD-002</TableCell>
                                    <TableCell className="text-white">Youtube Premium 6 Tháng</TableCell>
                                    <TableCell className="text-gray-400">10/02/2026</TableCell>
                                    <TableCell><Badge variant="secondary" className="bg-yellow-600 text-white hover:bg-yellow-700">Đang xử lý</Badge></TableCell>
                                    <TableCell className="text-right text-[#00b4d8] font-bold">150.000 đ</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
