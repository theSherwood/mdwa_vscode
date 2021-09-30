import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('the-most-dangerous-writing-app.startSession', () => {
		vscode.window.showInformationMessage('Hello World from The Most Dangerous Writing App!');
	});

	context.subscriptions.push(disposable);
}