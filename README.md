# vscode-kubernetes-logs README

Directly invoke kubectl logs [-f]  pod-name command. This basically implements

[UX: Bring back one click Follow Logs and Logs context menu command](https://github.com/Azure/vscode-kubernetes-tools/issues/957)

## Features

The following commands are available on following Kubernetes Explorer tree nodes:

- Pod
- Container nodes (needs extension: [Kubernetes Pod File System Explorer](https://marketplace.visualstudio.com/items?itemName=sandipchitale.kubernetes-file-system-explorer))

|Command|Description|
|-|-|
|```vscode-kubernetes-logs.followLogs```| In a terminal invokes `kubectl logs -f pod-name [-c container-name]` on the selected pod or container|
|```vscode-kubernetes-logs.logs```| In a terminal invoke `kubectl logs pod-name [-c container-name]` on the selected pod or container|
|```vscode-kubernetes-logs.logsOutputToEditor```| Invoke `kubectl logs pod-name [-c container-name]` on the selected pod or container and load output in editor|
|||

## Requirements

Requires vscode-kubernetes-tools extension.

## Known Issues

None.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.3

Initial release.
