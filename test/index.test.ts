import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as vscode from 'vscode'
import { TreeProvider, create, createTreeItem, renderTree } from '../src/index'
import type { TreeData } from '../src/index'

vi.mock('vscode', () => {
  const dispose = vi.fn()
  const eventEmitterDispose = vi.fn()
  const fire = vi.fn()
  const eventMock = vi.fn()
  const registerTreeDataProvider = vi.fn(() => ({ dispose }))

  return {
    TreeItem: class {
      label: string | vscode.TreeItemLabel
      collapsibleState: number | undefined
      command?: unknown
      iconPath?: unknown
      id?: string
      tooltip?: unknown
      description?: unknown
      contextValue?: unknown
      resourceUri?: unknown
      accessibilityInformation?: unknown

      constructor(
        label: string | vscode.TreeItemLabel,
        collapsibleState?: number,
      ) {
        this.label = label
        this.collapsibleState = collapsibleState
      }
    },
    TreeItemCollapsibleState: {
      None: 0,
      Collapsed: 1,
      Expanded: 2,
    },
    EventEmitter: class {
      event = eventMock
      fire = fire
      dispose = eventEmitterDispose
    },
    window: {
      registerTreeDataProvider,
    },
    Uri: {
      file: (path: string) => ({ fsPath: path }),
    },
    __mock: {
      dispose,
      event: eventMock,
      eventEmitterDispose,
      fire,
      registerTreeDataProvider,
    },
  }
})

interface VscodeMock {
  dispose: ReturnType<typeof vi.fn>
  event: ReturnType<typeof vi.fn>
  eventEmitterDispose: ReturnType<typeof vi.fn>
  fire: ReturnType<typeof vi.fn>
  registerTreeDataProvider: ReturnType<typeof vi.fn>
}

const vscodeMock = (vscode as unknown as { __mock: VscodeMock }).__mock

beforeEach(() => {
  vscodeMock.dispose.mockClear()
  vscodeMock.event.mockClear()
  vscodeMock.eventEmitterDispose.mockClear()
  vscodeMock.fire.mockClear()
  vscodeMock.registerTreeDataProvider.mockClear()
})

describe('createTreeItem', () => {
  it('creates vscode tree items with the expected collapsible state', () => {
    const nodes = createTreeItem([
      {
        label: 'expanded',
        children: [
          {
            label: 'leaf',
          },
        ],
      },
      {
        label: 'collapsed',
        collapsed: true,
        children: [
          {
            label: 'child',
          },
        ],
      },
      {
        label: 'leaf',
      },
    ])

    expect(nodes[0].collapsibleState).toBe(
      vscode.TreeItemCollapsibleState.Expanded,
    )
    expect(nodes[0].children?.[0].collapsibleState).toBe(
      vscode.TreeItemCollapsibleState.None,
    )
    expect(nodes[1].collapsibleState).toBe(
      vscode.TreeItemCollapsibleState.Collapsed,
    )
    expect(nodes[2].collapsibleState).toBe(vscode.TreeItemCollapsibleState.None)
  })

  it('does not mutate input tree data', () => {
    const treeData: TreeData = [
      {
        label: 'root',
        children: [
          {
            label: 'child',
          },
        ],
      },
      {
        label: 'leaf',
      },
    ]

    createTreeItem(treeData)

    expect(treeData).toEqual([
      {
        label: 'root',
        children: [
          {
            label: 'child',
          },
        ],
      },
      {
        label: 'leaf',
      },
    ])
  })

  it('uses explicit ids and leaves missing ids unset', () => {
    const treeData: TreeData = [
      {
        id: 'root-id',
        label: 'root',
        children: [
          {
            label: 'child',
          },
        ],
      },
    ]

    const first = createTreeItem(treeData)
    const second = createTreeItem(treeData)

    expect(first[0].id).toBe('root-id')
    expect(first[0].children?.[0].id).toBeUndefined()
    expect(second[0].id).toBe(first[0].id)
    expect(second[0].children?.[0].id).toBe(first[0].children?.[0].id)
  })

  it('does not set ids for items without explicit ids', () => {
    const nodes = createTreeItem([
      {
        label: 'root',
        children: [
          {
            label: 'child',
          },
        ],
      },
      {
        id: '0/0',
        label: 'another item',
      },
    ])

    expect(nodes[0].id).toBeUndefined()
    expect(nodes[0].children?.[0].id).toBeUndefined()
    expect(nodes[1].id).toBe('0/0')
  })
})

describe('create', () => {
  it('uses explicit id when create is called directly', () => {
    expect(create({ id: 'item-id', label: 'Item' }).id).toBe('item-id')
  })

  it('does not set an id when called directly without an explicit id', () => {
    expect(create({ label: 'Item' }).id).toBeUndefined()
  })

  it('uses collapsed option when create is called directly', () => {
    expect(create({ label: 'root', collapsed: true }).collapsibleState).toBe(
      vscode.TreeItemCollapsibleState.Collapsed,
    )

    expect(create({ label: 'root', collapsed: false }).collapsibleState).toBe(
      vscode.TreeItemCollapsibleState.Expanded,
    )

    expect(create({ label: 'leaf' }).collapsibleState).toBe(
      vscode.TreeItemCollapsibleState.None,
    )
  })

  it('converts string commands to vscode commands', () => {
    const item = create({
      label: 'Run',
      command: 'extension.run',
    })

    expect(item.command).toMatchObject({
      title: 'Run',
      tooltip: 'Run',
      command: 'extension.run',
    })
    expect((item.command as vscode.Command).arguments?.[0]).toBe(item)
  })

  it('uses the text from TreeItemLabel for string command titles', () => {
    const item = create({
      label: { label: 'Highlighted', highlights: [[0, 4]] },
      command: 'extension.run',
    })

    expect(item.label).toEqual({ label: 'Highlighted', highlights: [[0, 4]] })
    expect(item.command).toMatchObject({
      title: 'Highlighted',
      tooltip: 'Highlighted',
      command: 'extension.run',
    })
  })

  it('keeps command objects unchanged', () => {
    const command = {
      title: 'Open',
      command: 'extension.open',
      arguments: ['file'],
    }

    const item = create({
      label: 'Open',
      command,
    })

    expect(item.command).toBe(command)
  })

  it('copies vscode tree item fields', () => {
    const iconPath = {
      light: vscode.Uri.file('/icons/light.svg'),
      dark: vscode.Uri.file('/icons/dark.svg'),
    }
    const resourceUri = vscode.Uri.file('/workspace/file.ts')
    const accessibilityInformation = {
      label: 'File item',
      role: 'treeitem',
    }

    const item = create({
      label: 'File',
      iconPath,
      tooltip: 'Open file',
      description: 'workspace file',
      contextValue: 'treeprovider.file',
      resourceUri,
      accessibilityInformation,
    })

    expect(item.iconPath).toBe(iconPath)
    expect(item.tooltip).toBe('Open file')
    expect(item.description).toBe('workspace file')
    expect(item.contextValue).toBe('treeprovider.file')
    expect(item.resourceUri).toBe(resourceUri)
    expect(item.accessibilityInformation).toBe(accessibilityInformation)
  })
})

describe('TreeProvider', () => {
  it('updates children from new tree data', () => {
    const provider = new TreeProvider([{ label: 'before' }])

    provider.update([{ label: 'after' }])
    const children = provider.getChildren() as ReturnType<typeof createTreeItem>

    expect(vscodeMock.fire).toHaveBeenCalledWith(undefined)
    expect(children[0].label).toBe('after')

    provider.dispose()
  })

  it('ignores updates and refreshes after dispose', () => {
    const provider = new TreeProvider([{ label: 'before' }])

    provider.dispose()
    provider.dispose()
    provider.update([{ label: 'after' }])
    provider.refresh()
    const children = provider.getChildren() as ReturnType<typeof createTreeItem>

    expect(vscodeMock.eventEmitterDispose).toHaveBeenCalledTimes(1)
    expect(vscodeMock.fire).not.toHaveBeenCalled()
    expect(children[0].label).toBe('before')
  })
})

describe('renderTree', () => {
  it('updates provider data without registering a new provider', () => {
    const tree = renderTree([{ label: 'before' }], 'example.view')

    tree.update([{ label: 'after' }])
    const children = tree.provider.getChildren() as ReturnType<
      typeof createTreeItem
    >

    expect(vscodeMock.registerTreeDataProvider).toHaveBeenCalledTimes(1)
    expect(vscodeMock.registerTreeDataProvider).toHaveBeenCalledWith(
      'example.view',
      tree.provider,
    )
    expect(vscodeMock.fire).toHaveBeenCalledWith(undefined)
    expect(children[0].label).toBe('after')

    tree.dispose()
    tree.dispose()
    tree.update([{ label: 'ignored' }])
    const childrenAfterDispose = tree.provider.getChildren() as ReturnType<
      typeof createTreeItem
    >

    expect(vscodeMock.dispose).toHaveBeenCalledTimes(1)
    expect(vscodeMock.eventEmitterDispose).toHaveBeenCalledTimes(1)
    expect(vscodeMock.fire).toHaveBeenCalledTimes(1)
    expect(childrenAfterDispose[0].label).toBe('after')
  })

  it('keeps the deprecated update viewId argument from switching views while updating data', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const tree = renderTree([{ label: 'before' }], 'example.view')

    tree.update([{ label: 'after' }], 'other.view')
    const children = tree.provider.getChildren() as ReturnType<
      typeof createTreeItem
    >

    expect(vscodeMock.registerTreeDataProvider).toHaveBeenCalledTimes(1)
    expect(vscodeMock.fire).toHaveBeenCalledWith(undefined)
    expect(children[0].label).toBe('after')
    expect(warn).toHaveBeenCalledWith(
      'renderTree().update(treeData, viewId) no longer switches views. Create a new tree with renderTree(treeData, viewId) instead.',
    )

    tree.dispose()
    warn.mockRestore()
  })
})
