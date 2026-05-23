import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import type { SalesTransactionCreateRequest, SalesTransactionData } from '../model/sales_transaction';
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
import { printSalesReceipt } from '@/lib/printReceipt';

type CreateSalesTransactionFormDialogProps = {
    onSave: (data: SalesTransactionCreateRequest) => Promise<SalesTransactionData | void> | SalesTransactionData | void;
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
            const saved = await onSave(buildPayload());
            closeDialog();
            if (saved && 'id' in saved) {
                try {
                    await printSalesReceipt(saved);
                } catch (printErr) {
                    console.error('Print failed after save:', printErr);
                    toast.warning('Transaksi tersimpan, namun gagal mencetak struk. Anda dapat mencetak ulang dari menu Detail.');
                }
            }
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
