import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Loader2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { formatNumber } from '../lib/utils';
import type { PurchaseTransactionItemData } from '../model/purchase_transaction';
import type { SalesTransactionItemData } from '../model/sales_transaction';

interface ViewItemsDialogProps {
    open: boolean;
    onClose: () => void;
    items: PurchaseTransactionItemData[] | SalesTransactionItemData[];
    title: string;
    totalAmount: number;
    partnerLabel?: string;
    partnerName?: string;
    onPrint?: () => Promise<void> | void;
}

export function ViewItemsDialog({ open, onClose, items, title, totalAmount, partnerLabel, partnerName, onPrint }: ViewItemsDialogProps) {
    const [isPrinting, setIsPrinting] = useState(false);

    const handlePrint = async () => {
        if (!onPrint) return;
        setIsPrinting(true);
        try {
            await onPrint();
        } catch (err) {
            console.error('Print failed:', err);
            toast.error(err instanceof Error ? err.message : 'Gagal mencetak struk.');
        } finally {
            setIsPrinting(false);
        }
    };
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-[85vw] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Partner Info */}
                    {partnerLabel && partnerName && (
                        <div className="bg-muted/30 p-4 rounded-lg border">
                            <span className="text-sm text-muted-foreground mr-2">{partnerLabel}</span>
                            <span className="font-semibold">{partnerName}</span>
                        </div>
                    )}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground">Jenis Barang</div>
                            <div className="text-2xl font-semibold">{items.length}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground">Total Jumlah</div>
                            <div className="text-2xl font-semibold">{formatNumber(totalQuantity)}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground">Total Harga</div>
                            <div className="text-2xl font-semibold text-primary">
                                Rp {formatNumber(totalAmount)}
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">No</TableHead>
                                    <TableHead>Kode Barang</TableHead>
                                    <TableHead>Nama Barang</TableHead>
                                    <TableHead className="text-right">Jumlah</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead className="text-right">Harga/Unit</TableHead>
                                    <TableHead className="text-right">Subtotal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                            Tidak ada item
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{index + 1}</TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {item.inventory_id || item.item_code_snapshot || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {item.inventory?.nama_barang || item.item_name_snapshot || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatNumber(item.quantity)}
                                            </TableCell>
                                            <TableCell>{item.quantity_unit}</TableCell>
                                            <TableCell className="text-right">
                                                Rp {formatNumber(item.price_per_unit)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                Rp {formatNumber(item.subtotal)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {onPrint && (
                        <DialogFooter className="mt-4 flex justify-end">
                            <Button
                                variant="outline"
                                onClick={handlePrint}
                                disabled={isPrinting}
                            >
                                {isPrinting
                                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    : <Printer className="mr-2 h-4 w-4" />}
                                Cetak
                            </Button>
                        </DialogFooter>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
