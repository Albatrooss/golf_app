import { TsConfigResolver } from '@ts-morph/common';
import ts from 'typescript';

const transformer: ts.TransformerFactory<ts.SourceFile> =
  context => sourceFile => {
    const visitor = (node: ts.Node): ts.Node => {
      if (
        ts.isDecorator(node) &&
        ts.isPropertyDeclaration(node.parent) &&
        ts.isTypeReferenceNode(node.parent.type) &&
        ts.isIdentifier(node.parent.type.typeName) &&
        ts.isCallExpression(node.expression) &&
        node.expression.arguments.length === 0 &&
        ts.isIdentifier(node.expression.expression) &&
        node.expression.expression.escapedText === 'Inject'
      ) {
        const f = context.factory;
        return f.createDecorator(
          f.createCallExpression(
            /* expression */ node.expression.expression,
            /* typeArguments */ [],
            /* argumentsArray */ [
              f.createArrowFunction(
                /* modifiers */ undefined,
                /* typeParameters */ undefined,
                /* parameters */ undefined,
                /* type */ undefined,
                /* equalsGreaterThanToken */ undefined,
                /* body */ node.parent.type.typeName,
              ),
            ],
          ),
        );
      }
      return ts.visitEachChild(node, visitor, context);
    };

    return ts.visitNode(sourceFile, visitor);
  };

export default transformer;
