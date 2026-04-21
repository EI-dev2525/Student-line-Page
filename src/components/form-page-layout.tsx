'use client'

import { Card } from '@/components/ui/card'

interface FormPageLayoutProps {
  title: string
  description?: string
  children: React.ReactNode
  topContent?: React.ReactNode
}

export function FormPageLayout({ title, description, children, topContent }: FormPageLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* Simple Header with Logo */}
      <header className="pt-8 pb-4 flex justify-center">
        <img 
          src="/ei_logo.png" 
          alt="English Innovations" 
          className="h-10 w-auto"
        />
      </header>

      <div className="flex-1 p-4 md:p-6 max-w-2xl mx-auto w-full">
        {(title || description) && (
          <header className="mb-6">
            {title && (
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-slate-500 font-medium">
                {description}
              </p>
            )}
          </header>
        )}

        {topContent && (
          <div className="mb-6 flex justify-center md:justify-start">
            {topContent}
          </div>
        )}

        <Card className="p-6 border-none shadow-xl bg-white rounded-2xl overflow-hidden">
          {children}
        </Card>
      </div>
    </main>
  )
}
