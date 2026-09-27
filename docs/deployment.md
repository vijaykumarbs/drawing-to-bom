# Deployment

## Local use on a customer machine

The app runs as static files and requires Python 3 only to serve ES modules over loopback HTTP. Start `run-local.sh` or `run-local.bat`; the server binds to `127.0.0.1`, so it is not exposed to the local network. No project dependencies or build step are needed. An internet connection is required for provider calls.

For a polished installable product, package the static UI in a signed desktop shell (for example, a managed WebView/Electron/Tauri application) and use the operating system's credential store. The current browser MVP uses localStorage instead.

## Cloud static hosting

This static directory can be deployed to GitHub Pages or another HTTPS static host. Keep all files at one origin and enable HTTPS. User keys remain in each user's browser profile and do not enter the Git repository or hosting provider. Provider API access, CORS policy, usage limits, and billing are still controlled by each provider and key owner.

For public/shared deployments, add a server-side API proxy before distributing broadly. Do not embed an operator-owned provider key in static JavaScript or build variables: anyone receiving the page can extract it. Add authentication, abuse controls, quotas, secret management, privacy disclosures, and an appropriate data-retention policy before offering a shared service.

## Local static server

The included launch scripts bind only to loopback. For a production customer install, use a signed installer and a maintained local webview/server process rather than asking users to run an arbitrary shell script. Static site hosting and the included local server do not provide an application backend.

## Provider maintenance

Provider model IDs, request formats, CORS rules, and model availability change over time. Review official provider API documentation before changing adapter settings. Keep updates within `src/infrastructure/provider-client.js`, then verify each provider with its own test key in a development environment.
