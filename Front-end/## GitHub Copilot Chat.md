## GitHub Copilot Chat

- Extension Version: 0.28.5 (prod)
- VS Code: vscode/1.101.2
- OS: Windows

## Network

User Settings:
```json
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: 20.207.73.85 (665 ms)
- DNS ipv6 Lookup: Error (7 ms): getaddrinfo ENOTFOUND api.github.com
- Proxy URL: None (22 ms)
- Electron fetch (configured): HTTP 200 (396 ms)
- Node.js https: HTTP 200 (1836 ms)
- Node.js fetch: HTTP 200 (283 ms)
- Helix fetch: HTTP 200 (422 ms)

Connecting to https://api.individual.githubcopilot.com/_ping:
- DNS ipv4 Lookup: 140.82.114.22 (116 ms)
- DNS ipv6 Lookup: Error (3 ms): getaddrinfo ENOTFOUND api.individual.githubcopilot.com
- Proxy URL: None (28 ms)
- Electron fetch (configured): HTTP 200 (338 ms)
- Node.js https: HTTP 200 (1938 ms)
- Node.js fetch: HTTP 200 (3617 ms)
- Helix fetch: HTTP 200 (2596 ms)

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).