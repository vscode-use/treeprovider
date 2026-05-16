import * as vscode from 'vscode'

export interface CreateOptions {
  id?: string
  label: string
  children?: TreeData
  collapsed?: boolean
  command?: string | vscode.Command
  iconPath?: vscode.TreeItem['iconPath']
  tooltip?: string | vscode.MarkdownString
  description?: string | boolean
  contextValue?: string
  resourceUri?: vscode.Uri
}

export type TreeDataItem = CreateOptions
export type TreeData = TreeDataItem[]

export interface TreeNode extends vscode.TreeItem {
  raw: TreeDataItem
  children?: TreeNode[]
}

export class TreeProvider implements vscode.TreeDataProvider<TreeNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<
    TreeNode | undefined | null | void
  >()

  public readonly onDidChangeTreeData = this._onDidChangeTreeData.event

  constructor(private treeData: TreeData) {}

  getChildren(element?: TreeNode): vscode.ProviderResult<TreeNode[]> {
    if (element)
      return element.children ?? []

    return createTreeItem(this.treeData)
  }

  getTreeItem(element: TreeNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element
  }

  public update(treeData: TreeData): void {
    this.treeData = treeData
    this.refresh()
  }

  public refresh(): void {
    this._onDidChangeTreeData.fire(undefined)
  }
}

export function createTreeItem(treeData: TreeData): TreeNode[] {
  return createTreeItems(treeData)
}

function createTreeItems(treeData: TreeData, parentId = ''): TreeNode[] {
  return treeData.map((data, index) => {
    const fallbackId = parentId
      ? `${parentId}/${index}:${data.label}`
      : `${index}:${data.label}`
    const id = data.id ?? fallbackId
    const result = create(data, id, getCollapsibleState(data))

    if (data.children?.length)
      result.children = createTreeItems(data.children, id)

    return result
  })
}

export function create(
  options: CreateOptions,
  fallbackId = options.label,
  collapsibleState = getCollapsibleState(options),
): TreeNode {
  const {
    id,
    label,
    command,
    iconPath,
    tooltip,
    description,
    contextValue,
    resourceUri,
  } = options
  const item = new vscode.TreeItem(label, collapsibleState) as TreeNode

  item.raw = options
  item.id = id ?? fallbackId

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

  if (iconPath)
    item.iconPath = iconPath

  if (tooltip !== undefined)
    item.tooltip = tooltip

  if (description !== undefined)
    item.description = description

  if (contextValue !== undefined)
    item.contextValue = contextValue

  if (resourceUri !== undefined)
    item.resourceUri = resourceUri

  return item
}

function getCollapsibleState(
  data: CreateOptions,
): vscode.TreeItemCollapsibleState {
  const hasChildren = Boolean(data.children?.length)

  if (!hasChildren)
    return vscode.TreeItemCollapsibleState.None

  return data.collapsed
    ? vscode.TreeItemCollapsibleState.Collapsed
    : vscode.TreeItemCollapsibleState.Expanded
}

export function createIconPath(
  extensionContext: vscode.ExtensionContext,
  url: string,
) {
  return {
    light: vscode.Uri.file(extensionContext.asAbsolutePath(url)),
    dark: vscode.Uri.file(extensionContext.asAbsolutePath(url)),
  }
}

export function renderTree(treeData: TreeData, viewId: string) {
  const provider = new TreeProvider(treeData)
  const disposable = vscode.window.registerTreeDataProvider(viewId, provider)

  return {
    dispose() {
      disposable.dispose()
    },
    update(treeData: TreeData) {
      provider.update(treeData)
    },
    provider,
  }
}

// export function activate(context: vscode.ExtensionContext) {
//   const treeData: TreeData = [
//     {
//       label: 'label-1',
//       collapsed: true,
//       children: [
//         {
//           label: 'label-1-1',
//           command: {
//             title: 'label-1-1',
//             command: 'command-1',
//             arguments: ['1-1']
//           }
//         }
//       ]
//     },
//     {
//       label: 'label-2',
//       children: [
//         {
//           label: 'label-2-1',
//           command: {
//             title: 'label-2-1',
//             command: 'command-1',
//             arguments: ['2-1']
//           }
//         }
//       ]
//     }
//   ]
//   vscode.commands.registerCommand('command-1', (data) => {
//     debugger
//   })

//   // context.subscriptions.push()
//   const { dispose, update } = renderTree(treeData, 'example1.id')
//   vscode.commands.registerCommand('refresh-tree', () => {
//     update([
//       {
//         label: 'label-2',
//         collapsed: true,
//         children: [
//           {
//             label: 'label-2-1',
//             command: {
//               title: 'label-2-1',
//               command: 'command-2',
//               arguments: ['2-1']
//             }
//           }
//         ]
//       },
//       {
//         label: 'label-3',
//         children: [
//           {
//             label: 'label-3-1',
//             command: {
//               title: 'label-3-1',
//               command: 'command-3',
//               arguments: ['3-1']
//             }
//           }
//         ]
//       }
//     ])
//   })
// }
