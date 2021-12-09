import * as vscode from "vscode";
import * as k8s from 'vscode-kubernetes-tools-api';
import { platform } from 'os';
import * as path from 'path';
class ContainerNode implements k8s.ClusterExplorerV1.Node {
  private kubectl: k8s.KubectlV1;
  podName: string;
  namespace: string;
  name: string;
  private image: string;
  private initContainer: boolean;
  private volumeMounts: any;

  constructor(kubectl:  k8s.KubectlV1, podName: string, namespace: string, name: string, image: string, initContainer: boolean, volumeMounts: any) {
      this.kubectl = kubectl;
      this.podName = podName;
      this.namespace = namespace;
      this.name = name;
      this.image = image;
      this.initContainer = initContainer;
      this.volumeMounts = volumeMounts;
  }

  async getChildren(): Promise<k8s.ClusterExplorerV1.Node[]> {
      return [];
  }

  getTreeItem(): vscode.TreeItem {
      const treeItem = new vscode.TreeItem(`${this.initContainer ? 'Init Container:' : 'Container: ' } ${this.name} ( ${this.image } )`,
          vscode.TreeItemCollapsibleState.None);
      treeItem.tooltip = `${this.initContainer ? 'Init Container:' : 'Container: ' } ${this.name} ( ${this.image } )`;
      treeItem.contextValue = 'containernode';
      return treeItem;
  }
}

export async function activate(context: vscode.ExtensionContext) {
  const explorer = await k8s.extension.clusterExplorer.v1;
  if (!explorer.available) {
      vscode.window.showErrorMessage(`ClusterExplorer not available.`);
      return;
  }

  const kubectl = await k8s.extension.kubectl.v1;
  if (!kubectl.available) {
      vscode.window.showErrorMessage(`kubectl not available.`);
      return;
  }


  let disposable = vscode.commands.registerCommand("vscode-kubernetes-logs.followLogs", followLogs);
  context.subscriptions.push(disposable);
  disposable = vscode.commands.registerCommand("vscode-kubernetes-logs.logs", logs);
  context.subscriptions.push(disposable);
  disposable = vscode.commands.registerCommand("vscode-kubernetes-logs.logsOutputToEditor", logsOutputToEditor);
  context.subscriptions.push(disposable);
}

async function followLogs(target?: any) {
  _logs(target, true);
}

async function logs(target?: any) {
  _logs(target);
}

async function logsOutputToEditor(target?: any) {
  _logs(target, false, true);
}

async function _logs(target?: any, follow = false, outputToEditor = false) {
  const explorer = await k8s.extension.clusterExplorer.v1;
  if (!explorer.available) {
    return;
  }

  const kubectl = await k8s.extension.kubectl.v1;
  if (!kubectl.available) {
    vscode.window.showErrorMessage(`kubectl not available.`);
    return;
  }

  const commandTarget = explorer.api.resolveCommandTarget(target);
  if (commandTarget) {
    if (commandTarget.nodeType === 'resource') {
      if (commandTarget.resourceKind.manifestKind === 'Pod') {

        if (outputToEditor) {
          showInEditor(`logs ${commandTarget.name} --namespace ${commandTarget.namespace}`);
        } else {
          const terminal = vscode.window.activeTerminal || vscode.window.createTerminal(`Follow logs: ${commandTarget.namespace}/${commandTarget.name}`);
          terminal.show();
          terminal.sendText(`kubectl logs ${follow ? '-f' : ''} --namespace ${commandTarget.namespace} ${commandTarget.name}`);
        }
        return;
      }
    } else if (target && target.nodeType === 'extension') {
      if (target.impl.constructor.name === 'ContainerNode') {
        const container = target.impl as any;
        if (outputToEditor) {
          showInEditor(`logs  --namespace ${container.namespace} ${container.podName} -c ${container.name} `);
        } else {
          if (vscode.window.activeTerminal) {
            vscode.window.activeTerminal.sendText(`kubectl logs ${follow ? '-f' : ''} --namespace ${container.namespace} ${container.podName} -c ${container.name}`);
          }
        }
      }
    }
  }
}

async function showInEditor(command: string) {
  const kubectl = await k8s.extension.kubectl.v1;
  if (!kubectl.available) {
    vscode.window.showErrorMessage(`kubectl not available.`);
    return;
  }
  const logsResults = await kubectl.api.invokeCommand(command);
  if (logsResults?.code === 0) {
    // Open the document
    const templatePreviewDocument: vscode.TextDocument = await vscode.workspace.openTextDocument({
      language: 'log',
      content: `${command}\n\n${logsResults.stdout}`
    });
    const templatePreviewTextEditor = await vscode.window.showTextDocument(templatePreviewDocument, vscode.ViewColumn.Active);
  }
}

export async function deactivate() {}
