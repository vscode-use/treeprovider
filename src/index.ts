import * as vscode from 'vscode'
import { nanoid } from 'nanoid'
import type { ThemeIcon, TreeItem, Uri } from 'vscode'

interface Node {
  key: string
}

export type TreeData = (CreateOptions & { children?: TreeData })[]

export interface CreateOptions {
  label: string
  collapsed?: boolean
  command?: string | vscode.Command
  iconPath?: Uri | { light: Uri; dark: Uri } | ThemeIcon
}

export class TreeProvider implements vscode.TreeDataProvider<any> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    (Node | undefined)[] | undefined
  > = new vscode.EventEmitter<Node[] | undefined>()

  public onDidChangeTreeData: vscode.Event<any>
    = this._onDidChangeTreeData.event

  private treeNodes: any = []
  constructor(private treeData: TreeData) {}

  getChildren(element?: any): vscode.ProviderResult<any[]> {
    if (element) {
      return element.children ?? []
    }
    else {
      this.treeNodes = createTreeItem(this.treeData)
      return this.treeNodes
    }
  }

  getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
    return element
  }

  public refresh(): void {
    this._onDidChangeTreeData.fire(this.treeNodes)
  }
}

export function createTreeItem(treeData: TreeData) {
  return treeData.map((data) => {
    const hasChildren = data.children && data.children.length
    if (data.collapsed === undefined && hasChildren)
      data.collapsed = false
    else if (!hasChildren)
      data.collapsed = undefined
    const result = create(data) as any
    if (hasChildren)
      result.children = createTreeItem(data.children!) as any

    return result
  })
}

export function create(options: CreateOptions) {
  const { label, collapsed, command, iconPath } = options
  const item = new vscode.TreeItem(
    label,
    collapsed === undefined ? 0 : collapsed ? 1 : 2,
  )

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

  item.id = nanoid()

  return item
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
  let treeProvider = new TreeProvider(treeData)
  let dispose = vscode.window.registerTreeDataProvider(viewId, treeProvider)
  const unmount = () => {
    dispose.dispose()
    dispose = vscode.window.registerTreeDataProvider(viewId, {
      getTreeItem: () => null as any,
      getChildren: () => [],
    })
  }
  return {
    dispose: unmount,
    update(treeData: TreeData, _viewId: string = viewId) {
      unmount()
      treeProvider = new TreeProvider(treeData)
      nextTick(() => {
        dispose = vscode.window.registerTreeDataProvider(_viewId, treeProvider)
      })
    },
  }
}

function nextTick(fn: () => void) {
  return vscode.workspace.applyEdit(new vscode.WorkspaceEdit()).then(fn)
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
