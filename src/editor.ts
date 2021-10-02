import * as vscode from 'vscode';
import { MostDangerousWritingApp as App } from './mdwa';

export class Editor {
  private context: vscode.ExtensionContext;
  private editor: vscode.TextEditor | undefined;
  private app: App;

  constructor(context: vscode.ExtensionContext, app: App) {
    this.context = context;
    this.app = app;

    vscode.workspace.openTextDocument().then(document => {
      const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document !== document) {
          return;
        }

        this.app.ping();
      });

      context.subscriptions.push(disposable);

      vscode.window.showTextDocument(document).then((editor) => {
        this.editor = editor;
      });
    });
  }

  clear() {
    const document = this.editor!.document;
    var lastLine = document.lineAt(document.lineCount - 1);
    this.editor?.edit((builder) => {
      builder.delete(new vscode.Range(new vscode.Position(0, 0), lastLine.range.end));
    });
  }

  getWords() {
    return this.editor!.document.getText().split(/\s+/).length - 1;
  }
}