import { useState } from "react";
import { AlertCircle, Database, Grid3X3, Table2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ServerDataTableBasicExample,
  type ServerTableExampleControls,
} from "./examples/server-data-table-basic";
import {
  MatrixTableBasicExample,
  type MatrixTableExampleControls,
} from "./examples/matrix-table-basic";

export function ComponentGallery() {
  const [controls, setControls] = useState<ServerTableExampleControls>({
    pageSize: 25,
    latencyMs: 250,
    errorMode: "none",
    totalRowCount: 240,
  });
  const [matrixControls, setMatrixControls] = useState<MatrixTableExampleControls>({
    latencyMs: 250,
    errorMode: "none",
  });

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="secondary">Fixture gallery</Badge>
              <Badge variant="outline">No live Semaphor runtime</Badge>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Data App Components</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Inspect reusable shadcn registry components for Semaphor Data Apps with deterministic fixture data.
            </p>
          </div>
        </header>

        <Tabs defaultValue="server-data-table" className="space-y-4">
          <TabsList>
            <TabsTrigger value="server-data-table">
              <Table2 className="size-4" />
              Server Data Table
            </TabsTrigger>
            <TabsTrigger value="matrix-table">
              <Grid3X3 className="size-4" />
              Matrix Table
            </TabsTrigger>
            <TabsTrigger value="query-state">
              <AlertCircle className="size-4" />
              Query State
            </TabsTrigger>
          </TabsList>

          <TabsContent value="server-data-table" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Server table controls</CardTitle>
                <CardDescription>
                  These controls drive the fake server so pagination, sorting, loading, and error states can be reviewed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <ControlSelect
                    label="Page size"
                    value={String(controls.pageSize)}
                    options={["10", "25", "50", "100"]}
                    onValueChange={(value) =>
                      setControls((current) => ({ ...current, pageSize: Number(value) }))
                    }
                  />
                  <ControlSelect
                    label="Latency"
                    value={String(controls.latencyMs)}
                    options={["0", "250", "800", "1600"]}
                    onValueChange={(value) =>
                      setControls((current) => ({ ...current, latencyMs: Number(value) }))
                    }
                  />
                  <ControlSelect
                    label="Error mode"
                    value={controls.errorMode}
                    options={["none", "network", "server"]}
                    onValueChange={(value) =>
                      setControls((current) => ({
                        ...current,
                        errorMode: value as ServerTableExampleControls["errorMode"],
                      }))
                    }
                  />
                  <ControlSelect
                    label="Total rows"
                    value={String(controls.totalRowCount)}
                    options={["0", "24", "240"]}
                    onValueChange={(value) =>
                      setControls((current) => ({ ...current, totalRowCount: Number(value) }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <ServerDataTableBasicExample
              {...controls}
              onPageSizeChange={(pageSize) =>
                setControls((current) => ({ ...current, pageSize }))
              }
            />
          </TabsContent>

          <TabsContent value="matrix-table" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Matrix table controls</CardTitle>
                <CardDescription>
                  These controls drive the fake matrix response so loading and error states can be reviewed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <ControlSelect
                    label="Latency"
                    value={String(matrixControls.latencyMs)}
                    options={["0", "250", "800", "1600"]}
                    onValueChange={(value) =>
                      setMatrixControls((current) => ({ ...current, latencyMs: Number(value) }))
                    }
                  />
                  <ControlSelect
                    label="Error mode"
                    value={matrixControls.errorMode}
                    options={["none", "network", "server"]}
                    onValueChange={(value) =>
                      setMatrixControls((current) => ({
                        ...current,
                        errorMode: value as MatrixTableExampleControls["errorMode"],
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <MatrixTableBasicExample {...matrixControls} />
          </TabsContent>

          <TabsContent value="query-state">
            <Card>
              <CardHeader>
                <CardTitle>Query state item</CardTitle>
                <CardDescription>
                  `query-state` is installed with the table item and can also be used by charts or KPI cards.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Database className="size-4" />
                  Loading, error, empty, and success states are presentation-only. Query correctness remains in the SDK.
                </div>
                <Separator />
                <p className="text-sm">
                  The server table tab exercises the query state component through loading, error, and empty table cases.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

type ControlSelectProps = {
  label: string;
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
};

function ControlSelect({ label, value, options, onValueChange }: ControlSelectProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue !== null) onValueChange(nextValue);
        }}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
