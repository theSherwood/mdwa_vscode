import * as vscode from 'vscode';

export class Editor {
  private editor: vscode.TextEditor | undefined;

  constructor() {
    vscode.workspace.openTextDocument().then(document => {
        vscode.window.showTextDocument(document).then((editor) => {
        this.editor = editor;
      });
    });
  }

  clear() {
    vscode.window.showTextDocument(this.editor!.document).then((editor) => {
      this.editor = editor;
      const lastLine = editor!.document.lineAt(editor!.document.lineCount - 1);
      editor.edit((builder) => {   
        builder.delete(new vscode.Range(new vscode.Position(0, 0), lastLine.range.end));
      });
    });
  }

  getWords() {
    return this.editor!.document.getText().split(/\s+/).length - 1;
  }

  testDocument(document: vscode.TextDocument) {
    return document === this.editor?.document;
  }
}