import type { ReactNode } from 'react'
import {
  Dialog as ShadcnDialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function Dialog({
  title,
  description,
  open,
  onClose,
  children,
}: {
  title: string
  description?: string
  open: boolean
  onClose: () => void
  children: ReactNode
}) {
  return (
    <ShadcnDialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="app-dialog-content">
        <DialogHeader className="dialog-heading">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </ShadcnDialog>
  )
}
