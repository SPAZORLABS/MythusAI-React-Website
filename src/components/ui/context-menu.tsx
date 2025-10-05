import React, { Fragment } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { cn } from '@/lib/utils'

export interface ContextMenuProps {
  children: React.ReactNode
  trigger?: React.ReactNode
  className?: string
}

export interface ContextMenuTriggerProps {
  children: React.ReactNode
  className?: string
}

export interface ContextMenuContentProps {
  children: React.ReactNode
  className?: string
  align?: 'start' | 'end'
}

export interface ContextMenuItemProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  destructive?: boolean
}

export interface ContextMenuSeparatorProps {
  className?: string
}

const ContextMenu = ({ children, trigger, className }: ContextMenuProps) => {
  return (
    <Menu as="div" className={cn("relative inline-block", className)}>
      {trigger}
      {children}
    </Menu>
  )
}

const ContextMenuTrigger = ({ children, className }: ContextMenuTriggerProps) => {
  return (
    <MenuButton className={cn("outline-none focus:outline-none", className)}>
      {children}
    </MenuButton>
  )
}

const ContextMenuContent = ({ children, className, align = 'end' }: ContextMenuContentProps) => {
  return (
    <Transition
      as={Fragment}
      enter="transition ease-out duration-200"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-150"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <MenuItems className={cn(
        "absolute z-50 mt-1 min-w-[12rem] overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-lg",
        "dark:border-gray-800 dark:bg-gray-900",
        align === 'end' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
        className
      )}>
        {children}
      </MenuItems>
    </Transition>
  )
}

const ContextMenuItem = ({ children, className, onClick, disabled, destructive }: ContextMenuItemProps) => {
  return (
    <MenuItem>
      {({ active }) => (
        <button
          className={cn(
            "relative flex w-full cursor-default select-none items-center rounded-md px-3 py-2 text-sm outline-none transition-colors",
            "focus:bg-gray-100 focus:text-gray-900",
            "dark:focus:bg-gray-800 dark:focus:text-gray-100",
            active && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100",
            !active && "text-gray-700 dark:text-gray-300",
            destructive && !disabled && "text-red-600 focus:text-red-900 dark:text-red-400 dark:focus:text-red-300",
            destructive && active && "bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-300",
            disabled && "pointer-events-none opacity-50",
            className
          )}
          onClick={onClick}
          disabled={disabled}
        >
          {children}
        </button>
      )}
    </MenuItem>
  )
}

const ContextMenuSeparator = ({ className }: ContextMenuSeparatorProps) => {
  return (
    <div className={cn("mx-1 my-1 h-px bg-gray-200 dark:bg-gray-800", className)} />
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
}