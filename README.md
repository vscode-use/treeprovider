<p align="center">
<img src="./assets/kv.png" alt="vscode-use/treeprovider">
</p>
<p align="center"> English | <a href="./README_zh.md">简体中文</a></p>

> WIP: This library is designed to quickly use the tree data provider in the vscode plugin using sidebar trees to make it easier to use

```code
import { TreeProvider } from '@vscode-use/treeprovider'
const provider = new TreeProvider(content)
const treeItem1 = provider.createTreeItem('tree level 1')
const treeItem2 = provider.createTreeItem('tree level 2')
treeItem1.children = [
   provider.createTreeItem('tree level 1 - 1'),
   provider.createTreeItem('tree level 1 - 2'),
]
treeItem2.children = [
   provider.createTreeItem('tree level 2 - 1'),
   provider.createTreeItem('tree level 2 - 2'),
]
const treeData = [
  treeItem1,
  treeItem2,
]
provider.update(treeData)
vscode.window.registerTreeDataProvider('myTreeView', myTreeDataProvider)
```

## License

[MIT](./LICENSE) License © 2022 [Simon He](https://github.com/Simon-He95)

<a href="https://github.com/Simon-He95/sponsor" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" style="height: 51px !important;width: 217px !important;" ></a>
