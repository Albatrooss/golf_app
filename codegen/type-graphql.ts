#!/usr/bin/env ts-node-transpile-only
import * as fs from 'fs';
import * as babel from '@babel/core';
import { resolve } from 'path';
import type { TSTypeAnnotation, Identifier } from '@babel/types';
import { formatCode } from './util';

const files = [
  '../server/modules/user/models/types.raw.ts',
  // '../server/modules/user/resolvers/inputs/types.raw.ts',
  '../server/modules/score/models/types.raw.ts',
  // '../server/modules/score/resolvers/inputs/types.raw.ts',
];

const transformer = ({
  types: t,
  template,
}: typeof babel): babel.PluginObj => ({
  visitor: {
    Program(programPath) {
      const module = t.identifier('TypeGraphQL');
      const Field = t.memberExpression(module, t.identifier('Field'));
      let hasJSONObjectResolver = false;

      // const ObjectId = addNamed(programPath, "ObjectId", "type-graphql");
      const registerEnumType = t.memberExpression(
        module,
        t.identifier('registerEnumType'),
      );
      const exportees: Identifier[] = [];

      programPath.traverse({
        ClassDeclaration(path) {
          if (!path.getFunctionParent()) {
            exportees.push(path.node.id);
          }
        },
        TSEnumDeclaration(path) {
          if (!path.getFunctionParent()) {
            exportees.push(path.node.id);
          }
        },
      });

      programPath.traverse({
        ClassProperty(path) {
          const { node } = path;
          if (node.static || node.computed || node.decorators?.length) return;

          if (!node.optional) {
            node.definite = true;
          }

          let nullable = node.optional || node.value;

          const typeAn = node.typeAnnotation as TSTypeAnnotation;
          let shouldHideType: undefined | boolean;

          const reified = (function getType(type) {
            switch (type.type) {
              case 'TSStringKeyword':
                return t.identifier('String');
              case 'TSNumberKeyword':
                return t.identifier('Number');
              case 'TSBooleanKeyword':
                return t.identifier('Boolean');
              case 'TSArrayType':
                return t.arrayExpression([getType(type.elementType)]);
              case 'TSUnionType':
                if (
                  type.types.length === 2 &&
                  type.types[1].type === 'TSNullKeyword'
                ) {
                  nullable = true;
                  return getType(type.types[0]);
                }
                throw new Error(`Unknown type: ${type.type}`);
              case 'TSTypeReference': {
                const { typeName } = type;
                if (!t.isIdentifier(typeName)) {
                  shouldHideType ??= false;
                  return t.identifier('Object');
                }
                const { name } = typeName;

                if (['Int', 'Float'].includes(name)) {
                  shouldHideType ??= false;
                  typeName.name = 'number';
                  return t.memberExpression(module, t.identifier(name));
                }
                if (['Date'].includes(name)) {
                  shouldHideType ??= false;
                  return typeName;
                }
                if (name === 'Record') {
                  shouldHideType ??= false;
                  hasJSONObjectResolver = true;
                  return t.memberExpression(
                    t.identifier('GraphQLScalars'),
                    t.identifier('JSONObjectResolver'),
                  );
                }

                if (
                  exportees
                    .map(_ => _.name)
                    .concat(['Date'])
                    .includes(name)
                ) {
                  shouldHideType ??= true;
                  return typeName;
                }
                shouldHideType ??= true;

                return t.conditionalExpression(
                  t.binaryExpression(
                    '===',
                    t.unaryExpression('typeof', typeName),
                    t.stringLiteral('undefined'),
                  ),
                  t.identifier('Object'),
                  typeName,
                );
              }

              default:
                throw new Error(`Unknown type: ${type.type}`);
            }
          })(typeAn.typeAnnotation);

          if (
            typeAn.typeAnnotation.type === 'TSTypeReference' &&
            shouldHideType
          ) {
            typeAn.typeAnnotation = t.tsTypeReference(
              t.identifier('FixDecorator'),
              t.tsTypeParameterInstantiation([typeAn.typeAnnotation]),
            );
          }

          const options = t.objectExpression([]);
          if (nullable) {
            options.properties.push(
              t.objectProperty(
                t.identifier('nullable'),
                t.booleanLiteral(true),
              ),
            );
          }
          if (node.leadingComments?.length) {
            options.properties.push(
              t.objectProperty(
                t.identifier('description'),
                t.stringLiteral(
                  node.leadingComments[0].value.replace(/^\*/, '').trim(),
                ),
              ),
            );
          }
          if (node.value) {
            options.properties.push(
              t.objectProperty(t.identifier('defaultValue'), node.value),
            );
            delete node.value;
          }

          node.decorators = [
            t.decorator(
              t.callExpression(
                Field,
                [
                  reified &&
                    t.arrowFunctionExpression([t.identifier('type')], reified),
                  options.properties.length && options,
                ].filter(Boolean),
              ),
            ),
          ];
        },

        TSEnumDeclaration(path) {
          const { node } = path;
          const { id, members } = node;
          if (members.some(member => !member.initializer)) {
            throw Error(
              `Enum ${id.name} should initialize all members with an explicit value.`,
            );
          }

          const objectMembers = members.map(member =>
            t.objectProperty(
              member.id,
              t.tsAsExpression(member.initializer, t.tsTypeReference(id)),
            ),
          );

          path.replaceWithMultiple([
            t.tsTypeAliasDeclaration(
              id,
              undefined,
              t.tsUnionType(
                members.map(member => {
                  // https://github.com/babel/babel/issues/13327
                  const type = t.tsLiteralType(t.stringLiteral(''));
                  type.literal = member.initializer as any;
                  return type;
                }),
              ),
            ),
            t.variableDeclaration('const', [
              t.variableDeclarator(id, t.objectExpression(objectMembers)),
            ]),
            t.callExpression(
              registerEnumType,
              [id, t.valueToNode({ name: id.name })].filter(Boolean),
            ),
          ]);
        },
      });

      if (hasJSONObjectResolver) {
        programPath.node.body.unshift(
          template(/* javascript */ `
            import * as GraphQLScalars from 'graphql-scalars'
          `)() as any,
        );
      }

      programPath.node.body.push(
        t.exportNamedDeclaration(
          undefined,
          exportees.map(e => t.exportSpecifier(e, e)),
        ),
      );
    },
  },
});

function transform(source: string) {
  const { code } = babel.transformSync(source, {
    parserOpts: {
      plugins: [
        'typescript',
        'classProperties',
        ['decorators', { decoratorsBeforeExport: false }],
      ],
    },
    configFile: false,
    babelrc: false,
    plugins: [transformer(babel)],
  });
  return formatCode(
    '// This file is automatically generated.',
    `/* eslint-disable */`,
    `import * as TypeGraphQL from 'type-graphql'`,
    `export type FixDecorator<T> = T;\n\n`,
    code
      .replace(/ {2}(@TypeGraphQL)/g, '\n  $1')
      .replace(/\n {4}(nullable:)/g, '$1')
      .replace(/\n {2}(name:)/g, '$1'),
  );
}

for (const path of files) {
  const source = resolve(__dirname, path);
  const target = source.replace(/\.raw\.ts$/, '.ts');

  fs.writeFileSync(target, transform(fs.readFileSync(source, 'utf-8')));
}
