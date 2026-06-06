import type {
  ServerDataTableColumn,
  ServerDataTableRow,
  ServerDataTableSort,
} from "../../../registry/server-data-table/server-data-table-view";

export type CampaignOrderRow = ServerDataTableRow & {
  order_date: string;
  campaign_name: string;
  customer_segment: string;
  orders: number;
  revenue: number;
  conversion_rate: number;
};

export const ordersColumns: ServerDataTableColumn[] = [
  { key: "order_date", label: "Order Date", dataType: "date" },
  { key: "campaign_name", label: "Campaign", dataType: "string" },
  { key: "customer_segment", label: "Segment", dataType: "string" },
  { key: "orders", label: "Orders", dataType: "number" },
  { key: "revenue", label: "Revenue", dataType: "number" },
  { key: "conversion_rate", label: "Conversion Rate", dataType: "number" },
];

const campaigns = ["Spring Pipeline", "Enterprise Expansion", "Partner Launch", "Renewal Push"];
const segments = ["Enterprise", "Mid-market", "SMB", "Strategic"];

export const ordersRows: CampaignOrderRow[] = Array.from({ length: 240 }, (_, index) => {
  const campaignIndex = index % campaigns.length;
  const segmentIndex = index % segments.length;
  const orders = 12 + ((index * 7) % 91);
  const revenue = orders * (180 + campaignIndex * 43 + segmentIndex * 18);

  return {
    order_date: new Date(2026, index % 12, (index % 27) + 1).toISOString().slice(0, 10),
    campaign_name: campaigns[campaignIndex],
    customer_segment: segments[segmentIndex],
    orders,
    revenue,
    conversion_rate: Number((0.08 + ((index % 17) / 100)).toFixed(2)),
  };
});

export function getDisplayedTotals(rows: CampaignOrderRow[]): Partial<CampaignOrderRow> {
  const orders = rows.reduce((sum, row) => sum + row.orders, 0);
  const revenue = rows.reduce((sum, row) => sum + row.revenue, 0);

  return {
    campaign_name: "Displayed total",
    orders,
    revenue,
    conversion_rate: rows.length ? Number((orders / rows.length / 100).toFixed(2)) : 0,
  };
}

export function sortRows<TRow extends ServerDataTableRow>(
  rows: TRow[],
  sort?: ServerDataTableSort,
): TRow[] {
  if (!sort) return rows;

  return [...rows].sort((left, right) => {
    const leftValue = left[sort.key];
    const rightValue = right[sort.key];
    const direction = sort.direction === "desc" ? -1 : 1;

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      return (leftValue - rightValue) * direction;
    }

    return String(leftValue ?? "").localeCompare(String(rightValue ?? "")) * direction;
  });
}

