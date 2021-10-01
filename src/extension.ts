import * as vscode from 'vscode';

import { MostDangerousWritingApp as App, LimitType } from './mdwa';

let app: App | undefined;

const minutes = [3, 5, 10, 15, 20, 30, 60].map((n) => `${n} min`);
const words = [150, 250, 500, 750, 1667].map((n) => `${n} words`);

function startSession() {
	let type: LimitType;
	let limit: number;
	let hardCore: boolean;

	app?.stop();

	vscode.window.showQuickPick(minutes.concat(words), {
		placeHolder: 'Select limit:',
		canPickMany: false
	}).then((s) => {
		type = s?.endsWith('min') ? 'minutes' : 'words';
		limit = Number.parseInt(s!, 10);

		vscode.window.showQuickPick(['Off', 'On'], {
			placeHolder: 'Hard core mode',
			canPickMany: false
		}).then((s) => {
			hardCore = s === 'On';

			vscode.workspace.openTextDocument().then(doc => {
				vscode.window.showInformationMessage(`type: ${type}, limit: ${limit}, hardcore: ${hardCore}`);
				
				vscode.window.showTextDocument(doc);
				app = new App(type, limit, hardCore, doc);

				app.start();
			});
		});
	});
}

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('the-most-dangerous-writing-app.startSession', () => {
		if (app?.isRunning()) {
			vscode.window.showErrorMessage('The Most Dangerous Writing App is already running', 'Stop', 'New Session')
				.then((action) => action === 'New Session' ? startSession() : app?.stop());
			return;
		}
		startSession();
	});

	context.subscriptions.push(disposable);
}