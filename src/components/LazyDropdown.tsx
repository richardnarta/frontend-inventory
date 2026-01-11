import React, { useState, useEffect } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem, CommandGroup } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { ChevronsUpDown, Check, Loader2 } from "lucide-react"
import { useDebounce } from "@/hooks/debouncing"

export type DropdownItem = {
    value: string
    label: string
}

interface LazyDropdownProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    className?: string
    onSearch: (query: string) => Promise<DropdownItem[]>
    disabled?: boolean
}

export function LazyDropdown({
    value,
    onChange,
    placeholder = "Pilih item...",
    searchPlaceholder = "Cari item...",
    emptyMessage = "Item tidak ditemukan.",
    className,
    onSearch,
    disabled = false,
}: LazyDropdownProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [items, setItems] = useState<DropdownItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedLabel, setSelectedLabel] = useState<string>("")

    const debouncedSearch = useDebounce(searchQuery, 300)

    // Fetch items when search query changes or when dropdown opens
    useEffect(() => {
        const fetchItems = async () => {
            if (!open) return

            setIsLoading(true)
            try {
                const results = await onSearch(debouncedSearch)
                setItems(results)
            } catch (error) {
                console.error("Failed to fetch items:", error)
                setItems([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchItems()
    }, [debouncedSearch, open, onSearch])

    // Update selected label when value changes
    useEffect(() => {
        const fetchSelectedLabel = async () => {
            if (value && !selectedLabel) {
                try {
                    const results = await onSearch("")
                    const found = results.find((item) => item.value === value)
                    if (found) {
                        setSelectedLabel(found.label)
                    }
                } catch (error) {
                    console.error("Failed to fetch selected label:", error)
                }
            }
        }

        fetchSelectedLabel()
    }, [value, onSearch, selectedLabel])

    const displayLabel = selectedLabel || placeholder

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn("justify-between w-full", !value ? "font-normal text-muted-foreground" : "", className)}
                >
                    <span className="truncate">
                        {displayLabel}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                    <CommandList>
                        {isLoading ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : items.length === 0 ? (
                            <CommandEmpty>{emptyMessage}</CommandEmpty>
                        ) : (
                            <CommandGroup>
                                {items.map((item) => (
                                    <CommandItem
                                        key={item.value}
                                        value={item.value}
                                        onSelect={() => {
                                            onChange(item.value === value ? "" : item.value)
                                            setSelectedLabel(item.value === value ? "" : item.label)
                                            setOpen(false)
                                        }}
                                    >
                                        <span className="flex-grow truncate">{item.label}</span>
                                        <Check
                                            className={cn(
                                                "ml-auto h-4 w-4 flex-shrink-0",
                                                value === item.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
