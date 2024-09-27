import * as ts from "typescript/lib/tsserverlibrary";

export class JSDocExtractor {
  constructor(private readonly project: ts.server.Project) { }

  getDiagnostics() {
    return []
  }

  dispose() {
    // ...
  }
}