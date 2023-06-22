import * as vscode from 'vscode'
import { TreeProvider } from '../../../src/index'

export function activate(context: vscode.ExtensionContext) {
  const treeData = [
    {
      label: 'label-1',
      collapsed: true,
      children: [
        {
          label: 'label-1-1',
        },
      ],
    },
    {
      label: 'label-2',
      children: [],
    },
  ]
  const provider = new TreeProvider(treeData)
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('example1.id', provider),
  )
}
