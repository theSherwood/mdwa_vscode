import * as vscode from 'vscode';
import { LimitType } from './mdwa';

export interface Status {
  limit: number;
  type: LimitType;
  time: number;
  words: number;
  reset: number;
  danger: boolean;
}

const normal = new vscode.ThemeColor('statusBarItem.warningBackground');
const danger = new vscode.ThemeColor('statusBarItem.errorBackground');

export class StatusBar {
  private items: Map<string, vscode.StatusBarItem>;

  constructor(status: Status) {
    const createItem = vscode.window.createStatusBarItem;

    this.items = new Map();
    this.items.set('title', createItem(vscode.StatusBarAlignment.Left, 9000));
    this.items.set('reset', createItem(vscode.StatusBarAlignment.Left, 8000));
    this.items.set('words', createItem(vscode.StatusBarAlignment.Left, 7000));
    this.items.set('time', createItem(vscode.StatusBarAlignment.Left, 6000));

    this.items.get('title')!.text = '$(sync~spin) MDWA Running';

    this.update(status);
    this.show();
  }

  update(status: Status) {
    this.useBackgroundColor(status.danger ? danger : normal);

    this.items.get('reset')!.text = `$(trash) Delete in ${status.reset}`;

    const target = status.type === LimitType.words ? ` / ${status.limit}` : '';
    const words = `$(edit) ${status.words}${target} word${status.words === 1 ? '' : 's'}`;
    this.items.get('words')!.text = words;

    const time = status.type === LimitType.minutes ? 600000 * status.limit - status.time : status.time;
    this.items.get('time')!.text = `$(watch) ${this.formatTime(time)}`;
  }

  dispose() {
    this.items.forEach((item) => item.dispose());
  }

  private show() {
    this.items.forEach((item) => item.show());
  }

  private useBackgroundColor(color: vscode.ThemeColor) {
    this.items.forEach((item) => (item.backgroundColor = color));
  }

  private formatTime(time: number) {
    const format = (n: number) => n.toString().padStart(2, '0');
    const date = new Date(time);
    return `${format(date.getMinutes())}:${format(date.getSeconds())}`;
  }
}
