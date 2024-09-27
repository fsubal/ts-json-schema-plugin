import * as fs from 'fs'
import * as ts from "typescript/lib/tsserverlibrary";

export interface EachDiagnostic {
  start: number;
  length: number;
  messageText: string;
}

export interface JsonSchemaDocTag {
  pos: number;
  end: number;
  jsonSchemaPath: string;
}

export class JSDocExtractor {
  static readonly tagName = '@jsonschema'

  private diagnostics: EachDiagnostic[] = [];

  constructor(private readonly sourceFile: ts.SourceFile) { }

  getDiagnostics() {
    ts.transform(this.sourceFile, [this.transformer])
    return []
  }

  private transformer = (context: ts.TransformationContext) => (
    rootNode: ts.Node
  ): ts.Node => {
    const visit = (node: ts.Node) => {
      // JSDocが書けるようなnodeだったら
      if (ts.isDeclarationStatement(node)) {
        const jsDocTags = ts.getJSDocTags(node)
        const jsonSchemata = jsDocTags.flatMap(this.getJsonSchemaFromTag)
        if (jsonSchemata.length > 2) {
          this.diagnostics.push({
            start: node.pos,
            length: node.end - node.pos,
            messageText: `Do not write ${JSDocExtractor.tagName} in single Doc Comment`
          })
        }

        const typeFromSchema = jsonSchema2ts(jsonSchemata[0])

        return node
      }

      return ts.visitEachChild<ts.Node>(node, visit, context);
    };

    return ts.visitNode(rootNode, visit);
  }

  private getJsonSchemaFromTag(tag: ts.JSDocTag) {
    const { text } = tag.tagName
    if (text !== JSDocExtractor.tagName) {
      return []
    }

    const filePath = text.match(/\{(.+)\}/)?.[1]
    if (!filePath) {
      return []
    }

    try {
      const jsonSchema = fs.readFileSync(filePath, { encoding: 'utf-8' })
      return JSON.parse(jsonSchema)
    } catch {
      return []
    }
  }

  private handleFound = ({ jsonSchemaPath, pos, end }: ts.CommentRange) => {
    this.diagnostics.push({
      start: pos,
      length: end - pos,
      messageText: 'TODO',
    });
  };
}
