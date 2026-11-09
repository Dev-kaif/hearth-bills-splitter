export type HomeSummary = {
  id: string
  name: string
  createdAt: string
}

export type HomeMember = {
  id: string
  name: string
  position: number
  archivedAt: string | null
}

export type HomeDetails = HomeSummary & {
  archivedAt: string | null
  members: HomeMember[]
}

export type CreatedHome = {
  id: string
  name: string
}

export type CreatedMember = {
  id: string
  homeId: string
  name: string
  position: number
}

export type BillShare = {
  id: string
  memberId: string
  memberName: string
  amountCents: number
  paidAt: string | null
}

export type CreatedBillShare = Omit<BillShare, 'memberName'>

export type CreatedBill = {
  id: string
  homeId: string
  title: string
  totalCents: number
  shares: CreatedBillShare[]
}

export type BillRecord = {
  id: string
  title: string
  totalCents: number
  createdAt: string
  shares: BillShare[]
}

export type PaidShare = {
  id: string
  memberId: string
  amountCents: number
  paidAt: string
}

export type Balance = {
  memberId: string
  name: string
  outstandingCents: number
}

export type HomesResponse = {
  homes: HomeSummary[]
}

export type BillsResponse = {
  bills: BillRecord[]
}

export type BalancesResponse = {
  balances: Balance[]
}

export type CreateHomeInput = {
  name: string
}

export type CreateMemberInput = {
  name: string
}

export type CreateBillInput = {
  title: string
  totalCents: number
}
