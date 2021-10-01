import * as vscode from "vscode";

export type LimitType = "minutes" | "words";

export class MostDangerousWritingApp {
  private count = 0;

  private run = false;
  private document: vscode.TextDocument;

  private type: LimitType;
  private startTime: number;
  private duration: number;

  private limit: number;
  private hardCore: boolean;
  private timer: NodeJS.Timer | undefined;

  constructor(type: LimitType, limit: number, hardCore: boolean, document: vscode.TextDocument) {
      this.type = type;
      this.limit = limit;
      this.hardCore = hardCore;
      this.document = document;

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
    if (++this.count === 100) this.fail();
  }
}
