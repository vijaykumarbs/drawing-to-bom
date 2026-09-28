# Drawing to BOM — Product brief

## Problem and evidence

In manufacturing ERP implementations, item and BOM setup depends on transferring drawing information into structured records. The common workaround is manual transcription into spreadsheets followed by engineering review. It consumes specialist time and creates opportunities for missed callouts, unit mismatches, and ambiguous descriptions to survive into later review stages.

This is a workflow hypothesis based on common manufacturing master-data handoffs. No customer interview, pilot result, or measured baseline is recorded here. No extraction accuracy or time-saving claim is made.

## Product choice and prioritization

Prioritize a reviewable draft BOM from an uploaded drawing, with editable rows and CSV export. This targets the transcription handoff while keeping an engineer in control. Extraction and normalization are the product boundary; approval and ERP loading remain human/system responsibilities.

## Success criteria

With a manufacturing implementation analyst and an engineer, compare the current transcription workflow to a tool-assisted review on an approved representative drawing set. Capture:

- time to produce an engineer-approved BOM;
- precision and recall for part number, description, quantity, and unit fields;
- number and severity of corrections after extraction;
- whether every final value can be traced to the drawing evidence;
- cases where drawing quality, symbols, or revisions prevent reliable extraction.

Set thresholds with the pilot participants before evaluation. Any field without adequate evidence must remain flagged for human review. Publish sample size and drawing limitations with results.

## Deferred

- direct PLM/ERP integration, item creation, and production release;
- multi-page/revision reconciliation and specialized symbol interpretation;
- automatic approval, tolerance inference, or unsupported accuracy guarantees;
- regulated drawing retention, team workspaces, and central credentials.

## Learning to capture

Record which drawing types and fields dominate review effort, common correction patterns, acceptable confidence/evidence presentation, and whether the CSV fits the receiving ERP template. Do not commit customer drawings or identifiers.
