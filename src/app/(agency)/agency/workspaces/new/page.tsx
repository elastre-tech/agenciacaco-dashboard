'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/format'
import { useWizardStore } from '@/stores/wizardStore'
import {
  StepCampaign,
  StepCompetitors,
  StepRegions,
  StepTerms,
  StepTeam,
  StepReview,
} from './WizardSteps'

const STEP_LABELS = [
  'Campanha',
  'Concorrentes',
  'Regiões',
  'Monitoramento',
  'Equipe',
  'Revisão',
]

export default function NewWorkspacePage() {
  const router = useRouter()
  const store = useWizardStore()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    store.reset()
    return () => store.reset()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function isStep1Valid() {
    return (
      store.name.trim() !== '' &&
      store.candidateName.trim() !== '' &&
      store.candidateParty.trim() !== '' &&
      store.electionType !== '' &&
      store.state !== '' &&
      store.city.trim() !== ''
    )
  }

  function canAdvance() {
    if (store.step === 1) return isStep1Valid()
    return true
  }

  function handleNext() {
    if (!canAdvance()) return
    if (store.step < 6) store.setStep(store.step + 1)
  }

  function handlePrev() {
    if (store.step > 1) store.setStep(store.step - 1)
  }

  function handleGoTo(step: number) {
    store.setStep(step)
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    const supabase = createClient()

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) throw new Error('Usuário não autenticado')

      const { data: membership } = await supabase
        .from('agency_members')
        .select('agency_id')
        .eq('profile_id', userData.user.id)
        .limit(1)
        .single()

      if (!membership) throw new Error('Nenhuma agência encontrada para este usuário')

      const slug = store.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const { data: workspace, error: wsError } = await supabase
        .from('workspaces')
        .insert({
          agency_id: membership.agency_id,
          name: store.name,
          slug,
          candidate_name: store.candidateName,
          candidate_party: store.candidateParty,
          election_type: store.electionType,
          election_year: new Date().getFullYear(),
          state: store.state,
          city: store.city,
          is_active: true,
        })
        .select('id')
        .single()

      if (wsError) throw wsError

      // Add current user as campaign_coordinator in the new workspace
      await supabase.from('workspace_members').insert({
        workspace_id: workspace.id,
        profile_id: userData.user.id,
        role: 'campaign_coordinator',
      })

      if (store.monitoringTerms.length > 0) {
        const terms = store.monitoringTerms.map((term) => ({
          workspace_id: workspace.id,
          term,
          is_active: true,
        }))
        const { error: termsError } = await supabase
          .from('listening_terms')
          .insert(terms)
        if (termsError) throw termsError
      }

      router.push('/agency/workspaces')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar workspace'
      setError(message)
      console.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="font-heading text-xl font-bold text-dark-700 mb-1">
          Novo Workspace
        </h2>
        <p className="font-body text-sm text-dark-300">
          Configure um novo workspace de campanha em poucos passos.
        </p>
      </div>

      <ProgressBar currentStep={store.step} />

      <div className="bg-surface rounded-card shadow-card border border-border/50 p-6">
        {store.step === 1 && <StepCampaign />}
        {store.step === 2 && <StepCompetitors />}
        {store.step === 3 && <StepRegions />}
        {store.step === 4 && <StepTerms />}
        {store.step === 5 && <StepTeam />}
        {store.step === 6 && <StepReview onGoTo={handleGoTo} />}
      </div>

      {error && (
        <p className="font-body text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={store.step === 1}
          className={cn(
            'border border-dark-200 text-dark-500 hover:bg-dark-50 font-heading font-semibold rounded-lg px-5 py-2.5 transition-colors',
            store.step === 1 && 'opacity-40 cursor-not-allowed',
          )}
        >
          Anterior
        </button>

        {store.step < 6 ? (
          <button
            onClick={handleNext}
            disabled={!canAdvance()}
            className={cn(
              'bg-primary text-dark font-heading font-semibold rounded-lg px-5 py-2.5 hover:bg-primary-500 transition-colors',
              !canAdvance() && 'opacity-40 cursor-not-allowed',
            )}
          >
            Próximo
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-primary text-dark font-heading font-semibold rounded-lg px-5 py-2.5 hover:bg-primary-500 transition-colors inline-flex items-center gap-2"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Criar Workspace
          </button>
        )}
      </div>
    </div>
  )
}

function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-between">
      {STEP_LABELS.map((label, i) => {
        const stepNum = i + 1
        const isCompleted = stepNum < currentStep
        const isCurrent = stepNum === currentStep

        return (
          <div key={stepNum} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-heading font-semibold transition-colors',
                  isCompleted && 'bg-primary text-dark',
                  isCurrent && 'bg-primary text-dark ring-2 ring-primary/30 ring-offset-2',
                  !isCompleted && !isCurrent && 'bg-dark-50 text-dark-300',
                )}
              >
                {isCompleted ? <Check size={14} strokeWidth={3} /> : stepNum}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium whitespace-nowrap',
                  isCurrent ? 'text-dark-700' : 'text-dark-300',
                )}
              >
                {label}
              </span>
            </div>
            {stepNum < STEP_LABELS.length && (
              <div
                className={cn(
                  'flex-1 h-px mx-2 mt-[-18px]',
                  stepNum < currentStep ? 'bg-primary' : 'bg-dark-100',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
