import { type DropdownItem } from "@/components/Dropdown";


interface MapOptions<T> {
  valueKey: keyof T;
  labelKey: keyof T;
}

export function mapToDropdownItems<T extends object>(
  data: T[] | undefined | null,
  options: MapOptions<T>
): DropdownItem[] {
  if (!Array.isArray(data)) {
    return [];
  }

  const { valueKey, labelKey } = options;

  return data.map((item) => ({
    value: String(item[valueKey]),
    label: String(item[labelKey]),
  }));
}