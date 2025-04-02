"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartConfig | null>(null)

function ChartContainer({ children, config, className, ...props }: ChartContainerProps) {
  const cssVars = React.useMemo(() => {
    const vars: Record<string, string> = {}
    Object.entries(config).forEach(([key, value]) => {
      vars[`--color-${key}`] = value.color
    })
    return vars
  }, [config])

  return (
    <ChartContext.Provider value={config}>
      <div
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        style={cssVars}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
}
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  return null
}

interface ChartTooltipProps extends React.HTMLAttributes<HTMLDivElement> {}

function ChartTooltip({ className, ...props }: ChartTooltipProps) {
  return <div className={cn("", className)} {...props} />
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    payload: {
      [key: string]: any
    }
  }>
  label?: string
}

function ChartTooltipContent({ active, payload, label }: ChartTooltipContentProps) {
  const config = React.useContext(ChartContext)

  if (!active || !payload?.length || !config) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid grid-cols-2 gap-2">
        <div className="font-medium">{label}</div>
        <div className="font-medium">Value</div>
        {payload.map((entry) => {
          const configKey = Object.keys(config).find((key) => entry.name === key)
          if (!configKey) return null
          const { label, color } = config[configKey]

          return (
            <React.Fragment key={entry.name}>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                <span>{label}</span>
              </div>
              <div>{entry.value}</div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
ChartTooltipContent.displayName = "ChartTooltip"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
  return null
})
ChartLegendContent.displayName = "ChartLegend"

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  return undefined
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle }

