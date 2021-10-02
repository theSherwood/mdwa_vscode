import * as vscode from 'vscode';
import { Editor } from './editor';
import { StatusBar } from './statusBar';

const danger = 3000;
const kill = 5000;

export enum LimitType { minutes, words }

export class MostDangerousWritingApp {
  private context: vscode.ExtensionContext;
  private statusBar: StatusBar;
  private editor: Editor;
  private timer: NodeJS.Timer | undefined;

  private type: LimitType;
  private limit: number;
  
  private run: boolean;
  private startTime: number;
  private duration: number;

  constructor(context:vscode.ExtensionContext, type: LimitType, limit: number) {
    this.context = context;
    
    this.type = type;
    this.limit = limit;

    this.run = true;
    this.startTime = Date.now();
    this.duration = 0;

    this.statusBar = new StatusBar(this, {
      limit: limit,
      type: type,
      time: this.startTime,
      words: 0,
      reset: kill,
      danger: false
    });

    this.editor = new Editor(this.context, this);

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

  ping() {
    this.duration = 0;
  }

  private win() {
    this.dispose();
    vscode.window.showInformationMessage('You win');
  }

  private fail() {
    this.editor.clear();
    this.dispose();
    vscode.window.showErrorMessage('You fail');
  }

  private tick() {
    if (this.type === LimitType.minutes && Date.now() - this.startTime >= this.limit * 60000) {
      this.win();
      return;
    }

    const words = this.editor.getWords();
    if (this.type === LimitType.words && words >= this.limit) {
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
      words: words,
      reset: Math.ceil((kill - this.duration) / 1000),
      danger: kill - this.duration <= danger
    });
  }
}
