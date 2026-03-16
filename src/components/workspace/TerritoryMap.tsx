'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { TerritorialInteraction } from '@/types/database'

interface TerritoryMapProps {
  interactions: TerritorialInteraction[]
}

const TYPE_COLORS: Record<string, string> = {
  visit: '#3B82F6',
  event: '#FFD100',
  canvassing: '#22C55E',
  meeting: '#8B5CF6',
}

const FLORIANOPOLIS_CENTER: [number, number] = [-48.55, -27.59]

export default function TerritoryMap({ interactions }: TerritoryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  useEffect(() => {
    if (!token || !containerRef.current || mapRef.current) return

    mapboxgl.accessToken = token

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: FLORIANOPOLIS_CENTER,
      zoom: 12,
    })

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [token])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const onReady = () => {
      const existingMarkers = document.querySelectorAll('.territory-marker')
      existingMarkers.forEach((el) => el.remove())

      for (const interaction of interactions) {
        const color = TYPE_COLORS[interaction.interaction_type] ?? '#6B7280'

        const el = document.createElement('div')
        el.className = 'territory-marker'
        el.style.width = '14px'
        el.style.height = '14px'
        el.style.borderRadius = '50%'
        el.style.backgroundColor = color
        el.style.border = '2px solid white'
        el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)'
        el.style.cursor = 'pointer'

        const popup = new mapboxgl.Popup({ offset: 12, closeButton: false })
          .setHTML(`
            <div style="font-family:sans-serif;font-size:12px;max-width:180px">
              <strong>${interaction.neighborhood}</strong><br/>
              <span style="text-transform:capitalize">${interaction.interaction_type}</span><br/>
              <span style="color:#888">${new Date(interaction.recorded_at).toLocaleDateString('pt-BR')}</span>
              ${interaction.notes ? `<br/><span>${interaction.notes}</span>` : ''}
            </div>
          `)

        new mapboxgl.Marker({ element: el })
          .setLngLat([interaction.longitude, interaction.latitude])
          .setPopup(popup)
          .addTo(map)
      }
    }

    if (map.loaded()) {
      onReady()
    } else {
      map.on('load', onReady)
    }
  }, [interactions])

  if (!token) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-dark-50 rounded-lg border border-border/50">
        <p className="font-body text-sm text-dark-300 text-center px-4">
          Configure <code className="font-mono text-xs bg-dark-100 px-1.5 py-0.5 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> para visualizar o mapa territorial.
        </p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-[400px] rounded-lg overflow-hidden"
    />
  )
}
