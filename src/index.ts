import * as vscode from 'vscode'

export interface CreateOptions {
  id?: string
  label: string
  collapsed?: boolean
  command?: string | vscode.Command
  iconPath?: vscode.TreeItem['iconPath']
  tooltip?: string | vscode.MarkdownString
  description?: string | boolean
  contextValue?: string
  resourceUri?: vscode.Uri
}

export interface TreeDataItem extends CreateOptions {
  children?: TreeData
}

export type TreeData = TreeDataItem[]

export interface TreeNode extends vscode.TreeItem {
  raw: TreeDataItem
  children?: TreeNode[]
}

export interface RenderTreeResult extends vscode.Disposable {
  update(treeData: TreeData, viewId?: string): void
  provider: TreeProvider
}

export class TreeProvider
implements vscode.TreeDataProvider<TreeNode>, vscode.Disposable {
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

  public dispose(): void {
    this._onDidChangeTreeData.dispose()
  }
}

export function createTreeItem(treeData: TreeData): TreeNode[] {
  return createTreeItems(treeData)
}

function createTreeItems(treeData: TreeData, parentId = ''): TreeNode[] {
  return treeData.map((data, index) => {
    const fallbackId = parentId ? `${parentId}/${index}` : `${index}`
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
  collapsibleState = getCreateCollapsibleState(options),
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

  if (iconPath !== undefined)
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

function getCreateCollapsibleState(
  options: Pick<CreateOptions, 'collapsed'>,
): vscode.TreeItemCollapsibleState {
  if (options.collapsed === undefined)
    return vscode.TreeItemCollapsibleState.None

  return options.collapsed
    ? vscode.TreeItemCollapsibleState.Collapsed
    : vscode.TreeItemCollapsibleState.Expanded
}

function getCollapsibleState(
  data: TreeDataItem,
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

export function renderTree(
  treeData: TreeData,
  viewId: string,
): RenderTreeResult {
  const provider = new TreeProvider(treeData)
  const disposable = vscode.window.registerTreeDataProvider(viewId, provider)
  let disposed = false

  return {
    dispose() {
      if (disposed)
        return

      disposed = true
      disposable.dispose()
      provider.dispose()
    },
    update(treeData: TreeData, nextViewId?: string) {
      if (disposed)
        return

      if (nextViewId && nextViewId !== viewId) {
        throw new Error(
          'renderTree().update(treeData, viewId) is no longer supported. Create a new tree with renderTree(treeData, viewId).',
        )
      }

      provider.update(treeData)
    },
    provider,
  }
}
