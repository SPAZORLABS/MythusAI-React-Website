import React, { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  placeholder?: string
  className?: string
  disabled?: boolean
}

export interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
}

export interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

export interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export interface SelectValueProps {
  placeholder?: string
  className?: string
}

const Select = ({ value, onValueChange, children, className, disabled }: SelectProps) => {
  return (
    <Listbox value={value} onChange={onValueChange} disabled={disabled}>
      <div className={cn("relative", className)}>
        {children}
      </div>
    </Listbox>
  )
}

const SelectTrigger = ({ children, className }: SelectTriggerProps) => {
  return (
    <Listbox.Button className={cn(
      "relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm",
      className
    )}>
      {children}
      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </span>
    </Listbox.Button>
  )
}

const SelectValue = ({ placeholder, className }: SelectValueProps) => {
  return (
    <span className={cn("block truncate", className)}>
      {placeholder}
    </span>
  )
}

const SelectContent = ({ children, className }: SelectContentProps) => {
  return (
    <Transition
      as={Fragment}
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <Listbox.Options className={cn(
        "absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm",
        className
      )}>
        {children}
      </Listbox.Options>
    </Transition>
  )
}

const SelectItem = ({ value, children, className, disabled }: SelectItemProps) => {
  return (
    <Listbox.Option
      className={({ active }) =>
        cn(
          "relative cursor-default select-none py-2 pl-10 pr-4",
          active ? 'bg-amber-100 text-amber-900' : 'text-gray-900',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )
      }
      value={value}
      disabled={disabled}
    >
      {({ selected, active }) => (
        <>
          <span className={cn("block truncate", selected ? "font-medium" : "font-normal")}>
            {children}
          </span>
          {selected ? (
            <span className={cn(
              "absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600",
              active ? "text-amber-600" : "text-amber-600"
            )}>
              <Check className="h-5 w-5" aria-hidden="true" />
            </span>
          ) : null}
        </>
      )}
    </Listbox.Option>
  )
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}
