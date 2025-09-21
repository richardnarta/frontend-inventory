import { useState, useMemo, useEffect } from 'react';
import type { KnitFormulaData, KnitFormulaCreatePayload, KnitFormulaUpdatePayload, FormulaItem } from '../model/knit_formula';
import type { DropdownItem } from './Dropdown';

import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Save, Loader2, Plus, X } from 'lucide-react';
import { parseIndonesianNumber, formatNumber } from '../lib/utils';
import { Dropdown } from './Dropdown';

type RecipeYarn = {
    id: number; 
    inventory_id: string;
    quantity: string; // Keep as string to handle formatted numbers
};

type CreateUpdateKnitFormulaFormDialogProps = {
    formula?: KnitFormulaData;
    onSave: (data: KnitFormulaCreatePayload | KnitFormulaUpdatePayload) => Promise<void> | void;
    closeDialog: () => void;
    fabrics: DropdownItem[];
    threads: DropdownItem[];
    isFabricsLoading: boolean;
    isThreadsLoading: boolean;
};

const formatNumericInput = (value: string): string => {
    let cleanedValue = value.replace(/[^\d,]/g, '');
    const parts = cleanedValue.split(',');
    if (parts.length > 2) cleanedValue = parts[0] + ',' + parts.slice(1).join('');
    if (cleanedValue === '') {
        return '';
    }
    const [integerPart, decimalPart] = cleanedValue.split(',');
    const formattedInteger = new Intl.NumberFormat('id-ID').format(Number(integerPart.replace(/\./g, '')));
    let finalValue = formattedInteger;
    if (decimalPart !== undefined) finalValue += ',' + decimalPart;
    return finalValue;
};

export const CreateUpdateKnitFormulaFormDialog = ({
    formula,
    onSave,
    closeDialog,
    fabrics,
    threads,
    isFabricsLoading,
    isThreadsLoading,
}: CreateUpdateKnitFormulaFormDialogProps) => {
    
    const [selectedFabricId, setSelectedFabricId] = useState('');
    const [newFabricName, setNewFabricName] = useState('');
    const [productionWeight, setProductionWeight] = useState('0');
    const [recipeYarns, setRecipeYarns] = useState<RecipeYarn[]>([{ id: Date.now(), inventory_id: '', quantity: '0' }]);
    const [isSaving, setIsSaving] = useState(false);

    // --- FIX: useEffect now handles both setting state for 'edit' and resetting for 'add' ---
    useEffect(() => {
        if (formula) {
            // Populate form for editing an existing formula
            setSelectedFabricId(formula.product.id);
            setProductionWeight(formatNumber(formula.production_weight));
            const initialYarns = formula.formula.map((item, index) => ({
                id: Date.now() + index,
                inventory_id: item.inventory_id,
                quantity: formatNumber(item.amount_kg),
            }));
            setRecipeYarns(initialYarns);
            setNewFabricName(''); // Ensure new fabric name is cleared
        } else {
            // Reset form for adding a new formula
            setSelectedFabricId('');
            setNewFabricName('');
            setProductionWeight('0');
            setRecipeYarns([{ id: Date.now(), inventory_id: '', quantity: '0' }]);
        }
    }, [formula]);

    const handleProductSelectionChange = (value: string) => {
        setSelectedFabricId(value);
        if (value) setNewFabricName('');
    };

    const handleNewProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewFabricName(e.target.value);
        if (e.target.value) setSelectedFabricId('');
    };

    const addYarnToRecipe = () => setRecipeYarns(prev => [...prev, { id: Date.now(), inventory_id: '', quantity: '0' }]);
    const removeYarnFromRecipe = (id: number) => setRecipeYarns(prev => prev.filter(yarn => yarn.id !== id));
    
    const handleRecipeChange = (id: number, field: 'inventory_id' | 'quantity', value: string) => {
        setRecipeYarns(prev => prev.map(yarn => {
            if (yarn.id === id) {
                const updatedValue = field === 'quantity' ? formatNumericInput(value) : value;
                return { ...yarn, [field]: updatedValue };
            }
            return yarn;
        }));
    };

    const isFormInvalid = useMemo(() => {
        if (!selectedFabricId && !newFabricName) return true;
        if ((parseIndonesianNumber(productionWeight) || 0) <= 0) return true;
        if (recipeYarns.length === 0) return true;
        return recipeYarns.some(yarn => !yarn.inventory_id || (parseIndonesianNumber(yarn.quantity) || 0) <= 0);
    }, [selectedFabricId, newFabricName, productionWeight, recipeYarns]);

    const handleSubmit = async () => {
        setIsSaving(true);
        
        const finalFormula: FormulaItem[] = recipeYarns.map(yarn => ({
            inventory_id: yarn.inventory_id,
            inventory_name: threads.find(t => t.value === yarn.inventory_id)?.label || 'N/A',
            amount_kg: parseIndonesianNumber(yarn.quantity) || 0,
        }));

        let payload: KnitFormulaCreatePayload | KnitFormulaUpdatePayload;
        const commonData = {
            formula: finalFormula,
            production_weight: parseIndonesianNumber(productionWeight) || 0,
        };

        if (formula) {
            payload = commonData;
        } else {
            if (newFabricName) {
                payload = { ...commonData, new_product: true, product_name: newFabricName };
            } else {
                payload = { ...commonData, new_product: false, product_id: selectedFabricId };
            }
        }
        
        await onSave(payload);
        closeDialog();
        setIsSaving(false);
    };

    return (
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader><DialogTitle>{formula ? 'Edit Formula Rajut' : 'Tambah Formula Rajut Baru'}</DialogTitle></DialogHeader>
            <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-6">
                <Card>
                    <CardHeader><CardTitle>Produk Hasil (Kain)</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Pilih Kain yang Sudah Ada</Label>
                            <Dropdown items={fabrics} value={selectedFabricId} onChange={handleProductSelectionChange} placeholder="Pilih kain..." isLoading={isFabricsLoading} disabled={!!newFabricName || !!formula} />
                        </div>
                        <div className="flex items-center"><div className="flex-grow border-t"></div><span className="flex-shrink mx-4 text-sm text-muted-foreground">atau</span><div className="flex-grow border-t"></div></div>
                        <div className="space-y-2">
                            <Label htmlFor="new-product-name">Buat Kain Baru</Label>
                            <Input id="new-product-name" placeholder="e.g., Kain Katun Super" value={newFabricName} onChange={handleNewProductNameChange} disabled={!!selectedFabricId || !!formula} />
                        </div>
                        <div className="space-y-2 pt-2">
                            <Label htmlFor="production-weight">Hasil Produksi (Kg)</Label>
                            <Input id="production-weight" value={productionWeight} onChange={e => setProductionWeight(formatNumericInput(e.target.value))} placeholder="e.g., 100" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Bahan Resep (Benang)</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            {recipeYarns.map((item) => (
                                <div key={item.id} className="flex items-end gap-2">
                                    <div className="flex-1 space-y-2">
                                        <Label>Pilih Benang</Label>
                                        <Dropdown items={threads} value={item.inventory_id} onChange={(value) => handleRecipeChange(item.id, 'inventory_id', value)} placeholder="Pilih benang..." isLoading={isThreadsLoading} />
                                    </div>
                                    <div className="w-40 space-y-2">
                                        <Label>Jumlah (Kg)</Label>
                                        <Input type="text" inputMode="decimal" placeholder="e.g., 50" value={item.quantity} onChange={e => handleRecipeChange(item.id, 'quantity', e.target.value)} />
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeYarnFromRecipe(item.id)} disabled={recipeYarns.length <= 1}><X className="h-4 w-4 text-red-500"/></Button>
                                </div>
                            ))}
                        </div>
                         <Button variant="outline" onClick={addYarnToRecipe}><Plus className="mr-2 h-4 w-4"/> Tambah Benang</Button>
                    </CardContent>
                </Card>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>Batal</Button>
                <Button onClick={handleSubmit} disabled={isSaving || isFormInvalid}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Simpan Formula
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

