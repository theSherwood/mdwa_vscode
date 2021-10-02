import * as vscode from 'vscode';
import { MostDangerousWritingApp as App, LimitType } from './mdwa';

let app: App | undefined;

const minutes: vscode.QuickPickItem[] = ['3', '5', '10', '15', '20', '30', '60']
	.map((n) => ({label: n, description: 'minutes'}));
const words: vscode.QuickPickItem[] = ['150', '250', '500', '750', '1667']
	.map((n) => ({label: n, description: 'words'}));
const limitItems = minutes.concat(words);

function startSession(context: vscode.ExtensionContext) {
	vscode.window.showQuickPick(limitItems, {
		placeHolder: 'Session length',
		canPickMany: false
	}).then((item) => {
		const type = item!.description === 'minutes' ? LimitType.minutes : LimitType.words;
		const limit = Number.parseInt(item!.label, 10);
		app = new App(context, type, limit);
	});
}

function stopSession() {
	app?.dispose();
}

function restartSession(context: vscode.ExtensionContext) {
	stopSession();
	startSession(context);
}

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('the-most-dangerous-writing-app.startSession', () => {
		if (app?.isRunning()) {
			vscode.window.showErrorMessage('The Most Dangerous Writing App is already running', 'Stop', 'New Session')
				.then((action) => action === 'Stop' ? stopSession() : restartSession(context));
			return;
		}

		startSession(context);
	});

	context.subscriptions.push(disposable);
}