import { useMemo } from 'react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'

export function RankingChart({ athlete }: { athlete: any }) {
  const chartData = useMemo(() => {
    if (!athlete) return []
    const data = []
    let curr = athlete.position
    for (let i = 11; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      data.push({
        month: d.toLocaleDateString('pt-BR', { month: 'short' }),
        position: Math.max(1, curr + Math.floor(Math.random() * 5) - 2),
      })
    }
    data[data.length - 1].position = athlete.position
    return data
  }, [athlete])

  if (!athlete) return null

  return (
    <ChartContainer
      config={{ position: { label: 'Posição', color: '#1B7D3A' } }}
      className="h-[300px] w-full mt-4"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            fontSize={12}
            fill="hsl(var(--muted-foreground))"
          />
          <YAxis
            reversed
            domain={[1, 'dataMax + 2']}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            fontSize={12}
            fill="hsl(var(--muted-foreground))"
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="position"
            stroke="var(--color-position)"
            strokeWidth={3}
            dot={{ r: 4, fill: 'var(--color-position)' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
