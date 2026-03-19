import * as vscode from "vscode";
import { scan, parse, KSSyntaxError } from "@ks/core";

const diagnosticCollection = vscode.languages.createDiagnosticCollection("ks");

function validateDocument(document: vscode.TextDocument): void {
  if (document.languageId !== "ks") {
    return;
  }

  const text = document.getText();
  const diagnostics: vscode.Diagnostic[] = [];

  try {
    const tokens = scan(text);
    parse(tokens);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    let range: vscode.Range;
    if (e instanceof KSSyntaxError) {
      const pos = document.positionAt(e.offset);
      range = new vscode.Range(pos, pos.translate(0, 1));
    } else {
      range = new vscode.Range(0, 0, 0, 1);
    }
    diagnostics.push(
      new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error),
    );
  }

  diagnosticCollection.set(document.uri, diagnostics);
}

export function activate(context: vscode.ExtensionContext) {
  // Validate all open .ks documents on activation
  vscode.workspace.textDocuments.forEach(validateDocument);

  // Validate on open
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(validateDocument),
  );

  // Validate on change
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) =>
      validateDocument(e.document),
    ),
  );

  // Validate on save
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(validateDocument),
  );

  // Clear diagnostics when file is closed
  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((doc) =>
      diagnosticCollection.delete(doc.uri),
    ),
  );

  context.subscriptions.push(diagnosticCollection);
}

export function deactivate() {
  diagnosticCollection.clear();
  diagnosticCollection.dispose();
}
