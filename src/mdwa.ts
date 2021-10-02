import * as vscode from "vscode";
import { StatusBar } from './statusBar';

const danger = 2;
const kill = 5;

export enum LimitType { minutes, words }

export class MostDangerousWritingApp {
  private count = 0;

  private statusBar: StatusBar;

  private run = false;
  private document: vscode.TextDocument;

  private type: LimitType;
  private startTime: number;
  private duration: number;

  private limit: number;
  private hardCore: boolean;
  private timer: NodeJS.Timer | undefined;

  private target: string;

  constructor(type: LimitType, limit: number, hardCore: boolean, document: vscode.TextDocument) {
      this.type = type;
      this.limit = limit;
      this.hardCore = hardCore;
      this.document = document;

      this.target = `${limit} ${type === LimitType.minutes ? 'min' : 'words'}`

      this.statusBar = new StatusBar({
        target: this.target,
        progress: 0,
        time: new Date(),
        words: 0,
        reset: 5,
        danger: false
      });
      this.startTime = Date.now();
      this.duration = 0;
  }

  start() {
    this.run = true;
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
    vscode.window.showInformationMessage("You win");
  }

  private fail() {
    this.stop();
    vscode.window.showErrorMessage("You fail");
  }

  private tick() {
    ++this.count;
    if (this.count === 100) {
        this.fail();
    }
    this.statusBar.update({
        target: this.target,
        progress: this.count,
        time: new Date(),
        words: 0,
        reset: Math.ceil(5 - this.count / 20),
        danger: this.count > 70
    });
  }
}
