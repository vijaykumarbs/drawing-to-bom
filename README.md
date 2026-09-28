# Drawing to BOM

# Drawing to BOM

Manufacturing ERP implementations depend on accurate item masters and bills of material. In practice, teams often re-key drawing callouts into spreadsheets, reconcile inconsistent descriptions and units by hand, and ask engineering to review the same fields repeatedly. This creates a slow handoff and leaves transcription errors difficult to trace before item or BOM load.

Drawing to BOM explores whether AI-assisted extraction can turn an engineering drawing into an editable, reviewable BOM draft and CSV export. It does not replace engineering approval or determine production readiness. Product rationale, deferred scope, and proposed pilot measures are in [PRODUCT.md](PRODUCT.md).

**Current evidence status:** no pilot outcomes are recorded in this repository; the potential time and quality benefits remain hypotheses until measured with a manufacturing implementation team.

## Use it

1. Start a local web server with `./run-local.sh` (macOS/Linux) or `run-local.bat` (Windows). Python 3 is required. A local server is needed because browser ES modules are not reliably available from `file://` URLs.
2. Open `http://127.0.0.1:8080`.
3. Open Settings, paste an API key, and save it. Recognized key prefixes are detected locally. If a key format is ambiguous, choose its provider under Advanced settings.
4. Upload a JPG, PNG, or WEBP drawing, extract the BoM, review and edit the rows, then export CSV.

Supported providers: Gemini, OpenAI, and Anthropic. Each extraction sends the image and the API key directly from the browser to the selected provider. Provider models and access policies can change; see [deployment and operations](docs/deployment.md).

## Design

The app uses a small, static three-layer structure:

```text
src/ui       Browser events, rendering, and CSV interaction
src/application  Extraction use case and orchestration
src/domain   BoM normalization and response parsing
src/infrastructure  Provider HTTP adapters and browser settings storage
```

This is intentionally an MVP without a server, database, accounts, or build pipeline. The seams allow a backend proxy and secret manager to be added later without putting server concerns in the UI.

## Data and security

- Drawings are held in memory in the current tab and are not uploaded to this app's host. They are sent to the selected AI provider when the user starts extraction.
- The API key is saved in browser `localStorage` for this site until it is removed or the user clears site data. It is not written into the repository.
- Browser storage is plaintext from the perspective of the browser profile. Same-origin JavaScript, browser extensions with access, and the device user can read it. Direct browser API access does not provide server-grade secret protection.
- For team use, shared paid credentials, or stronger secret controls, put a server-side API proxy in front of providers. Store provider credentials in a secret manager, apply user authentication, request size limits, rate limits, usage budgets, and avoid logging keys or drawing contents.
- Provider output is untrusted. Review all parts and quantities before using the CSV for purchasing, quoting, or production.

See [architecture](docs/architecture.md) and [deployment](docs/deployment.md) for details.
