import * as vscode from 'vscode';
import { Editor } from './editor';
import { StatusBar } from './statusBar';

const danger = 2;
const kill = 5;

export enum LimitType { minutes, words }

export class MostDangerousWritingApp {
  private count = 0;

  private statusBar: StatusBar;
  private editor: Editor;

  private run = false;

  private type: LimitType;
  private startTime: number;
  private duration: number;

  private limit: number;
  private hardCore: boolean;
  private timer: NodeJS.Timer | undefined;


  constructor(type: LimitType, limit: number, hardCore: boolean) {
    this.type = type;
    this.limit = limit;
    this.hardCore = hardCore;

    this.startTime = Date.now();
    this.duration = 0;

    this.statusBar = new StatusBar({
      limit: limit,
      type: type,
      time: this.startTime,
      words: 0,
      reset: 5,
      danger: false
    });

    this.editor = new Editor();
  }

  start() {
    this.run = true;
    this.startTime = Date.now();
    this.timer = setInterval(this.tick.bind(this), 100);
  }

  stop() {
    this.count = 0;
    this.run = false;
    this.statusBar.dispose();
    clearInterval(this.timer!);
  }

  isRunning() {
    return this.run;
  }

  private win() {
    this.stop();
    vscode.window.showInformationMessage('You win');
  }

  private fail() {
    this.stop();
    vscode.window.showErrorMessage('You fail');
  }

  private tick() {
    ++this.count;
    if (this.count === 100) {
      this.fail();
    }
    this.statusBar.update({
      limit: this.limit,
      type: this.type,
      time: Date.now() - this.startTime,
      words: 0,
      reset: Math.floor(10 - this.count / 10),
      danger: this.count > 70
    });
  }
}
