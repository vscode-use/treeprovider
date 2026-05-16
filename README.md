<p align="center">
<img src="./assets/kv.png" alt="vscode-use/treeprovider">
</p>
<p align="center"> English | <a href="./README_zh.md">简体中文</a></p>

This library is designed to quickly use the tree data provider in the vscode plugin using sidebar trees to make it easier to use

## Install

```
npm i @vscode-use/treeprovider
```

```ts
import * as vscode from 'vscode'
import { renderTree } from '@vscode-use/treeprovider'

export function activate(context: vscode.ExtensionContext) {
  const tree = renderTree(treeData, 'example1.id')

  context.subscriptions.push(tree)
  context.subscriptions.push(
    vscode.commands.registerCommand('refresh-tree', () => {
      // Update the tree
      tree.update([
        {
          label: 'label-2',
          collapsed: true,
          children: [
            {
              label: 'label-2-1',
              command: {
                title: 'label-2-1',
                command: 'command-2',
                arguments: ['2-1'],
              },
            },
          ],
        },
        {
          label: 'label-3',
          children: [
            {
              label: 'label-3-1',
              command: {
                title: 'label-3-1',
                command: 'command-3',
                arguments: ['3-1'],
              },
            },
          ],
        },
      ])
    }),
  )
}
```

[example](/examples/example1)

## Tree data

```ts
interface TreeDataItem {
  id?: string // recommended: stable and unique within the tree
  label: string
  collapsed?: boolean // true = collapsed, false/undefined = expanded when children exist
  children?: TreeDataItem[]
  command?: string | vscode.Command
  iconPath?: vscode.TreeItem['iconPath']
  tooltip?: string | vscode.MarkdownString
  description?: string | boolean
  contextValue?: string
  resourceUri?: vscode.Uri
}
```

When items may be reordered or inserted, provide an explicit `id`. The internal fallback id is path-based and is only stable while the item order stays unchanged.

`renderTree().update(treeData)` updates the existing view. The deprecated `update(treeData, viewId)` signature is kept for compatibility, but it no longer switches views. To use a different `viewId`, create a new tree with `renderTree(treeData, nextViewId)`.

The `collapsed` behavior above applies to `renderTree()` and `createTreeItem()`. `create()` creates one item directly and uses the given `collapsed` option directly. It only assigns an id when you pass `id`.

## License

[MIT](./LICENSE) License © 2022 [Simon He](https://github.com/Simon-He95)

<a href="https://github.com/Simon-He95/sponsor" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" style="height: 51px !important;width: 217px !important;" ></a>
