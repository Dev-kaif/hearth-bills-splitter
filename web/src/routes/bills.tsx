import { createFileRoute } from '@tanstack/react-router'
import { BillsPage } from '../components/pages/BillsPage'
export const Route = createFileRoute('/bills')({ component: BillsPage })
