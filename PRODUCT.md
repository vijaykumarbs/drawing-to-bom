# Drawing to BOM — Product plan

## What it does

Drawing to BOM takes an engineering drawing and uses an AI provider to create a draft bill of materials (BOM). The user can review and edit the rows, then download them as CSV.

The draft is not an approved manufacturing BOM. An engineer must check it against the drawing before anyone uses it.

## Who it is for

An ERP or manufacturing implementation analyst who must prepare item and BOM data from engineering drawings, together with an engineer who can confirm the result.

## The problem

Teams often read part names, numbers, quantities, and units from drawings and type them into a spreadsheet. This takes time and can introduce typing errors. The resulting sheet still needs engineering review before it can be used for ERP setup.

This is the problem the product is designed to address. No pilot, extraction accuracy, or time savings have been reported.

## First version

1. Upload a JPG, PNG, or WEBP drawing.
2. Send the drawing and the user's API key directly to the selected AI provider.
3. Show the extracted BOM rows in an editable table.
4. Let the user correct the rows and export a CSV.

The API key is saved in browser storage. The drawing goes to the AI provider when extraction starts. Provider rules and charges apply.

## Why this scope

Start with draft extraction, editing, and CSV export. This targets the manual copy step while leaving approval with the engineer. Keep the original drawing available for checking each quantity and description.

## Not included

- creating or approving items in an ERP or product lifecycle system;
- deciding that a part is safe to manufacture;
- combining drawing revisions or interpreting every symbol and drawing format;
- automatic approval of extracted values;
- shared team accounts or company-managed API keys.

## Pilot and measures

**Status: no pilot run yet.** Use drawings approved for evaluation. Have an analyst prepare BOMs using the current method and with the tool. Have an engineer create the reference list and check both results.

Record:

- minutes until the engineer approves the BOM;
- correct and incorrect part numbers, descriptions, quantities, and units;
- number of edits needed after extraction;
- fields that cannot be traced to a clear place on the drawing.

Agree acceptable error levels with the engineer before the trial. Any unclear value must be marked for review, not treated as correct. Do not publish drawings or claim accuracy or savings without measured results and permission.

## Questions to answer

- Which fields take the longest to transcribe?
- Which drawing types lead to the most corrections?
- Can reviewers trace each extracted value back to the drawing?
- Does the CSV match the format required by the receiving ERP?
