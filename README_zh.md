<p align="center">
<img src="./assets/kv.png" alt="vscode-use/treeprovider">
</p>
<p align="center"> <a href="./README.md">English</a> | 简体中文</p>

这个库是为了快速在 vscode 插件中使用 TreeDataProvider 使用侧边栏树，让使用上更加简单

## 安装

```
npm i @vscode-use/treeprovider
```

```ts
import * as vscode from 'vscode'
import { renderTree } from '@vscode-use/treeprovider'

export function activate(context: vscode.ExtensionContext) {
  const tree = renderTree(treeData, 'example1.id')

  context.subscriptions.push({ dispose: tree.dispose })
  context.subscriptions.push(
    vscode.commands.registerCommand('refresh-tree', () => {
      // 更新树
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

## 树数据

```ts
interface TreeDataItem {
  id?: string // 推荐设置，用于稳定展开和选择状态
  label: string
  collapsed?: boolean // true = 折叠，false/undefined = 有 children 时默认展开
  children?: TreeDataItem[]
  command?: string | vscode.Command
  iconPath?: vscode.TreeItem['iconPath']
  tooltip?: string | vscode.MarkdownString
  description?: string | boolean
  contextValue?: string
  resourceUri?: vscode.Uri
}
```

`renderTree().update(treeData)` 会更新当前 view。需要使用不同的 `viewId` 时，请通过 `renderTree(treeData, nextViewId)` 创建新的 tree。

## License

[MIT](./LICENSE) License © 2022 [Simon He](https://github.com/Simon-He95)

<a href="https://github.com/Simon-He95/sponsor" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" style="height: 51px !important;width: 217px !important;" ></a>
