import * as vscode from 'vscode';
import { Editor } from './editor';
import { StatusBar } from './statusBar';
import { LimitType } from './common';

const danger = 3000;
const kill = 5000;

export class MostDangerousWritingApp {
  private statusBar: StatusBar;
  private editor: Editor;
  private timer: NodeJS.Timer | undefined;

  private type: LimitType;
  private limit: number;
  
  private run: boolean;
  private startTime: number;
  private duration: number;
  private words: number;

  constructor(type: LimitType, limit: number) {
    this.type = type;
    this.limit = limit;

    this.run = true;
    this.startTime = Date.now();
    this.duration = 0;
    this.words = 0;

    this.statusBar = new StatusBar({
      limit: limit,
      type: type,
      time: this.startTime,
      words: this.words,
      reset: kill,
      danger: false
    });

    this.editor = new Editor();

    this.timer = setInterval(this.tick.bind(this), 100);
  }

  dispose() {
    this.run = false;
    this.duration = 0;
    this.statusBar.dispose();
    clearInterval(this.timer!);
  }

  isRunning() {
    return this.run;
  }

  refresh() {
    this.duration = 0;
  }

  testDocument(document: vscode.TextDocument) {
    return this.editor.testDocument(document);
  }

  private win() {
    const timeElapsed = new Date(Date.now() - this.startTime);
    const minutes = timeElapsed.getMinutes();
    const seconds = timeElapsed.getSeconds();

    const time = this.type === LimitType.minutes
      ? `${this.limit} min`
      : `${minutes} min ${seconds} sec`;

    vscode.window.showInformationMessage('Congratulations! ' + 
      `You have written ${this.words} word${this.words === 1 ? '' : 's'} ` +
      `in ${time}. ` +
      'You may save your work now.',
      'New session')
      .then(() => vscode.commands.executeCommand('the-most-dangerous-writing-app.startSession'));

    this.dispose();
  }

  private fail() {
    
    vscode.window.showErrorMessage('Time is up! All your work has been deleted.', 'New session')
      .then(() => vscode.commands.executeCommand('the-most-dangerous-writing-app.startSession'));

    this.editor.clear();
    this.dispose();
  }

  private tick() {
    if (this.type === LimitType.minutes && Date.now() - this.startTime >= this.limit * 60000) {
      this.win();
      return;
    }

    this.words = this.editor.getWords();
    if (this.type === LimitType.words && this.words >= this.limit) {
      this.win();
      return;
    }

    this.duration += 100;

    if (this.duration >= kill) {
      this.fail();
      return;
    }

    this.statusBar.update({
      limit: this.limit,
      type: this.type,
      time: Date.now() - this.startTime,
      words: this.words,
      reset: Math.ceil((kill - this.duration) / 1000),
      danger: kill - this.duration <= danger
    });
  }
}
