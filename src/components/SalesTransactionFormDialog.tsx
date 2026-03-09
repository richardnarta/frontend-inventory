import { useState, useMemo } from 'react';
import type { SalesTransactionCreateRequest } from '../model/sales_transaction';
import { type DropdownItem, Dropdown } from './Dropdown';
import { TransactionItemsTable, type TransactionItem } from './TransactionItemsTable';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Save, Printer, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type CreateSalesTransactionFormDialogProps = {
    onSave: (data: SalesTransactionCreateRequest) => Promise<void> | void;
    closeDialog: () => void;
    buyers: DropdownItem[];
    isBuyersLoading: boolean;
};

export const CreateSalesTransactionFormDialog = ({
    onSave,
    closeDialog,
    buyers,
    isBuyersLoading,
}: CreateSalesTransactionFormDialogProps) => {

    const initialFormState = useMemo(() => ({
        transaction_date: new Date(),
        buyer_id: '',
        notes: '',
        items: [] as TransactionItem[]
    }), []);

    const [formData, setFormData] = useState(initialFormState);
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingAndPrinting, setIsSavingAndPrinting] = useState(false);

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            console.error('Failed to open print window. Please allow popups.');
            return;
        }

        const buyerName = buyers.find(b => b.value === formData.buyer_id)?.label || 'Umum';
        const dateStr = format(formData.transaction_date, "dd MMMM yyyy HH:mm");

        let itemsHtml = '';
        let total = 0;

        formData.items.forEach((item, index) => {
            const subtotal = item.quantity * item.price_per_unit;
            total += subtotal;
            const itemName = item.inventory?.nama_barang || item.inventory_id;

            itemsHtml += `
                <tr>
                    <td style="padding: 4px 0">${index + 1}</td>
                    <td style="padding: 4px 0">${itemName}</td>
                    <td style="padding: 4px 0; text-align: center;">${item.quantity}</td>
                    <td style="padding: 4px 0; text-align: right;">${item.price_per_unit.toLocaleString('id-ID')}</td>
                    <td style="padding: 4px 0; text-align: right;">${subtotal.toLocaleString('id-ID')}</td>
                </tr>
            `;
        });

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Struk Penjualan</title>
                <style>
                    body { font-family: 'Courier New', Courier, monospace; font-size: 14px; color: #000; margin: 0; padding: 20px; }
                    .ticket { width: 100%; max-width: 400px; margin: 0 auto; }
                    h2 { text-align: center; margin: 0 0 10px 0; }
                    .info { margin-bottom: 20px; font-size: 12px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
                    th { border-bottom: 1px dashed #000; border-top: 1px dashed #000; padding: 4px 0; text-align: left; }
                    .total-row { border-top: 1px dashed #000; font-weight: bold; }
                    .footer { text-align: center; font-size: 12px; margin-top: 20px; border-top: 1px dashed #000; padding-top: 10px;}
                </style>
            </head>
            <body>
                <div class="ticket">
                    <h2>B2B SETARA</h2>
                    <div class="info">
                        Tanggal: ${dateStr}<br/>
                        Pembeli: ${buyerName}<br/>
                        ${formData.notes ? `Catatan: ${formData.notes}` : ''}
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 10%">No</th>
                                <th style="width: 40%">Barang</th>
                                <th style="width: 10%; text-align: center;">Qty</th>
                                <th style="width: 20%; text-align: right;">Harga</th>
                                <th style="width: 20%; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                            <tr class="total-row">
                                <td colspan="4" style="padding: 8px 0; text-align: right;">TOTAL:</td>
                                <td style="padding: 8px 0; text-align: right;">Rp ${total.toLocaleString('id-ID')}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="footer">
                        Terima kasih atas kunjungan Anda
                    </div>
                </div>
                <script>
                    window.onload = () => {
                        window.print();
                        // Optional auto close for Chrome/Firefox, disabled here to allow users to save as PDF safely.
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    const buildPayload = (): SalesTransactionCreateRequest => ({
        transaction_date: format(formData.transaction_date, "yyyy-MM-dd'T'HH:mm:ss"),
        buyer_id: formData.buyer_id ? parseInt(formData.buyer_id, 10) : undefined,
        notes: formData.notes || undefined,
        items: formData.items.map(item => ({
            inventory_id: item.inventory_id,
            quantity: item.quantity,
            price_per_unit: item.price_per_unit
        }))
    });

    const handleSubmit = async () => {
        if (!isFormValid) return;
        setIsSaving(true);
        try {
            await onSave(buildPayload());
            closeDialog();
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmitAndPrint = async () => {
        if (!isFormValid) return;
        setIsSavingAndPrinting(true);
        try {
            await onSave(buildPayload());
            closeDialog();
            handlePrint(); // Placeholder called after successful save
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setIsSavingAndPrinting(false);
        }
    };

    const isFormValid = formData.transaction_date && formData.buyer_id && formData.items.length > 0 &&
        formData.items.every(item => item.quantity > 0 && item.price_per_unit > 0);

    return (
        <DialogContent className="w-[70vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Tambah Transaksi Penjualan Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
                {/* Transaction Date */}
                <div className="space-y-2">
                    <Label htmlFor="transaction_date">Tanggal Transaksi</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn("w-full justify-start text-left font-normal", !formData.transaction_date && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.transaction_date ? format(formData.transaction_date, "dd-MM-yyyy") : <span>Pilih tanggal</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={formData.transaction_date}
                                onSelect={(date) => setFormData(prev => ({ ...prev, transaction_date: date || new Date() }))}
                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Buyer */}
                <div className="space-y-2">
                    <Label htmlFor="buyer_id">Nama Pembeli <span className="text-red-500">*</span></Label>
                    <Dropdown
                        items={buyers}
                        value={formData.buyer_id}
                        onChange={(value) => setFormData(prev => ({ ...prev, buyer_id: value }))}
                        placeholder='Pilih pembeli...'
                        searchPlaceholder='Cari pembeli...'
                        emptyMessage='Pembeli tidak ditemukan'
                        isLoading={isBuyersLoading}
                        className="w-full"
                    />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <Label htmlFor="notes">Catatan (opsional)</Label>
                    <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Catatan transaksi (opsional)"
                        className="w-full"
                        rows={2}
                    />
                </div>

                {/* Items Table */}
                <div className="space-y-2">
                    <Label className="mb-4 block text-base font-semibold">Daftar Item</Label>
                    <TransactionItemsTable
                        items={formData.items}
                        onChange={(items) => setFormData(prev => ({ ...prev, items }))}
                        priceType="retail"
                        showPriceModeSelector={true}
                    />
                </div>
            </div>

            {/* Footer: Kembali (left), Simpan + Simpan dan Cetak (right) */}
            <DialogFooter className="flex flex-row justify-between items-center gap-2 sm:justify-between">
                <Button type="button" variant="outline" onClick={closeDialog}>
                    Kembali
                </Button>
                <div className="flex gap-2">
                    <Button
                        onClick={handleSubmit}
                        disabled={isSaving || isSavingAndPrinting || !isFormValid}
                    >
                        {isSaving
                            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            : <Save className="mr-2 h-4 w-4" />
                        }
                        Simpan
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={handleSubmitAndPrint}
                        disabled={isSaving || isSavingAndPrinting || !isFormValid}
                    >
                        {isSavingAndPrinting
                            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            : <Printer className="mr-2 h-4 w-4" />
                        }
                        Simpan dan Cetak
                    </Button>
                </div>
            </DialogFooter>
        </DialogContent>
    );
};
