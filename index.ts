
import * as ts from "typescript/lib/tsserverlibrary";
import { JSDocExtractor } from './src/JSDocExtractor'

const factory: ts.server.PluginModuleFactory = () => ({
  create({ languageService: parent }) {
    return {
      ...parent,

      getSemanticDiagnostics(fileName: string) {
        const diagnostics = parent.getSemanticDiagnostics(fileName);

        const program = parent.getProgram();
        if (!program) {
          throw new Error("language service host does not have program!");
        }

        const source = program.getSourceFile(fileName);
        if (!source) {
          throw new Error("No source file: " + fileName);
        }

        const extractor = new JSDocExtractor(source)
        const jsonSchemaDiagnostics = extractor.getDiagnostics()

        return [...jsonSchemaDiagnostics, ...diagnostics]
      },

      dispose() {
        // extractor.dispose()
      },
    };
  },
});

export = factory;