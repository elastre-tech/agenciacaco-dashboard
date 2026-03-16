import { create } from 'zustand'

interface Competitor {
  name: string
  party: string
}

export interface TeamInvite {
  email: string
  role: 'campaign_coordinator' | 'intelligence_analyst' | 'performance_manager' | 'field_mobilizer'
}

interface WizardState {
  step: number
  name: string
  candidateName: string
  candidateParty: string
  electionType: string
  state: string
  city: string
  competitors: Competitor[]
  regions: string[]
  monitoringTerms: string[]
  teamInvites: TeamInvite[]

  setStep: (step: number) => void
  setField: (field: string, value: unknown) => void
  addCompetitor: (c: Competitor) => void
  removeCompetitor: (index: number) => void
  addRegion: (r: string) => void
  removeRegion: (index: number) => void
  addTerm: (t: string) => void
  removeTerm: (index: number) => void
  addInvite: (i: TeamInvite) => void
  removeInvite: (index: number) => void
  reset: () => void
}

const initialState = {
  step: 1,
  name: '',
  candidateName: '',
  candidateParty: '',
  electionType: '',
  state: '',
  city: '',
  competitors: [] as Competitor[],
  regions: [] as string[],
  monitoringTerms: [] as string[],
  teamInvites: [] as TeamInvite[],
}

export const useWizardStore = create<WizardState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  setField: (field, value) => set({ [field]: value }),

  addCompetitor: (c) =>
    set((s) => ({ competitors: [...s.competitors, c] })),

  removeCompetitor: (index) =>
    set((s) => ({ competitors: s.competitors.filter((_, i) => i !== index) })),

  addRegion: (r) =>
    set((s) => ({ regions: [...s.regions, r] })),

  removeRegion: (index) =>
    set((s) => ({ regions: s.regions.filter((_, i) => i !== index) })),

  addTerm: (t) =>
    set((s) => ({ monitoringTerms: [...s.monitoringTerms, t] })),

  removeTerm: (index) =>
    set((s) => ({ monitoringTerms: s.monitoringTerms.filter((_, i) => i !== index) })),

  addInvite: (i) =>
    set((s) => ({ teamInvites: [...s.teamInvites, i] })),

  removeInvite: (index) =>
    set((s) => ({ teamInvites: s.teamInvites.filter((_, i) => i !== index) })),

  reset: () => set(initialState),
}))
