import type { MatrixGridProjection } from "react-semaphor/data-app-sdk";

type Campaign = {
  id: string;
  label: string;
  region: string;
  values: Record<string, number>;
};

const years = [
  { id: "fy2025", label: "FY 2025" },
  { id: "fy2026", label: "FY 2026" },
];

const segments = [
  { id: "enterprise", label: "Enterprise" },
  { id: "mid_market", label: "Mid-market" },
  { id: "smb", label: "SMB" },
];

const regions = [
  { id: "north", label: "North" },
  { id: "south", label: "South" },
  { id: "west", label: "West" },
];

const campaigns: Campaign[] = [
  {
    id: "pipeline",
    label: "Pipeline Acceleration",
    region: "north",
    values: {
      fy2025_enterprise: 282400,
      fy2025_mid_market: 163500,
      fy2025_smb: 94200,
      fy2026_enterprise: 326700,
      fy2026_mid_market: 178500,
      fy2026_smb: 101300,
    },
  },
  {
    id: "expansion",
    label: "Enterprise Expansion",
    region: "north",
    values: {
      fy2025_enterprise: 312800,
      fy2025_mid_market: 149200,
      fy2025_smb: 83500,
      fy2026_enterprise: 354100,
      fy2026_mid_market: 187600,
      fy2026_smb: 92800,
    },
  },
  {
    id: "partner",
    label: "Partner Launch",
    region: "south",
    values: {
      fy2025_enterprise: 191200,
      fy2025_mid_market: 121900,
      fy2025_smb: 88400,
      fy2026_enterprise: 220500,
      fy2026_mid_market: 142700,
      fy2026_smb: 95700,
    },
  },
  {
    id: "regional",
    label: "Regional Events",
    region: "south",
    values: {
      fy2025_enterprise: 158900,
      fy2025_mid_market: 111300,
      fy2025_smb: 69300,
      fy2026_enterprise: 175400,
      fy2026_mid_market: 125900,
      fy2026_smb: 74200,
    },
  },
  {
    id: "renewal",
    label: "Renewal Push",
    region: "west",
    values: {
      fy2025_enterprise: 215800,
      fy2025_mid_market: 142100,
      fy2025_smb: 76400,
      fy2026_enterprise: 239300,
      fy2026_mid_market: 158200,
      fy2026_smb: 81100,
    },
  },
];

const valueColumns = years.flatMap((year) =>
  segments.map((segment) => ({
    id: `column:${year.id}:${segment.id}`,
    label: segment.label,
    columnNodeId: `column-node:${year.id}:${segment.id}`,
    columnPath: [
      columnPathSegment("year", year.id, year.label),
      columnPathSegment("segment", segment.id, segment.label),
    ],
    measureInstanceId: "measure:revenue",
    role: "value" as const,
  })),
);

const subtotalColumns = years.map((year) => ({
  id: `column:${year.id}:total`,
  label: `${year.label} Total`,
  columnNodeId: `column-node:${year.id}:total`,
  columnPath: [columnPathSegment("year", year.id, year.label)],
  measureInstanceId: "measure:revenue",
  role: "columnSubtotal" as const,
}));

const columns = years.flatMap((year) => [
  ...valueColumns.filter((column) => column.columnPath[0]?.value === year.id),
  subtotalColumns.find((column) => column.columnPath[0]?.value === year.id)!,
]);

export const campaignRevenueMatrix: MatrixGridProjection = {
  schemaVersion: 1,
  shape: "pivot",
  rowHeaderLevels: [
    {
      id: "region",
      label: "Region",
      fieldInstanceId: "row:region",
    },
    {
      id: "campaign",
      label: "Campaign",
      fieldInstanceId: "row:campaign",
    },
  ],
  columnHeaderRows: [
    {
      id: "year-header",
      cells: years.map((year) => ({
        id: `header:${year.id}`,
        label: year.label,
        role: "columnHeader",
        colSpan: 4,
        rowSpan: 1,
        columnPath: [columnPathSegment("year", year.id, year.label)],
        measureInstanceId: "measure:revenue",
      })),
    },
    {
      id: "segment-header",
      cells: years.flatMap((year) => [
        ...segments.map((segment) => ({
          id: `header:${year.id}:${segment.id}`,
          label: segment.label,
          role: "columnHeader" as const,
          colSpan: 1,
          rowSpan: 1,
          columnPath: [
            columnPathSegment("year", year.id, year.label),
            columnPathSegment("segment", segment.id, segment.label),
          ],
          measureInstanceId: "measure:revenue",
        })),
        {
          id: `header:${year.id}:total`,
          label: "Total",
          role: "subtotal" as const,
          colSpan: 1,
          rowSpan: 1,
          columnPath: [columnPathSegment("year", year.id, year.label)],
          measureInstanceId: "measure:revenue",
        },
      ]),
    },
  ],
  columns,
  rows: buildRows(),
};

function buildRows(): MatrixGridProjection["rows"] {
  return regions.flatMap((region) => {
    const regionCampaigns = campaigns.filter((campaign) => campaign.region === region.id);
    const regionPath = [rowPathSegment("region", region.id, region.label)];
    const regionRow: MatrixGridProjection["rows"][number] = {
      id: `row:${region.id}`,
      rowNodeId: `row-node:${region.id}`,
      rowPath: regionPath,
      depth: 0,
      label: region.label,
      role: "rowSubtotal",
      hasChildren: true,
      isExpanded: true,
      cells: columns.map((column) =>
        matrixCell({
          rowId: region.id,
          columnId: column.id,
          role: column.role === "columnSubtotal" ? "columnSubtotal" : "value",
          value: sumColumn(regionCampaigns, column.id),
        }),
      ),
    };

    return [
      regionRow,
      ...regionCampaigns.map((campaign) => ({
        id: `row:${campaign.id}`,
        rowNodeId: `row-node:${campaign.id}`,
        rowPath: [
          ...regionPath,
          rowPathSegment("campaign", campaign.id, campaign.label),
        ],
        depth: 1,
        label: campaign.label,
        role: "value" as const,
        hasChildren: false,
        cells: columns.map((column) =>
          matrixCell({
            rowId: campaign.id,
            columnId: column.id,
            role: column.role === "columnSubtotal" ? "columnSubtotal" : "value",
            value: valueForColumn(campaign, column.id),
          }),
        ),
      })),
    ];
  });
}

function valueForColumn(campaign: Campaign, columnId: string) {
  const [, year, segment] = columnId.split(":");
  if (segment === "total") {
    return segments.reduce(
      (sum, nextSegment) => sum + campaign.values[`${year}_${nextSegment.id}`],
      0,
    );
  }
  return campaign.values[`${year}_${segment}`] ?? 0;
}

function sumColumn(campaignRows: Campaign[], columnId: string) {
  return campaignRows.reduce(
    (sum, campaign) => sum + valueForColumn(campaign, columnId),
    0,
  );
}

function matrixCell({
  rowId,
  columnId,
  role,
  value,
}: {
  rowId: string;
  columnId: string;
  role: "value" | "columnSubtotal";
  value: number;
}): MatrixGridProjection["rows"][number]["cells"][number] {
  return {
    id: `cell:${rowId}:${columnId}`,
    columnId,
    rawValue: value,
    formattedValue: formatCurrency(value),
    presence: "present",
    role,
    measureInstanceId: "measure:revenue",
  };
}

function rowPathSegment(levelId: string, value: string, label: string) {
  return {
    instanceId: `row:${levelId}`,
    fieldKey: `semantic:orders:${levelId}`,
    value,
    label,
  };
}

function columnPathSegment(levelId: string, value: string, label: string) {
  return {
    instanceId: `column:${levelId}`,
    fieldKey: `semantic:orders:${levelId}`,
    value,
    label,
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
