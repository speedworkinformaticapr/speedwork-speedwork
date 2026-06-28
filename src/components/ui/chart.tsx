import * as React from 'react'
import { ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { cn } from '@/lib/utils'

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
    theme?: Record<string, string>
  }
>

type ChartContextValue = { config: ChartConfig }
const ChartContext = React.createContext<ChartContextValue | null>(null)

function useChart(): ChartContextValue {
  const ctx = React.useContext(ChartContext)
  return ctx ?? { config: {} as ChartConfig }
}

function getPayloadConfigFromPayload(config: ChartConfig, payload: any, key: string) {
  if (!payload || typeof payload !== 'object') return undefined
  const inner = payload.payload && typeof payload.payload === 'object' ? payload.payload : undefined
  let k = key
  if (key in payload && typeof payload[key] === 'string') k = payload[key]
  else if (inner && key in inner && typeof inner[key] === 'string') k = inner[key]
  return k in config ? config[k] : config[key]
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { config: ChartConfig; children: React.ReactElement }
>(({ className, children, config, ...props }, ref) => {
  const id = React.useId()
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        data-chart={id}
        className={cn('flex aspect-video justify-center text-xs', className)}
        {...props}
      >
        <ChartStyle id={id} config={config} />
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = 'ChartContainer'

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const entries = Object.entries(config).filter(([, c]) => c.theme || c.color)
  if (!entries.length) return null
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: entries
          .map(([k, c]) => `[data-chart="${id}"]{--color-${k}:${c.color};}`)
          .join('\n'),
      }}
    />
  )
}

const ChartTooltip = Tooltip

const ChartTooltipContent = React.forwardRef<HTMLDivElement, any>(
  (
    {
      active,
      payload,
      className,
      indicator = 'dot',
      hideLabel,
      hideIndicator,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref,
  ) => {
    const { config } = useChart()
    if (!active || !payload?.length) return null
    const [first] = payload
    const lk = `${labelKey || first?.dataKey || first?.name || 'value'}`
    const ic = getPayloadConfigFromPayload(config, first, lk)
    const lv = !labelKey && typeof label === 'string' ? config[label]?.label || label : ic?.label
    return (
      <div
        ref={ref}
        className={cn(
          'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
          className,
        )}
      >
        {!hideLabel && lv ? (
          <div className={cn('font-medium', labelClassName)}>
            {labelFormatter ? labelFormatter(lv, payload) : lv}
          </div>
        ) : null}
        <div className="grid gap-1.5">
          {payload.map((item: any, i: number) => {
            const k = `${nameKey || item.name || item.dataKey || 'value'}`
            const itemConfig = getPayloadConfigFromPayload(config, item, k)
            const c = color || item.payload?.fill || item.color
            return (
              <div
                key={item.dataKey ?? i}
                className="flex w-full items-center gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5"
              >
                {!hideIndicator &&
                  (itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                <div className="flex flex-1 items-center justify-between gap-2 leading-none">
                  {itemConfig?.label ? (
                    <span className="text-muted-foreground">{itemConfig.label}</span>
                  ) : null}
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {formatter
                      ? formatter(item.value, item.name, item, i, item.payload)
                      : item.value?.toLocaleString()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  },
)
ChartTooltipContent.displayName = 'ChartTooltipContent'

const ChartLegend = Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { hideIcon?: boolean; nameKey?: string }
>(({ className, hideIcon, payload, verticalAlign = 'middle', nameKey }, ref) => {
  const { config } = useChart()
  if (!payload?.length) return null
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-center gap-4',
        verticalAlign === 'top' ? 'pb-3' : 'pt-3',
        className,
      )}
    >
      {payload.map((item: any) => {
        const k = `${nameKey || item.dataKey || 'value'}`
        const ic = getPayloadConfigFromPayload(config, item, k)
        return (
          <div key={item.value} className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3">
            {ic?.icon && !hideIcon ? (
              <ic.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
            )}
            {ic?.label}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = 'ChartLegendContent'

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
