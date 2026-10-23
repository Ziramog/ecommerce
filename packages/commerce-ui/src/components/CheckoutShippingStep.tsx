import React from 'react'
import type { CommerceShippingOption } from '@mercadal/commerce-core'

export interface CheckoutShippingStepProps {
  options: CommerceShippingOption[]
  selectedOptionId?: string
  onSelectOption: (optionId: string) => void
  onSubmit: () => void
  onBack?: () => void
  isLoading?: boolean
  className?: string
  formatCurrency?: (val: number) => string
  themeClasses?: {
    optionCard?: string
    selectedCard?: string
    button?: string
    backButton?: string
  }
}

export function CheckoutShippingStep({
  options,
  selectedOptionId,
  onSelectOption,
  onSubmit,
  onBack,
  isLoading = false,
  className = '',
  formatCurrency = (val) => `$${val.toLocaleString('es-AR')}`,
  themeClasses = {},
}: CheckoutShippingStepProps) {
  const [selected, setSelected] = React.useState(selectedOptionId || options[0]?.id || '')

  React.useEffect(() => {
    if (selectedOptionId) {
      setSelected(selectedOptionId)
    } else if (options[0]?.id && !selected) {
      setSelected(options[0].id)
      onSelectOption(options[0].id)
    }
  }, [selectedOptionId, options])

  const handleSelect = (id: string) => {
    setSelected(id)
    onSelectOption(id)
  }

  const defaultCardClass =
    themeClasses.optionCard ||
    'p-4 border border-neutral-300 rounded-[2px] cursor-pointer flex items-center justify-between hover:border-neutral-500 transition-colors bg-white'
  const selectedCardClass =
    themeClasses.selectedCard ||
    'p-4 border-2 border-neutral-900 rounded-[2px] cursor-pointer flex items-center justify-between bg-neutral-50/50'
  const buttonClass =
    themeClasses.button ||
    'flex-1 py-3.5 px-6 bg-neutral-900 hover:bg-neutral-800 text-white text-xs uppercase tracking-widest font-semibold transition-all duration-200 rounded-[2px] disabled:opacity-50'
  const backButtonClass =
    themeClasses.backButton ||
    'py-3.5 px-6 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs uppercase tracking-widest font-semibold transition-all duration-200 rounded-[2px]'

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-3" role="radiogroup" aria-label="Métodos de envío disponibles">
        {options.map((opt) => {
          const isChosen = selected === opt.id
          return (
            <div
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={isChosen ? selectedCardClass : defaultCardClass}
              role="radio"
              aria-checked={isChosen}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault()
                  handleSelect(opt.id)
                }
              }}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isChosen ? 'border-neutral-900' : 'border-neutral-400'
                  }`}
                >
                  {isChosen && <div className="w-2 h-2 rounded-full bg-neutral-900" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{opt.name}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-neutral-900">
                {opt.amount === 0 ? 'Gratis' : formatCurrency(opt.amount)}
              </p>
            </div>
          )
        })}
      </div>

      <div className="flex items-center space-x-3 pt-3">
        {onBack && (
          <button type="button" onClick={onBack} disabled={isLoading} className={backButtonClass}>
            ← Volver
          </button>
        )}
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || !selected}
          className={buttonClass}
        >
          {isLoading ? 'Aplicando envío...' : 'Continuar al Pago →'}
        </button>
      </div>
    </div>
  )
}
