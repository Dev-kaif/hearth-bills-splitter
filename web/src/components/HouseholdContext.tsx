import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { useHome, useHomes } from '../hooks/useHouseholdQueries'
import type { HomeMember } from '../lib/api/types'

type HouseholdState = {
  homes: ReturnType<typeof useHomes>['data']
  home: ReturnType<typeof useHome>['data']
  homeId: string | undefined
  members: HomeMember[]
  activeMembers: HomeMember[]
  isHomesPending: boolean
  homesError: Error | null
  isHomePending: boolean
  homeError: Error | null
  selectHome: (homeId: string) => void
  refreshHomes: () => Promise<void>
  refreshHome: () => Promise<void>
}

const HouseholdContext = createContext<HouseholdState | null>(null)

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const homesQuery = useHomes()
  const [selectedHomeId, setSelectedHomeId] = useState<string>()
  const homeId = selectedHomeId ?? homesQuery.data?.[0]?.id
  const homeQuery = useHome(homeId)
  const members = homeQuery.data?.members ?? []

  const value = useMemo<HouseholdState>(
    () => ({
      homes: homesQuery.data,
      home: homeQuery.data,
      homeId,
      members,
      activeMembers: members.filter((member) => member.archivedAt === null),
      isHomesPending: homesQuery.isPending,
      homesError: homesQuery.error,
      isHomePending: Boolean(homeId) && homeQuery.isPending,
      homeError: homeQuery.error,
      selectHome: setSelectedHomeId,
      refreshHomes: async () => {
        await homesQuery.refetch()
      },
      refreshHome: async () => {
        await homeQuery.refetch()
      },
    }),
    [
      homesQuery.data,
      homesQuery.isPending,
      homesQuery.error,
      homesQuery.refetch,
      homeQuery.data,
      homeQuery.isPending,
      homeQuery.error,
      homeQuery.refetch,
      homeId,
      members,
    ],
  )

  return <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>
}

export function useHousehold() {
  const value = useContext(HouseholdContext)
  if (!value) throw new Error('HouseholdProvider is missing')
  return value
}
