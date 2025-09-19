import React from "react"

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem, CommandGroup } from "@/components/ui/command"

import { cn } from "@/lib/utils"

import { ChevronsUpDown, Check, Loader2 } from "lucide-react"


export type DropdownItem = {
  value: string
  label: string
}

interface ReusableComboboxProps {
  items: DropdownItem[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  isLoading?: boolean
}

export function Dropdown({
  items,
  value,
  onChange,
  placeholder = "Pilih item...",
  searchPlaceholder = "Cari item...",
  emptyMessage = "Item tidak ditemukan.",
  className,
  isLoading = false,
}: ReusableComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedItemLabel =
    items.find((item) => item.value === value)?.label || placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between w-full", !value ? "font-normal text-muted-foreground" : "font-normal", className)}
        >
          {selectedItemLabel}
          {isLoading ? (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.label}
                    onSelect={() => {
                      onChange(item.value === value ? "" : item.value)
                      setOpen(false)
                    }}
                  >
                    {item.label}
                    <Check
                        className={cn(
                        "ml-auto h-4 w-4",
                        value === item.value ? "opacity-100" : "opacity-0"
                        )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  )
}
