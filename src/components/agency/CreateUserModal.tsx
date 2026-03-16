'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { ALL_MODULES, MODULE_LABELS, type PermissionModule } from '@/types/database'
import { cn } from '@/lib/utils/format'

interface CreateUserModalProps {
  workspaceId: string
  workspaceName: string
  onClose: () => void
  onCreated: () => void
}

const WORKSPACE_ROLES = [
  { value: 'campaign_coordinator', label: 'Coordenador de Campanha' },
  { value: 'intelligence_analyst', label: 'Analista de Inteligência' },
  { value: 'performance_manager', label: 'Gestor de Performance' },
  { value: 'field_mobilizer', label: 'Mobilizador de Campo' },
] as const

interface ModulePerm {
  module: PermissionModule
  can_view: boolean
  can_edit: boolean
}

function getDefaultPermissions(): ModulePerm[] {
  return ALL_MODULES.map((m) => ({
    module: m,
    can_view: true,
    can_edit: false,
  }))
}

export default function CreateUserModal({ workspaceId, workspaceName, onClose, onCreated }: CreateUserModalProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('campaign_coordinator')
  const [permissions, setPermissions] = useState<ModulePerm[]>(getDefaultPermissions)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function toggleView(module: PermissionModule) {
    setPermissions((prev) =>
      prev.map((p) =>
        p.module === module
          ? { ...p, can_view: !p.can_view, can_edit: !p.can_view ? p.can_edit : false }
          : p
      )
    )
  }

  function toggleEdit(module: PermissionModule) {
    setPermissions((prev) =>
      prev.map((p) =>
        p.module === module
          ? { ...p, can_edit: !p.can_edit, can_view: !p.can_edit ? true : p.can_view }
          : p
      )
    )
  }

  async function handleSubmit() {
    if (!fullName.trim() || !email.trim()) return
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          workspaceId,
          role,
          permissions,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao criar usuário')
        return
      }

      setSuccess(data.message || 'Usuário criado com sucesso')
      setTimeout(() => {
        onCreated()
        onClose()
      }, 1500)
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-dark-900/60 z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-card shadow-card border border-border/50 w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/50">
          <div>
            <h3 className="font-heading font-semibold text-dark-700 text-lg">Criar Usuário</h3>
            <p className="font-body text-xs text-dark-300 mt-0.5">{workspaceName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-dark-50 transition-colors">
            <X size={18} className="text-dark-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-dark-400 uppercase tracking-wider mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="João Silva"
                className="w-full px-4 py-3 rounded-lg border border-dark-100 bg-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="joao@exemplo.com"
                className="w-full px-4 py-3 rounded-lg border border-dark-100 bg-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-dark-400 uppercase tracking-wider mb-2">
              Cargo no Workspace
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-dark-100 bg-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {WORKSPACE_ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-dark-400 uppercase tracking-wider mb-3">
              Permissões por Módulo
            </label>
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-dark-50">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-dark-300 uppercase tracking-wider font-heading">Módulo</th>
                    <th className="text-center px-4 py-2.5 text-xs font-medium text-dark-300 uppercase tracking-wider font-heading w-20">Ver</th>
                    <th className="text-center px-4 py-2.5 text-xs font-medium text-dark-300 uppercase tracking-wider font-heading w-20">Editar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {permissions.map((perm, idx) => (
                    <tr
                      key={perm.module}
                      className={cn(idx % 2 === 1 && 'bg-dark-50/30')}
                    >
                      <td className="px-4 py-2.5 font-body text-sm text-dark-700">
                        {MODULE_LABELS[perm.module]}
                      </td>
                      <td className="text-center px-4 py-2.5">
                        <input
                          type="checkbox"
                          checked={perm.can_view}
                          onChange={() => toggleView(perm.module)}
                          className="w-4 h-4 rounded border-dark-200 text-primary focus:ring-primary cursor-pointer"
                        />
                      </td>
                      <td className="text-center px-4 py-2.5">
                        <input
                          type="checkbox"
                          checked={perm.can_edit}
                          onChange={() => toggleEdit(perm.module)}
                          className="w-4 h-4 rounded border-dark-200 text-primary focus:ring-primary cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {error && <p className="font-body text-sm text-danger">{error}</p>}
          {success && <p className="font-body text-sm text-success">{success}</p>}
        </div>

        <div className="px-6 py-4 border-t border-border/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-dark-200 font-heading font-semibold text-sm text-dark-700 hover:bg-dark-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !fullName.trim() || !email.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-dark font-heading font-semibold text-sm hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Criar e Enviar Convite
          </button>
        </div>
      </div>
    </div>
  )
}
