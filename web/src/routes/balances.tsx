import { createFileRoute } from '@tanstack/react-router'
import { BalancesPage } from '../components/pages/BalancesPage'
export const Route = createFileRoute('/balances')({ component: BalancesPage })
