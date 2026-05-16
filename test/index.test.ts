import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as vscode from 'vscode'
import { create, createTreeItem, renderTree } from '../src/index'
import type { TreeData } from '../src/index'

vi.mock('vscode', () => {
  const dispose = vi.fn()
  const eventEmitterDispose = vi.fn()
  const fire = vi.fn()
  const eventMock = vi.fn()
  const registerTreeDataProvider = vi.fn(() => ({ dispose }))

  return {
    TreeItem: class {
      label: string
      collapsibleState: number | undefined
      command?: unknown
      iconPath?: unknown
      id?: string
      tooltip?: unknown
      description?: unknown
      contextValue?: unknown
      resourceUri?: unknown

      constructor(label: string, collapsibleState?: number) {
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

  it('uses stable ids for the same input', () => {
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
    expect(first[0].children?.[0].id).toBe('root-id/0:child')
    expect(second[0].id).toBe(first[0].id)
    expect(second[0].children?.[0].id).toBe(first[0].children?.[0].id)
  })
})

describe('create', () => {
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

    const item = create({
      label: 'File',
      iconPath,
      tooltip: 'Open file',
      description: 'workspace file',
      contextValue: 'treeprovider.file',
      resourceUri,
    })

    expect(item.iconPath).toBe(iconPath)
    expect(item.tooltip).toBe('Open file')
    expect(item.description).toBe('workspace file')
    expect(item.contextValue).toBe('treeprovider.file')
    expect(item.resourceUri).toBe(resourceUri)
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

    expect(vscodeMock.dispose).toHaveBeenCalledTimes(1)
    expect(vscodeMock.eventEmitterDispose).toHaveBeenCalledTimes(1)
  })
})
