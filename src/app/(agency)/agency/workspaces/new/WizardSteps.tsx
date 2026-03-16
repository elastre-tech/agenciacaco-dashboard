'use client'

import { useState } from 'react'
import { X, Plus, UserPlus } from 'lucide-react'
import { useWizardStore, type TeamInvite } from '@/stores/wizardStore'

const BR_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

const ELECTION_TYPES = [
  { value: 'municipal', label: 'Municipal' },
  { value: 'estadual', label: 'Estadual' },
  { value: 'federal', label: 'Federal' },
]

const ROLE_LABELS: Record<string, string> = {
  campaign_coordinator: 'Coordenador de Campanha',
  intelligence_analyst: 'Analista de Inteligência',
  performance_manager: 'Gestor de Performance',
  field_mobilizer: 'Mobilizador de Campo',
}

const ROLES = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }))

const inputClass = 'w-full px-4 py-3 rounded-lg border border-dark-100 bg-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
const labelClass = 'text-xs font-medium text-dark-400 uppercase tracking-wider mb-2 block'
const tagClass = 'bg-dark-50 text-dark-500 text-xs px-2 py-1 rounded flex items-center gap-1'

export function StepCampaign() {
  const { name, candidateName, candidateParty, electionType, state, city, setField } = useWizardStore()

  return (
    <div className="space-y-5">
      <h3 className="font-heading text-lg font-semibold text-dark-700">Dados da Campanha</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className={labelClass}>Nome do Workspace</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="Ex: Campanha Prefeito 2026"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Nome do Candidato</label>
          <input
            type="text"
            value={candidateName}
            onChange={(e) => setField('candidateName', e.target.value)}
            placeholder="Nome completo"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Partido</label>
          <input
            type="text"
            value={candidateParty}
            onChange={(e) => setField('candidateParty', e.target.value)}
            placeholder="Sigla do partido"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Tipo de Eleição</label>
          <select
            value={electionType}
            onChange={(e) => setField('electionType', e.target.value)}
            className={inputClass}
          >
            <option value="">Selecione...</option>
            {ELECTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Estado</label>
          <select
            value={state}
            onChange={(e) => setField('state', e.target.value)}
            className={inputClass}
          >
            <option value="">Selecione...</option>
            {BR_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Cidade</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setField('city', e.target.value)}
            placeholder="Nome da cidade"
            className={inputClass}
          />
        </div>
      </div>
    </div>
  )
}

export function StepCompetitors() {
  const { competitors, addCompetitor, removeCompetitor } = useWizardStore()
  const [compName, setCompName] = useState('')
  const [compParty, setCompParty] = useState('')

  function handleAdd() {
    if (!compName.trim()) return
    addCompetitor({ name: compName.trim(), party: compParty.trim() })
    setCompName('')
    setCompParty('')
  }

  return (
    <div className="space-y-5">
      <h3 className="font-heading text-lg font-semibold text-dark-700">Concorrentes</h3>
      <p className="font-body text-sm text-dark-400">
        Adicione os concorrentes que deseja monitorar. Você pode pular esta etapa.
      </p>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className={labelClass}>Nome</label>
          <input
            type="text"
            value={compName}
            onChange={(e) => setCompName(e.target.value)}
            placeholder="Nome do concorrente"
            className={inputClass}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <div className="w-32">
          <label className={labelClass}>Partido</label>
          <input
            type="text"
            value={compParty}
            onChange={(e) => setCompParty(e.target.value)}
            placeholder="Sigla"
            className={inputClass}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <button
          onClick={handleAdd}
          className="bg-primary text-dark font-heading font-semibold rounded-lg px-5 py-3 hover:bg-primary-500 transition-colors inline-flex items-center gap-1.5"
        >
          <Plus size={16} />
          Adicionar
        </button>
      </div>
      {competitors.length > 0 && (
        <div className="space-y-2">
          {competitors.map((c, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-dark-50/50 rounded-lg px-4 py-3 border border-border/50"
            >
              <div>
                <span className="font-body text-sm text-dark-700 font-medium">{c.name}</span>
                {c.party && (
                  <span className="ml-2 text-xs text-dark-400">({c.party})</span>
                )}
              </div>
              <button
                onClick={() => removeCompetitor(i)}
                className="text-dark-300 hover:text-dark-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function StepRegions() {
  const { regions, addRegion, removeRegion } = useWizardStore()
  const [value, setValue] = useState('')

  function handleAdd() {
    if (!value.trim()) return
    addRegion(value.trim())
    setValue('')
  }

  return (
    <div className="space-y-5">
      <h3 className="font-heading text-lg font-semibold text-dark-700">Regiões Prioritárias</h3>
      <p className="font-body text-sm text-dark-400">
        Defina bairros ou regiões de foco da campanha. Você pode pular esta etapa.
      </p>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className={labelClass}>Região / Bairro</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Nome da região ou bairro"
            className={inputClass}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <button
          onClick={handleAdd}
          className="bg-primary text-dark font-heading font-semibold rounded-lg px-5 py-3 hover:bg-primary-500 transition-colors inline-flex items-center gap-1.5"
        >
          <Plus size={16} />
          Adicionar
        </button>
      </div>
      {regions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {regions.map((r, i) => (
            <span key={i} className={tagClass}>
              {r}
              <button onClick={() => removeRegion(i)} className="hover:text-dark-700 transition-colors">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function StepTerms() {
  const { monitoringTerms, addTerm, removeTerm } = useWizardStore()
  const [value, setValue] = useState('')

  function handleAdd() {
    if (!value.trim()) return
    addTerm(value.trim())
    setValue('')
  }

  return (
    <div className="space-y-5">
      <h3 className="font-heading text-lg font-semibold text-dark-700">Termos de Monitoramento</h3>
      <p className="font-body text-sm text-dark-400">
        Palavras-chave para escuta social e alertas. Você pode pular esta etapa.
      </p>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className={labelClass}>Termo</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ex: nome do candidato, hashtag, tema"
            className={inputClass}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <button
          onClick={handleAdd}
          className="bg-primary text-dark font-heading font-semibold rounded-lg px-5 py-3 hover:bg-primary-500 transition-colors inline-flex items-center gap-1.5"
        >
          <Plus size={16} />
          Adicionar
        </button>
      </div>
      {monitoringTerms.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {monitoringTerms.map((t, i) => (
            <span key={i} className={tagClass}>
              {t}
              <button onClick={() => removeTerm(i)} className="hover:text-dark-700 transition-colors">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function StepTeam() {
  const { teamInvites, addInvite, removeInvite } = useWizardStore()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<TeamInvite['role']>('campaign_coordinator')

  function handleAdd() {
    if (!email.trim()) return
    addInvite({
      email: email.trim(),
      role,
    })
    setEmail('')
  }

  return (
    <div className="space-y-5">
      <h3 className="font-heading text-lg font-semibold text-dark-700">Equipe</h3>
      <p className="font-body text-sm text-dark-400">
        Convide membros para este workspace. Você pode pular esta etapa.
      </p>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className={labelClass}>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colaborador@email.com"
            className={inputClass}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <div className="w-56">
          <label className={labelClass}>Função</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as TeamInvite['role'])}
            className={inputClass}
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAdd}
          className="bg-primary text-dark font-heading font-semibold rounded-lg px-5 py-3 hover:bg-primary-500 transition-colors inline-flex items-center gap-1.5"
        >
          <UserPlus size={16} />
          Convidar
        </button>
      </div>
      {teamInvites.length > 0 && (
        <div className="space-y-2">
          {teamInvites.map((inv, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-dark-50/50 rounded-lg px-4 py-3 border border-border/50"
            >
              <div className="flex items-center gap-3">
                <span className="font-body text-sm text-dark-700">{inv.email}</span>
                <span className="bg-primary/15 text-dark-600 text-xs px-2 py-0.5 rounded font-medium">
                  {ROLE_LABELS[inv.role]}
                </span>
              </div>
              <button
                onClick={() => removeInvite(i)}
                className="text-dark-300 hover:text-dark-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function StepReview({ onGoTo }: { onGoTo: (step: number) => void }) {
  const store = useWizardStore()

  const sections = [
    {
      step: 1,
      title: 'Dados da Campanha',
      items: [
        { label: 'Workspace', value: store.name },
        { label: 'Candidato', value: `${store.candidateName} (${store.candidateParty})` },
        { label: 'Eleição', value: store.electionType },
        { label: 'Local', value: `${store.city}/${store.state}` },
      ],
    },
    {
      step: 2,
      title: 'Concorrentes',
      items: store.competitors.map((c) => ({
        label: c.name,
        value: c.party,
      })),
    },
    {
      step: 3,
      title: 'Regiões',
      tags: store.regions,
    },
    {
      step: 4,
      title: 'Termos de Monitoramento',
      tags: store.monitoringTerms,
    },
    {
      step: 5,
      title: 'Equipe',
      items: store.teamInvites.map((inv) => ({
        label: inv.email,
        value: ROLE_LABELS[inv.role],
      })),
    },
  ]

  return (
    <div className="space-y-5">
      <h3 className="font-heading text-lg font-semibold text-dark-700">Revisão</h3>
      <p className="font-body text-sm text-dark-400">
        Confira os dados antes de criar o workspace.
      </p>
      <div className="space-y-4">
        {sections.map((sec) => (
          <div
            key={sec.step}
            className="bg-dark-50/30 rounded-lg border border-border/50 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-heading text-sm font-semibold text-dark-700">{sec.title}</h4>
              <button
                onClick={() => onGoTo(sec.step)}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Editar
              </button>
            </div>
            {'tags' in sec && sec.tags ? (
              sec.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {sec.tags.map((tag, i) => (
                    <span key={i} className={tagClass}>{tag}</span>
                  ))}
                </div>
              ) : (
                <p className="font-body text-xs text-dark-300">Nenhum item adicionado.</p>
              )
            ) : sec.items && sec.items.length > 0 ? (
              <div className="space-y-1.5">
                {sec.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="font-body text-sm text-dark-500">{item.label}</span>
                    <span className="font-body text-sm text-dark-700 font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body text-xs text-dark-300">Nenhum item adicionado.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
