import { useState, useMemo } from 'react';
import type { PurchaseTransactionCreateRequest } from '../model/purchase_transaction';
import { type DropdownItem, Dropdown } from './Dropdown';
import { TransactionItemsTable, type TransactionItem } from './TransactionItemsTable';
import { Textarea } from '@/components/ui/textarea';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Save, Loader2 } from 'lucide-react';

type CreatePurchaseTransactionFormDialogProps = {
    onSave: (data: PurchaseTransactionCreateRequest) => Promise<void> | void;
    closeDialog: () => void;
    suppliers: DropdownItem[];
    isSuppliersLoading: boolean;
};

export const CreatePurchaseTransactionFormDialog = ({
    onSave,
    closeDialog,
    suppliers,
    isSuppliersLoading,
}: CreatePurchaseTransactionFormDialogProps) => {

    const initialFormState = useMemo(() => ({
        transaction_date: new Date(),
        supplier_id: '',
        notes: '',
        items: [] as TransactionItem[]
    }), []);

    const [formData, setFormData] = useState(initialFormState);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        if (!isFormValid) return;

        setIsSaving(true);
        try {
            const dataToSave: PurchaseTransactionCreateRequest = {
                transaction_date: format(formData.transaction_date, "yyyy-MM-dd'T'HH:mm:ss"),
                supplier_id: formData.supplier_id ? parseInt(formData.supplier_id, 10) : undefined,
                notes: formData.notes || undefined,
                items: formData.items.map(item => ({
                    inventory_id: item.inventory_id,
                    quantity: item.quantity,
                    price_per_unit: item.price_per_unit
                }))
            };
            await onSave(dataToSave);
            closeDialog();
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const isFormValid = formData.transaction_date && formData.items.length > 0 &&
        formData.items.every(item => item.quantity > 0 && item.price_per_unit > 0);

    return (
        <DialogContent className="w-[70vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Tambah Transaksi Pembelian Baru</DialogTitle>
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

                {/* Supplier */}
                <div className="space-y-2">
                    <Label htmlFor="supplier_id">Nama Supplier (opsional)</Label>
                    <Dropdown
                        items={suppliers}
                        value={formData.supplier_id}
                        onChange={(value) => setFormData(prev => ({ ...prev, supplier_id: value }))}
                        placeholder='Pilih supplier (opsional)'
                        searchPlaceholder='Cari supplier...'
                        emptyMessage='Supplier tidak ditemukan'
                        isLoading={isSuppliersLoading}
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
                        priceType="wholesale"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                    Kembali
                </Button>
                <Button onClick={handleSubmit} disabled={isSaving || !isFormValid}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Simpan
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};