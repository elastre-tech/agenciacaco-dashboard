'use client'

interface LivePreviewProps {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
}

export default function LivePreview({ primaryColor, secondaryColor, backgroundColor }: LivePreviewProps) {
  return (
    <div
      className="rounded-lg border border-border/50 overflow-hidden"
      style={{ backgroundColor }}
    >
      <div className="flex h-48">
        <div
          className="w-12 shrink-0 flex flex-col items-center gap-3 py-4"
          style={{ backgroundColor: secondaryColor }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-6 h-6 rounded"
              style={{ backgroundColor: i === 1 ? primaryColor : 'rgba(255,255,255,0.15)' }}
            />
          ))}
        </div>

        <div className="flex-1 flex flex-col">
          <div className="h-10 flex items-center px-4 border-b border-border/30 bg-white/60">
            <div className="h-2 w-20 rounded-full" style={{ backgroundColor: primaryColor }} />
            <div className="ml-auto flex gap-2">
              <div className="w-6 h-6 rounded-full bg-dark-100" />
            </div>
          </div>

          <div className="flex-1 p-4 grid grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3 shadow-sm border border-border/30">
              <div className="h-2 w-10 rounded-full bg-dark-200 mb-2" />
              <div className="h-4 w-8 rounded" style={{ backgroundColor: primaryColor }} />
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-border/30">
              <div className="h-2 w-12 rounded-full bg-dark-200 mb-2" />
              <div className="h-4 w-6 rounded bg-dark-200" />
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-border/30">
              <div className="h-2 w-8 rounded-full bg-dark-200 mb-2" />
              <div className="h-4 w-10 rounded bg-dark-200" />
            </div>
          </div>

          <div className="px-4 pb-3">
            <p className="font-body text-xs" style={{ color: secondaryColor }}>
              Texto de exemplo com as cores selecionadas
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
