import * as vscode from 'vscode';
import { Editor } from './editor';
import { StatusBar } from './statusBar';
import { LimitType } from './common';

const danger = 3000;
const kill = 5000;

function isTextEditorOpen(editor: vscode.TextEditor): boolean {
  for (let doc of vscode.workspace.textDocuments) {
    if (doc === editor.document) return true;
  }
  return false;
}

/**
 * vscode lacks a convenient API for closing a dirty editor without a dialog
 * box prompting the user to save the contents. So this is a bit of a hack in
 * which we make the document the active editor and then dispatch
 * 'revertAndCloseActiveEditor'. If the dirty editor is also an untitled
 * editor, it tends to try to reopen it. So we do a few more things to ensure
 * that it stays closed.
 */
async function closeFileIfOpen(doc: vscode.TextDocument): Promise<void> {
  await vscode.window.showTextDocument(doc);
  if (vscode.window.activeTextEditor?.document === doc) {
    await vscode.commands.executeCommand('workbench.action.revertAndCloseActiveEditor');
    if (vscode.window.activeTextEditor?.document === doc) {
      await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
      const tabs: vscode.Tab[] = vscode.window.tabGroups.all.map((tg) => tg.tabs).flat();
      const index = tabs.findIndex(
        (tab) => tab.input instanceof vscode.TabInputText && tab.input.uri.path === doc.uri.path,
      );
      if (index !== -1) {
        await vscode.window.tabGroups.close(tabs[index]);
      }
    }
  }
}

export class MostDangerousWritingApp {
  private returnEditor: vscode.TextEditor | undefined;
  private returnSelection: vscode.Selection | undefined;

  editor: Editor;
  private statusBar: StatusBar;
  private timer: NodeJS.Timer | undefined;

  private type: LimitType;
  private limit: number;

  private run: boolean;
  private startTime: number;
  private duration: number;
  private words: number;

  constructor(
    type: LimitType,
    limit: number,
    returnEditor: vscode.TextEditor | undefined,
    returnSelection: vscode.Selection | undefined,
  ) {
    this.returnEditor = returnEditor;
    this.returnSelection = returnSelection;

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
      danger: false,
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

    const time =
      this.type === LimitType.minutes ? `${this.limit} min` : `${minutes} min ${seconds} sec`;

    if (
      this.returnEditor &&
      isTextEditorOpen(this.returnEditor) &&
      this.returnSelection !== undefined
    ) {
      const returnEditor = this.returnEditor;
      const returnSelection = this.returnSelection;
      const text = this.editor.getText();
      this.editor.clear();
      closeFileIfOpen(this.editor.editor!.document).then(() => {
        vscode.window.showTextDocument(returnEditor.document).then(() => {
          const activeEditor = vscode.window.activeTextEditor;
          activeEditor?.edit((editBuilder) => {
            editBuilder.replace(returnSelection, text);
          });
        });
      });
    }

    vscode.window.showInformationMessage(
      'Congratulations! ' +
        `You have written ${this.words} word${this.words === 1 ? '' : 's'} ` +
        `in ${time}.`,
    );

    this.dispose();
  }

  private fail() {
    vscode.window.showErrorMessage('Time is up! All your work has been deleted.');
    this.editor.clear();
    closeFileIfOpen(this.editor.editor!.document);
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
      danger: kill - this.duration <= danger,
    });
  }
}
