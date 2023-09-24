<p align="center">
<img src="./assets/kv.png" alt="vscode-use/treeprovider">
</p>
<p align="center"> English | <a href="./README_zh.md">简体中文</a></p>

> WIP: This library is designed to quickly use the tree data provider in the vscode plugin using sidebar trees to make it easier to use

```code
import { renderTree } from '@vscode-use/treeprovider'
export function activate(context: vscode.ExtensionContext) {
  const { dispose, update } = renderTree(treeData, 'example1.id')
  vscode.commands.registerCommand('refresh-tree', () => { // Update the tree
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
