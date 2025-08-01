"use client"

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"



export type ComboboxItem = {
  value: string;
  label: string;
}

export interface ComboboxProps {
  items: ComboboxItem[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  buttonClassName?: string;
  modalPopover?: boolean;
  }

export function Combobox({ items, value, onChange, placeholder, buttonClassName, modalPopover = true }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  React.useEffect(() => {
    if (!open) setInputValue("")
  }, [open])

  const lowerInput = inputValue.trim().toLowerCase()
  const filteredItems = inputValue
    ? items.filter((item) =>
        item.label.toLowerCase().includes(lowerInput) ||
        item.value.toLowerCase().includes(lowerInput)
      )
    : items
  const isCustom =
    inputValue &&
    !items.some(
      (item) =>
        item.value.toLowerCase() === lowerInput ||
        item.label.toLowerCase() === lowerInput
    )

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modalPopover}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("min-w-[200px] justify-between h-8", buttonClassName)}
        >
          {value
            ? (
                items.find((item) => item.value === value)
                  ? items.find((item) => item.value === value)!.label
                  : <span className="text-foreground">{value}</span>
              )
            : <span className="text-muted-foreground">{placeholder || "Keyword/Phrase"}</span>
          }
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 border-border/10">
        <Command className="pointer-events-auto [&_[cmdk-list]]:pointer-events-auto">
          <CommandInput
            placeholder={placeholder}
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isCustom) {
                onChange(inputValue)
                setOpen(false)
              }
            }}
          />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {filteredItems.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
              {isCustom && (
                <CommandItem
                  key="custom-value"
                  value={inputValue}
                  onSelect={() => {
                    onChange(inputValue)
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === inputValue ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {`Use "${inputValue}"`}
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}