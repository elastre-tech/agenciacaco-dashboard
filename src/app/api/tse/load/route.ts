import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { transformTSEData, findCityInData, getAvailableYears } from '@/lib/tse/transformer'
import type { TSEDataFile } from '@/lib/tse/transformer'

import data2020 from '@/lib/tse/data/2020-municipal.json'
import data2022 from '@/lib/tse/data/2022-general.json'
import data2024 from '@/lib/tse/data/2024-municipal.json'

const DATA_FILES: Record<string, TSEDataFile> = {
  '2020-municipal': data2020 as TSEDataFile,
  '2022-general': data2022 as TSEDataFile,
  '2024-municipal': data2024 as TSEDataFile,
}

export async function POST(request: NextRequest) {
  try {
    const { workspaceId, electionYears } = await request.json()

    if (!workspaceId || typeof workspaceId !== 'string') {
      return NextResponse.json({ error: 'workspace_id é obrigatório' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .select('city, state, election_type')
      .eq('id', workspaceId)
      .single()

    if (wsError || !workspace) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    const { city, state, election_type: electionType } = workspace

    if (!city || !state) {
      return NextResponse.json(
        { error: 'Workspace precisa ter cidade e estado configurados' },
        { status: 400 }
      )
    }

    const availableYears = electionYears ?? getAvailableYears(electionType)
    const yearsLoaded: number[] = []
    let totalRows = 0
    const errors: string[] = []

    await supabase
      .from('election_history')
      .delete()
      .eq('workspace_id', workspaceId)

    for (const year of availableYears) {
      const fileKey = getFileKey(year, electionType)
      const dataFile = DATA_FILES[fileKey]

      if (!dataFile) {
        errors.push(`Dados não disponíveis para ${year} (${electionType})`)
        continue
      }

      const cityData = findCityInData(dataFile, city, state)

      if (!cityData) {
        errors.push(`Dados não encontrados para ${city}/${state} em ${year}`)
        continue
      }

      const rows = transformTSEData(
        cityData,
        workspaceId,
        year,
        dataFile.election_type,
        city,
        state
      )

      if (rows.length > 0) {
        const { error: insertError } = await supabase
          .from('election_history')
          .insert(rows)

        if (insertError) {
          errors.push(`Erro ao inserir dados de ${year}: ${insertError.message}`)
          continue
        }

        yearsLoaded.push(year)
        totalRows += rows.length
      }
    }

    const availableCities = new Set<string>()
    for (const [, dataFile] of Object.entries(DATA_FILES)) {
      for (const cityKey of Object.keys(dataFile.cities)) {
        availableCities.add(cityKey)
      }
    }

    return NextResponse.json({
      success: yearsLoaded.length > 0,
      years_loaded: yearsLoaded,
      total_rows: totalRows,
      city: `${city}/${state}`,
      errors: errors.length > 0 ? errors : undefined,
      available_cities: yearsLoaded.length === 0 ? Array.from(availableCities).sort() : undefined,
    })
  } catch (err) {
    console.error('TSE load error:', err)
    return NextResponse.json({ error: 'Erro interno ao carregar dados do TSE' }, { status: 500 })
  }
}

function getFileKey(year: number, electionType: string): string {
  if (year === 2022) return '2022-general'
  if (year === 2020) return '2020-municipal'
  if (year === 2024) return '2024-municipal'
  if (electionType === 'municipal') return `${year}-municipal`
  return `${year}-general`
}

export async function GET() {
  const cities = new Set<string>()
  const years: number[] = []

  for (const [, data] of Object.entries(DATA_FILES)) {
    years.push(data.election_year)
    for (const cityKey of Object.keys(data.cities)) {
      cities.add(cityKey)
    }
  }

  return NextResponse.json({
    available_years: Array.from(new Set(years)).sort(),
    available_cities: Array.from(cities).sort(),
    data_files: Object.keys(DATA_FILES),
  })
}
