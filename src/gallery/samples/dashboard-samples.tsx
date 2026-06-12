import {
  BarChart3Icon,
  Grid3X3Icon,
  Table2Icon,
  type LucideIcon,
} from "lucide-react"

import {
  ExecutiveScorecardSample,
  MatrixDrilldownSample,
  OperationsTableSample,
} from "./composed-samples"

export type DashboardSample = {
  id: "executive" | "operations" | "matrix"
  title: string
  icon: LucideIcon
  eyebrow: string
  heading: string
  description: string
  /** When true, the sample renders full-bleed instead of on a padded canvas. */
  bleed: boolean
  render: () => React.ReactNode
}

export const dashboardSamples: DashboardSample[] = [
  {
    id: "executive",
    title: "Executive scorecard",
    icon: BarChart3Icon,
    eyebrow: "Sales analytics",
    heading: "Revenue performance",
    description:
      "KPI summary, scoped filters, trend, part-to-whole, ranked, and column charts, plus a compact records table in one scannable page.",
    bleed: false,
    render: () => <ExecutiveScorecardSample />,
  },
  {
    id: "operations",
    title: "Operational records",
    icon: Table2Icon,
    eyebrow: "Operations",
    heading: "Operational records page",
    description:
      "For exploratory or drill-through results, make the server-backed table the primary experience with explicit pagination, sorting, and totals.",
    bleed: true,
    render: () => <OperationsTableSample />,
  },
  {
    id: "matrix",
    title: "Matrix analysis",
    icon: Grid3X3Icon,
    eyebrow: "Pivot analysis",
    heading: "Matrix analysis page",
    description:
      "Use matrix views for pivot-style comparisons where row and column hierarchy matters more than a chart.",
    bleed: true,
    render: () => <MatrixDrilldownSample />,
  },
]

export type DashboardSampleId = DashboardSample["id"]
