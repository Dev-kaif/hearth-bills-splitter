import { useQuery } from '@tanstack/react-query'
import { getBalances, getBills, getHome, getHomes } from '../lib/api/queries'

export const householdKeys = {
  homes: ['homes'] as const,
  home: (homeId: string) => ['home', homeId] as const,
  bills: (homeId: string) => ['bills', homeId] as const,
  balances: (homeId: string) => ['balances', homeId] as const,
}

export function useHomes() {
  return useQuery({ queryKey: householdKeys.homes, queryFn: getHomes })
}

export function useHome(homeId: string | undefined) {
  return useQuery({
    queryKey: householdKeys.home(homeId ?? ''),
    queryFn: () => getHome(homeId ?? ''),
    enabled: Boolean(homeId),
  })
}

export function useBills(homeId: string | undefined) {
  return useQuery({
    queryKey: householdKeys.bills(homeId ?? ''),
    queryFn: () => getBills(homeId ?? ''),
    enabled: Boolean(homeId),
  })
}

export function useBalances(homeId: string | undefined) {
  return useQuery({
    queryKey: householdKeys.balances(homeId ?? ''),
    queryFn: () => getBalances(homeId ?? ''),
    enabled: Boolean(homeId),
  })
}
