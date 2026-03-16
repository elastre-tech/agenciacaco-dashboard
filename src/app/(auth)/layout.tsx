'use client'

import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-[55%] bg-dark-700 relative overflow-hidden items-end p-12">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFD100' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-heading font-extrabold text-dark text-lg">C</span>
            </div>
            <span className="font-heading font-bold text-white text-xl tracking-tight">
              CaCo
            </span>
          </div>

          <h1 className="font-heading text-4xl font-bold text-white leading-tight mb-4">
            Inteligência que
            <br />
            <span className="text-primary">transforma</span> campanhas.
          </h1>

          <p className="font-body text-dark-300 text-base leading-relaxed max-w-md">
            Dados territoriais, monitoramento de risco e análise competitiva
            em uma única plataforma.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
