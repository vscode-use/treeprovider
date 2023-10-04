<p align="center">
<img src="./assets/kv.png" alt="vscode-use/treeprovider">
</p>
<p align="center"> <a href="./README.md">English</a> | 简体中文</p>

这个库是为了快速在 vscode 插件中使用 TreeDataProvider 使用侧边栏树，让使用上更加简单

## 安装

```
npm i @vscode-use/treeprovider
```

```code
import { renderTree } from '@vscode-use/treeprovider'
export function activate(context: vscode.ExtensionContext) {
  const { dispose, update } = renderTree(treeData, 'example1.id')
  vscode.commands.registerCommand('refresh-tree', () => { // 更新树
    update([
      {
        label: 'label-2',
        collapsed: true,
        children: [
          {
            label: 'label-2-1',
            command: {
              title: 'label-2-1',
              command: 'command-2',
              arguments: ['2-1']
            }
          }
        ]
      },
      {
        label: 'label-3',
        children: [
          {
            label: 'label-3-1',
            command: {
              title: 'label-3-1',
              command: 'command-3',
              arguments: ['3-1']
            }
          }
        ]
      }
    ])
  })
}

```

[example](/examples/example1)

## License

[MIT](./LICENSE) License © 2022 [Simon He](https://github.com/Simon-He95)

<a href="https://github.com/Simon-He95/sponsor" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" style="height: 51px !important;width: 217px !important;" ></a>
