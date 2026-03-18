interface TSECandidate {
  name: string
  party: string
  votes: number
  percentage: number
  elected: boolean
}

interface TSEZoneResult {
  zone: string
  section: string
  candidate_name: string
  party: string
  votes: number
  percentage: number
}

interface TSECityData {
  candidates: TSECandidate[]
  total_votes: number
  zones: TSEZoneResult[]
}

interface TSEDataFile {
  election_year: number
  election_type: string
  cities: Record<string, TSECityData>
}

interface ElectionHistoryRow {
  workspace_id: string
  election_year: number
  election_type: string
  city: string
  state: string
  candidate_name: string
  party: string
  votes_received: number
  total_votes: number
  vote_percentage: number
  zone: string
  section: string
  neighborhood: string | null
  is_elected: boolean
}

export function transformTSEData(
  cityData: TSECityData,
  workspaceId: string,
  electionYear: number,
  electionType: string,
  city: string,
  state: string
): ElectionHistoryRow[] {
  const rows: ElectionHistoryRow[] = []

  for (const candidate of cityData.candidates) {
    rows.push({
      workspace_id: workspaceId,
      election_year: electionYear,
      election_type: electionType,
      city,
      state: state.toUpperCase(),
      candidate_name: candidate.name,
      party: candidate.party,
      votes_received: candidate.votes,
      total_votes: cityData.total_votes,
      vote_percentage: candidate.percentage,
      zone: 'Consolidado',
      section: 'Consolidado',
      neighborhood: null,
      is_elected: candidate.elected,
    })
  }

  for (const zone of cityData.zones) {
    const candidate = cityData.candidates.find((c) => c.name === zone.candidate_name)
    rows.push({
      workspace_id: workspaceId,
      election_year: electionYear,
      election_type: electionType,
      city,
      state: state.toUpperCase(),
      candidate_name: zone.candidate_name,
      party: zone.party,
      votes_received: zone.votes,
      total_votes: cityData.total_votes,
      vote_percentage: zone.percentage,
      zone: zone.zone,
      section: zone.section,
      neighborhood: null,
      is_elected: candidate?.elected ?? false,
    })
  }

  return rows
}

function normalizeCityKey(city: string, state: string): string {
  return `${normalizeString(city)}-${state.toUpperCase()}`
}

function normalizeString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z\s-]/g, '')
    .trim()
}

export function findCityInData(
  data: TSEDataFile,
  city: string,
  state: string
): TSECityData | null {
  const normalizedKey = normalizeCityKey(city, state)

  for (const [key, cityData] of Object.entries(data.cities)) {
    const normalizedDataKey = normalizeCityKey(
      key.split('-')[0],
      key.split('-')[1] || ''
    )
    if (normalizedDataKey === normalizedKey) {
      return cityData
    }
  }

  return null
}

export function getAvailableYears(electionType: string): number[] {
  if (electionType === 'municipal') return [2020, 2024]
  if (electionType === 'general' || electionType === 'estadual' || electionType === 'federal') return [2022]
  return [2020, 2022, 2024]
}

export type { TSEDataFile, TSECityData, ElectionHistoryRow }
