import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import type { ReactNode } from 'react'

interface StepInfo {
  number: number
  title: string
  icon: ReactNode
}

interface RegistrationStepperProps {
  currentStep: number
  steps: StepInfo[]
}

export function RegistrationStepper({ currentStep, steps }: RegistrationStepperProps) {
  return (
    <div className="flex items-center justify-center w-full mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                currentStep >= step.number
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-muted border-muted-foreground/30 text-muted-foreground',
              )}
            >
              {currentStep > step.number ? <Check className="w-5 h-5" /> : step.icon}
            </div>
            <span
              className={cn(
                'text-xs mt-2 font-medium transition-colors whitespace-nowrap',
                currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'h-0.5 w-12 sm:w-20 mx-2 transition-colors duration-300',
                currentStep > step.number ? 'bg-primary' : 'bg-muted-foreground/30',
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
