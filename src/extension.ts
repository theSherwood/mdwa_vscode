import * as vscode from 'vscode';
import { MostDangerousWritingApp as App } from './mdwa';
import { LimitType, startSessionCommand, startSessionWithArgsCommand } from './common';

let app: App | undefined;

const minutes: vscode.QuickPickItem[] = ['3', '5', '10', '15', '20', '30', '60']
	.map((n) => ({ label: n, description: 'minutes' }));
const words: vscode.QuickPickItem[] = ['150', '250', '500', '750', '1667']
	.map((n) => ({ label: n, description: 'words' }));
const limitItems = minutes.concat(words);

function isOpenDocument(doc: vscode.TextDocument) {
  const tabs: vscode.Tab[] = vscode.window.tabGroups.all.map(tg => tg.tabs).flat();
  const index = tabs.findIndex(tab => tab.input instanceof vscode.TabInputText && tab.input.uri.path === doc.uri.path);
	return index !== -1;
}

function startSessionWithArgs() {
	const returnEditor = vscode.window.activeTextEditor;
	const returnSelection = returnEditor?.selection;
	vscode.window.showQuickPick(limitItems, {
		placeHolder: 'Session length',
		canPickMany: false
	}).then((item) => {
		const type = item!.description === 'minutes' ? LimitType.minutes : LimitType.words;
		const limit = Number.parseInt(item!.label, 10);
		app = new App(type, limit, returnEditor, returnSelection);
	});
}

function startSessionWithDefaults() {
	const returnEditor = vscode.window.activeTextEditor;
	const returnSelection = returnEditor?.selection;
	const config = vscode.workspace.getConfiguration('mdwa');
	const type_string = config.get<string>('type', 'minutes')
	const limit = config.get<number>('limit', 5);
	const type = type_string === 'minutes' ? LimitType.minutes : LimitType.words;
	app = new App(type, limit, returnEditor, returnSelection);
}

export function activate(context: vscode.ExtensionContext) {
	const startWithDefaults = vscode.commands.registerCommand(startSessionCommand, () => {
		if (app?.isRunning()) {
			vscode.window.showErrorMessage('MDWA is already running');
		} else {
			startSessionWithDefaults();
		}
	});

	const startWithArgs = vscode.commands.registerCommand(startSessionWithArgsCommand, () => {
		if (app?.isRunning()) {
			vscode.window.showErrorMessage('MDWA is already running');
		} else {
			startSessionWithArgs();
		}
	});

	/**
	 * Update the app session that the user made a meaningful change to the text.
	 */
	const refresh = vscode.workspace.onDidChangeTextDocument((event) => {
		if (app?.testDocument(event.document)) {
			app.refresh();
		}
	});

	/**
	 * Dispose the app session if the mdwa editor is closed.
	 */
	const abort = vscode.window.onDidChangeVisibleTextEditors((_editors) => {
		const doc = app?.editor?.editor?.document;
		if (app?.isRunning() && doc) {
			if (!isOpenDocument(doc)) app.dispose();
		}
	});

	context.subscriptions.push(startWithArgs, startWithDefaults, refresh, abort);
}