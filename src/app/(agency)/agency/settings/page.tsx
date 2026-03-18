'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Loader2,
  Save,
  Upload,
  ChevronDown,
  ChevronUp,
  Globe,
  Check,
  AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/format'
import ChartCard from '@/components/ui/ChartCard'
import { SkeletonChart } from '@/components/ui/Skeleton'
import LivePreview from './LivePreview'

interface AgencyData {
  id: string
  name: string
  slug: string
  primary_color: string | null
  secondary_color: string | null
  background_color: string | null
  custom_domain: string | null
  logo_url: string | null
}

const DEFAULTS = {
  primary: '#FFD100',
  secondary: '#1A1A1A',
  background: '#F8F8F6',
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex-1">
      <label className="block text-xs font-medium text-dark-400 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className="w-10 h-10 rounded-full border-2 border-border shadow-sm cursor-pointer"
            style={{ backgroundColor: value }}
          />
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v)
          }}
          maxLength={7}
          className="w-24 px-3 py-2 rounded-lg border border-dark-100 bg-surface font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
    </div>
  )
}

export default function AgencySettingsPage() {
  const [agency, setAgency] = useState<AgencyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [dnsOpen, setDnsOpen] = useState(false)

  const [primaryColor, setPrimaryColor] = useState(DEFAULTS.primary)
  const [secondaryColor, setSecondaryColor] = useState(DEFAULTS.secondary)
  const [backgroundColor, setBackgroundColor] = useState(DEFAULTS.background)
  const [customDomain, setCustomDomain] = useState('')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const fetchAgency = useCallback(async () => {
    const supabase = createClient()

    try {
      const { data: userData } = await supabase.auth.getUser()
      let agencyData: AgencyData | null = null

      if (userData?.user) {
        const { data: membership } = await supabase
          .from('agency_members')
          .select('agency_id')
          .eq('profile_id', userData.user.id)
          .limit(1)
          .single()

        if (membership) {
          const { data } = await supabase
            .from('agencies')
            .select('*')
            .eq('id', membership.agency_id)
            .single()
          agencyData = data as AgencyData | null
        }
      }

      if (!agencyData) {
        const { data } = await supabase
          .from('agencies')
          .select('*')
          .limit(1)
          .single()
        agencyData = data as AgencyData | null
      }

      if (agencyData) {
        setAgency(agencyData)
        setPrimaryColor(agencyData.primary_color || DEFAULTS.primary)
        setSecondaryColor(agencyData.secondary_color || DEFAULTS.secondary)
        setBackgroundColor(agencyData.background_color || DEFAULTS.background)
        setCustomDomain(agencyData.custom_domain || '')
        setLogoPreview(agencyData.logo_url || null)
      }
    } catch {
      console.error('Failed to fetch agency data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAgency() }, [fetchAgency])

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!agency) return
    setSaving(true)
    setFeedback(null)

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('agencies')
        .update({
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          background_color: backgroundColor,
          custom_domain: customDomain.trim() || null,
        })
        .eq('id', agency.id)

      if (error) {
        setFeedback({ type: 'error', msg: 'Erro ao salvar configurações.' })
      } else {
        setFeedback({ type: 'success', msg: 'Configurações salvas com sucesso.' })
      }
    } catch {
      console.error('Failed to save settings')
      setFeedback({ type: 'error', msg: 'Erro inesperado ao salvar.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonChart />
        <SkeletonChart />
        <SkeletonChart />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-dark-700 mb-1">
          Configurações da Agência
        </h2>
        <p className="font-body text-sm text-dark-300">
          Personalize a identidade visual e domínio da sua agência.
        </p>
      </div>

      <ChartCard title="Identidade Visual" subtitle="Logo, cores e tipografia">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-medium text-dark-400 uppercase tracking-wider mb-2">Logo</label>
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-lg border-2 border-dashed border-dark-200 flex items-center justify-center bg-dark-50 overflow-hidden">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Upload size={20} className="text-dark-300" />
                )}
              </div>
              <div>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dark-100 bg-surface font-body text-sm text-dark-700 hover:bg-dark-50 cursor-pointer transition-colors">
                  <Upload size={14} />
                  Selecionar arquivo
                  <input type="file" accept="image/*" onChange={handleLogoSelect} className="hidden" />
                </label>
                <p className="font-body text-xs text-dark-300 mt-1.5">PNG, JPG ou SVG. Preview local apenas.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-5">
            <ColorPicker label="Cor Primária" value={primaryColor} onChange={setPrimaryColor} />
            <ColorPicker label="Cor Secundária" value={secondaryColor} onChange={setSecondaryColor} />
            <ColorPicker label="Cor de Fundo" value={backgroundColor} onChange={setBackgroundColor} />
          </div>

          <div>
            <label className="block text-xs font-medium text-dark-400 uppercase tracking-wider mb-2">Tipografia</label>
            <div className="flex flex-wrap gap-4">
              <div className="px-4 py-3 rounded-lg bg-dark-50 border border-border/50">
                <p className="font-heading text-sm font-semibold text-dark-700">Plus Jakarta Sans</p>
                <p className="font-body text-xs text-dark-300">Títulos</p>
              </div>
              <div className="px-4 py-3 rounded-lg bg-dark-50 border border-border/50">
                <p className="font-body text-sm font-medium text-dark-700">DM Sans</p>
                <p className="font-body text-xs text-dark-300">Corpo</p>
              </div>
              <div className="px-4 py-3 rounded-lg bg-dark-50 border border-border/50">
                <p className="font-mono text-sm text-dark-700">JetBrains Mono</p>
                <p className="font-body text-xs text-dark-300">Números</p>
              </div>
            </div>
          </div>
        </div>
      </ChartCard>

      <ChartCard title="Preview ao Vivo" subtitle="Visualize as cores aplicadas">
        <LivePreview
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          backgroundColor={backgroundColor}
        />
      </ChartCard>

      <ChartCard title="Domínio" subtitle="Configuração de domínio personalizado">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-dark-400 uppercase tracking-wider mb-2">Subdomínio atual</label>
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-dark-50 border border-border/50">
              <Globe size={16} className="text-dark-400" />
              <span className="font-mono text-sm text-dark-700">
                {agency?.slug || 'minha-agencia'}.dashboard360.com.br
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-dark-400 uppercase tracking-wider mb-2">Domínio personalizado</label>
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="painel.minhaagencia.com.br"
              className="w-full px-4 py-3 rounded-lg border border-dark-100 bg-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="rounded-lg border border-border/50 overflow-hidden">
            <button
              onClick={() => setDnsOpen(!dnsOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-dark-50 hover:bg-dark-100 transition-colors"
            >
              <span className="font-body text-sm font-medium text-dark-700">Instruções de DNS</span>
              {dnsOpen ? <ChevronUp size={16} className="text-dark-400" /> : <ChevronDown size={16} className="text-dark-400" />}
            </button>
            {dnsOpen && (
              <div className="px-4 py-3 font-body text-sm text-dark-400 space-y-2 bg-surface">
                <p>Para usar um domínio personalizado, configure um registro CNAME no DNS do seu provedor:</p>
                <div className="px-3 py-2 rounded bg-dark-50 font-mono text-xs text-dark-700">
                  Tipo: CNAME<br />
                  Nome: seu-subdominio<br />
                  Valor: proxy.dashboard360.com.br
                </div>
                <p>Aponte um registro CNAME de seu domínio para <strong className="text-dark-700">proxy.dashboard360.com.br</strong></p>
                <p>A propagação pode levar até 48 horas.</p>
              </div>
            )}
          </div>
        </div>
      </ChartCard>

      {feedback && (
        <div className={cn(
          'flex items-center gap-2 px-4 py-3 rounded-lg font-body text-sm',
          feedback.type === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
        )}>
          {feedback.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {feedback.msg}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-dark font-heading font-semibold text-sm hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Salvar Configurações
      </button>
    </div>
  )
}
