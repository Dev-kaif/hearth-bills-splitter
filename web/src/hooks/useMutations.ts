import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createBill, createHome, createMember, payShare } from '../lib/api/mutations'
import type { CreateBillInput, CreateHomeInput, CreateMemberInput } from '../lib/api/types'
import { householdKeys } from './useHouseholdQueries'

export function useCreateHome() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateHomeInput) => createHome(input),
    onSuccess: () => client.invalidateQueries({ queryKey: householdKeys.homes }),
  })
}

export function useCreateMember(homeId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateMemberInput) => createMember(homeId, input),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: householdKeys.home(homeId) }),
        client.invalidateQueries({ queryKey: householdKeys.balances(homeId) }),
      ]),
  })
}

export function useCreateBill(homeId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateBillInput) => createBill(homeId, input),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: householdKeys.bills(homeId) }),
        client.invalidateQueries({ queryKey: householdKeys.balances(homeId) }),
      ]),
  })
}

export function usePayShare(homeId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ billId, shareId, key }: { billId: string; shareId: string; key: string }) =>
      payShare(billId, shareId, key),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: householdKeys.bills(homeId) }),
        client.invalidateQueries({ queryKey: householdKeys.balances(homeId) }),
      ]),
  })
}
