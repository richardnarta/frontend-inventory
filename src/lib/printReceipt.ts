import { format } from 'date-fns';
import type { SalesTransactionData } from '@/model/sales_transaction';
import type { QuantityUnit } from '@/model/inventory';

const STORE_NAME = 'HidupBaru';

const UNIT_SHORT: Record<QuantityUnit, string> = {
    Bal: 'BAL',
    Batang: 'BTG',
    Buah: 'BH',
    Dus: 'DUS',
    Gulung: 'GL',
    Kilogram: 'KG',
    Kotak: 'KTK',
    Lembar: 'LBR',
    Lusin: 'LS',
    Meter: 'M',
    Ons: 'ONS',
    Pak: 'PAK',
    Pasang: 'PS',
    Pcs: 'PCS',
    Sak: 'SAK',
};

const shortUnit = (unit?: string | null): string => {
    if (!unit) return '';
    return UNIT_SHORT[unit as QuantityUnit] ?? unit;
};

const fmtNum = (n: number): string =>
    new Intl.NumberFormat('id-ID').format(n);

const escapeHtml = (s: string): string =>
    s.replace(/[&<>"']/g, (c) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[c]!));

// NOTE on top margin:
// The blank space at the top of a printed receipt is the FK80 driver's fixed
// top-of-form offset — content placed there by CSS gets *clipped*, not pushed
// down into the visible area. So we can't fix this via CSS.
// To reduce the wasted leading paper, configure the printer queue's
// "Top Margin" / "Form feed" settings via Printer Properties on Windows.
const RECEIPT_PRINT_CSS = `
@page { size: 80mm auto; margin: 0; }
@media print {
    html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
    }
    /* Hide every direct child of body EXCEPT the print receipt */
    body > *:not(.print-receipt) { display: none !important; }
}
.print-receipt {
    display: none;
}
@media print {
    .print-receipt {
        display: block !important;
        width: 80mm;
        padding: 1mm 1.5mm 2mm 1.5mm;
        box-sizing: border-box;
        font-family: 'Consolas', 'Courier New', monospace;
        font-size: 12px;
        color: #000;
        line-height: 1.3;
    }
    .print-receipt .center { text-align: center; }
    .print-receipt .right  { text-align: right; }
    .print-receipt .bold   { font-weight: 700; }
    .print-receipt .h1     { font-size: 17px; font-weight: 800; letter-spacing: 1px; }
    .print-receipt .sep-double { border-top: 2px solid #000; margin: 3px 0; }
    .print-receipt .sep-single { border-top: 1px dashed #000; margin: 3px 0; }
    .print-receipt table { width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed; }
    .print-receipt td { padding: 0; vertical-align: top; word-wrap: break-word; }
    .print-receipt .info td:first-child { width: 22mm; }
    .print-receipt .item-name { font-weight: 700; padding-top: 2px; }
    .print-receipt .item-row td:first-child { padding-left: 4px; }
    .print-receipt .item-row td:last-child  { width: 24mm; text-align: right; font-weight: 700; }
    .print-receipt .totals td:first-child { font-weight: 700; }
    .print-receipt .totals td:last-child  { text-align: right; }
    .print-receipt .grand-total { font-size: 14px; font-weight: 800; text-align: right; padding: 5px 0; }
    .print-receipt .footer { font-size: 11px; text-align: center; margin-top: 4px; }
}
`;

const STYLE_ID = 'hidupbaru-print-receipt-style';

interface BuildOptions {
    title?: string;
    storeName?: string;
}

const buildSalesReceiptBody = (
    trx: SalesTransactionData,
    opts: BuildOptions = {}
): string => {
    const storeName = opts.storeName ?? STORE_NAME;

    const dateStr = format(new Date(trx.transaction_date), 'dd-MM-yyyy HH:mm');
    const buyerName = trx.buyer?.name ?? 'Umum';

    const totalQty = trx.items.reduce((s, it) => s + it.quantity, 0);

    const itemRows = trx.items
        .map((it) => {
            const name = escapeHtml(
                it.inventory?.nama_barang ?? it.item_name_snapshot ?? it.inventory_id ?? '-'
            );
            const unit = shortUnit(it.quantity_unit);
            const qtyLine = `${fmtNum(it.quantity)} ${unit} x ${fmtNum(it.price_per_unit)}`;
            return `
                <tr><td colspan="2" class="item-name">${name}</td></tr>
                <tr class="item-row"><td>${qtyLine}</td><td>${fmtNum(it.subtotal)}</td></tr>
            `;
        })
        .join('');

    const notesBlock = trx.notes
        ? `<div class="sep-single"></div><div style="font-size:11px"><b>Catatan:</b> ${escapeHtml(trx.notes)}</div>`
        : '';

    return `
<div class="center h1">${escapeHtml(storeName)}</div>
<div class="sep-double"></div>
<table class="info">
    <tr><td>No Trx</td><td>: #${trx.id}</td></tr>
    <tr><td>Tanggal</td><td>: ${dateStr}</td></tr>
    <tr><td>Pembeli</td><td>: ${escapeHtml(buyerName)}</td></tr>
</table>
<div class="sep-single"></div>
<table class="items">${itemRows}</table>
<div class="sep-single"></div>
<table class="totals">
    <tr><td>Total Item</td><td>${trx.items.length} jenis</td></tr>
    <tr><td>Total Qty</td><td>${fmtNum(totalQty)}</td></tr>
</table>
<div class="sep-double"></div>
<div class="grand-total">TOTAL: Rp ${fmtNum(trx.total_amount)}</div>
<div class="sep-double"></div>
${notesBlock}
<div class="footer">Terima kasih atas kunjungan Anda<br>~ ${escapeHtml(storeName)} ~</div>
<div style="height: 6mm;"></div>
`;
};

const ensureReceiptStyle = (): void => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = RECEIPT_PRINT_CSS;
    document.head.appendChild(style);
};

/**
 * Print a receipt by injecting it into the main document with a print-only
 * stylesheet. Main-document `@page` rules ARE reliably respected by Chrome
 * (unlike iframe @page rules, which Chrome often ignores).
 *
 * Works silently when Chrome is launched with --kiosk-printing flag.
 */
const printReceiptDom = (bodyHtml: string): Promise<void> =>
    new Promise((resolve) => {
        ensureReceiptStyle();

        const container = document.createElement('div');
        container.className = 'print-receipt';
        container.innerHTML = bodyHtml;
        document.body.appendChild(container);

        const cleanup = () => {
            container.remove();
            window.removeEventListener('afterprint', onAfterPrint);
            resolve();
        };
        const onAfterPrint = () => {
            // Small delay to ensure cleanup happens after the dialog actually closes
            setTimeout(cleanup, 100);
        };
        window.addEventListener('afterprint', onAfterPrint);

        // Defer print so layout settles
        setTimeout(() => {
            window.print();
            // Safety net cleanup in case afterprint never fires (e.g. Firefox quirks)
            setTimeout(() => {
                if (document.body.contains(container)) cleanup();
            }, 60_000);
        }, 50);
    });

export const printSalesReceipt = (
    trx: SalesTransactionData,
    opts?: BuildOptions
): Promise<void> => printReceiptDom(buildSalesReceiptBody(trx, opts));
