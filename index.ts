
import * as ts from "typescript/lib/tsserverlibrary";
import { JSDocExtractor } from './src/JSDocExtractor'

const factory: ts.server.PluginModuleFactory = () => ({
  create({ project, languageService: parent }) {
    const extractor = new JSDocExtractor(project)

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

        const jsonSchemaDiagnostics = extractor.getDiagnostics()

        return [...jsonSchemaDiagnostics, ...diagnostics]
      },

      dispose() {
        extractor.dispose()
      },
    };
  },
});

export = factory;