import * as vscode from 'vscode';

export interface Status {
    target: string,
    progress: number,
    time: Date,
    words: number,
    reset: number,
    danger: boolean
}

const normal = new vscode.ThemeColor('statusBarItem.warningBackground')
const danger = new vscode.ThemeColor('statusBarItem.errorBackground');

export class StatusBar {
    private items: Map<string, vscode.StatusBarItem>;
    
    constructor(status: Status) {
        this.items = new Map();
        this.items.set('title', vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 9000));
        this.items.set('reset', vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 8000));
        this.items.set('words', vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 7000));
        this.items.set('time', vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 6000));
        this.items.set('target', vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 5000));
        this.items.set('progress', vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 4000));

        this.items.get('title')!.text = '$(sync~spin) MDWA Running';

        this.update(status);
        this.show();
    }

    update(status: Status) {
        this.useBackgroundColor(status.danger ? danger : normal);
        this.items.get('reset')!.text = `$(trash) Delete in ${status.reset}`;
        this.items.get('words')!.text = `$(edit) ${status.words} word${status.words === 1 ? '' : 's'}`;
        this.items.get('time')!.text = `$(watch) ${status.time.getMinutes().toPrecision(2)}:${status.time.getSeconds().toPrecision(2)}`;
        this.items.get('target')!.text = `$(star) Target: ${status.target}`;
        this.items.get('progress')!.text = `$(play) Progress: ${status.progress.toFixed(0)}%`;
    }

    dispose() {
        this.items.forEach((item) => item.dispose());
    }

    private show() {
        this.items.forEach((item) => item.show());
    }

    private useBackgroundColor(color: vscode.ThemeColor) {
        this.items.forEach((item) => item.backgroundColor = color);
    }
}