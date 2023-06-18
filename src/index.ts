import * as vscode from 'vscode'
import { nanoid } from 'nanoid'

interface TreeData {
  treeItem: vscode.TreeItem
  children: vscode.TreeItem[]
}
export class TreeProvider implements vscode.TreeDataProvider<any> {
  private _onDidChangeTreeData: vscode.EventEmitter<any | undefined | void>
    = new vscode.EventEmitter<any | undefined | void>()

  readonly onDidChangeTreeData: vscode.Event<any | undefined | void>
    = this._onDidChangeTreeData.event

  treeData: TreeData[] = []
  constructor(private extensionContext: vscode.ExtensionContext) {}

  getChildren(element?: any): vscode.ProviderResult<any[]> {
    return element.treeItem ?? element
  }

  getTreeItem(element: any): Thenable<vscode.TreeItem> {
    if (element)
      return element.children ?? element

    return this.treeData as any
  }

  public update(treeData: any[]) {
    this.treeData = treeData
  }

  public createTreeItem<T extends string | vscode.Command>(
    label: string,
    collapsibleState: vscode.TreeItemCollapsibleState = 0,
    command?: T,
    icon?: string,
  ) {
    const item = new vscode.TreeItem(label, collapsibleState)
    if (command) {
      if (typeof command === 'string') {
        item.command = {
          title: label,
          tooltip: label,
          command,
          arguments: [item],
        }
      }
      else {
        item.command = command
      }
    }
    if (icon) {
      item.iconPath = {
        light: vscode.Uri.file(
          this.extensionContext.asAbsolutePath(`assets/light/${icon}.svg`),
        ),
        dark: vscode.Uri.file(
          this.extensionContext.asAbsolutePath(`assets/dark/${icon}.svg`),
        ),
      }
    }

    item.id = nanoid()
  }

  public refresh(): void {
    this._onDidChangeTreeData.fire(this.treeData)
  }
}
