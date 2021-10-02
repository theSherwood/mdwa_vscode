import * as vscode from 'vscode';

export class Editor {
    
  constructor() {
    vscode.workspace.openTextDocument().then(document => {
      vscode.window.showTextDocument(document);
    });
  }

  clear() {

  }


}