import * as vscode from 'vscode';
import { MostDangerousWritingApp as App } from './mdwa';
import { LimitType } from './common';

let app: App | undefined;

const minutes: vscode.QuickPickItem[] = ['3', '5', '10', '15', '20', '30', '60']
	.map((n) => ({ label: n, description: 'minutes' }));
const words: vscode.QuickPickItem[] = ['150', '250', '500', '750', '1667']
	.map((n) => ({ label: n, description: 'words' }));
const limitItems = minutes.concat(words);

function startSession() {
	vscode.window.showQuickPick(limitItems, {
		placeHolder: 'Session length',
		canPickMany: false
	}).then((item) => {
		const type = item!.description === 'minutes' ? LimitType.minutes : LimitType.words;
		const limit = Number.parseInt(item!.label, 10);
		app = new App(type, limit);
	});
}

function stopSession() {
	app?.dispose();
	vscode.window.showInformationMessage('Writing session terminated.');
}

function restartSession() {
	stopSession();
	startSession();
}

export function activate(context: vscode.ExtensionContext) {
	const start = vscode.commands.registerCommand('the-most-dangerous-writing-app.startSession', () => {
		if (app?.isRunning()) {
			vscode.window.showErrorMessage('The Most Dangerous Writing App is already running', 'Terminate', 'New Session')
				.then((action) => action === 'Terminate' ? stopSession() : restartSession());
			return;
		}
		startSession();
	});

	const stop = vscode.commands.registerCommand('the-most-dangerous-writing-app.stopSession', () => {
		stopSession();
	});

	const refresh = vscode.workspace.onDidChangeTextDocument((event) => {
		if (app?.testDocument(event.document)) {
			app.refresh();
		}
	});

	context.subscriptions.push(start, stop, refresh);
}