# Semaphor View Card

Card shell for Semaphor Data App views.

Use this around generated KPI, chart, table, matrix, and analysis views so each
card shows consistent title, description, query state, and filter-scope
affordances.

This component does not infer analytics semantics from labels, rows, or chart
data. Pass filter summaries from the generated Data App input contract:

- app-level controls render with `filter-controls`;
- active values are summarized with `getSemaphorActiveFilterSummaries`;
- view scope comes from `inputs[].appliesToViewIds` or equivalent generated
  codegen-summary metadata.

