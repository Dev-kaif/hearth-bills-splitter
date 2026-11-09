import { request } from './client'
import type {
  CreatedBill,
  CreatedHome,
  CreatedMember,
  CreateBillInput,
  CreateHomeInput,
  CreateMemberInput,
  PaidShare,
} from './types'

export const createHome = (input: CreateHomeInput) => {
  return request<CreatedHome>('/homes', { method: 'POST', body: JSON.stringify(input) })
}

export const createMember = (homeId: string, input: CreateMemberInput) => {
  return request<CreatedMember>(`/homes/${encodeURIComponent(homeId)}/members`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export const createBill = (homeId: string, input: CreateBillInput) => {
  return request<CreatedBill>(`/homes/${encodeURIComponent(homeId)}/bills`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export const payShare = (billId: string, shareId: string, idempotencyKey: string) => {
  return request<PaidShare>(
    `/bills/${encodeURIComponent(billId)}/shares/${encodeURIComponent(shareId)}/pay`,
    { method: 'POST', headers: { 'Idempotency-Key': idempotencyKey } },
  )
}
