import { type DropdownItem } from "@/components/Dropdown";


// --- MAPPER MODIFICATION ---
// Menambahkan 'statusKey' pada options untuk memetakan status dari data source.
export type MapOptions<T> = {
    valueKey: keyof T
    labelKey: keyof T
    statusKey?: keyof T // Kunci opsional untuk status
}

/**
 * Memetakan array objek ke format DropdownItem.
 * @param data - Array data yang akan dipetakan.
 * @param options - Opsi untuk menentukan kunci 'value', 'label', dan 'status'.
 * @returns Array DropdownItem yang sudah diformat.
 */
export function mapToDropdownItems<T extends object>(
    data: T[] | undefined | null,
    options: MapOptions<T>
): DropdownItem[] {
    if (!Array.isArray(data)) {
        return []
    }

    const { valueKey, labelKey, statusKey } = options

    return data.map((item) => ({
        value: String(item[valueKey]),
        label: String(item[labelKey]),
        // Jika statusKey diberikan, ambil nilainya dan konversi ke boolean.
        // Jika tidak, default-nya adalah false agar tidak merusak implementasi lama.
        status: statusKey ? Boolean(item[statusKey]) : false,
    }))
}