import { request } from './client'
import type {
  Balance,
  BalancesResponse,
  BillsResponse,
  BillRecord,
  HomeDetails,
  HomesResponse,
  HomeSummary,
} from './types'

export const getHomes = async (): Promise<HomeSummary[]> =>
  (await request<HomesResponse>('/homes')).homes

export const getHome = (homeId: string) =>
  request<HomeDetails>(`/homes/${encodeURIComponent(homeId)}`)

export const getBills = async (homeId: string): Promise<BillRecord[]> =>
  (await request<BillsResponse>(`/homes/${encodeURIComponent(homeId)}/bills`)).bills

export const getBalances = async (homeId: string): Promise<Balance[]> =>
  (await request<BalancesResponse>(`/homes/${encodeURIComponent(homeId)}/balances`)).balances
