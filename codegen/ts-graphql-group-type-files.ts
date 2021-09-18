#!/usr/bin/env ts-node-transpile-only
/// <reference lib="es2020" />
import fs from 'fs';
import { dirname, basename, extname } from 'path';
import { groupBy, forEach } from 'lodash';
import glob from 'fast-glob';

const fileList = glob
  .sync(['client/**/__generated__/*.ts', 'server/**/__generated__/*.ts'])
  .filter(path => !path.endsWith('index.ts'));

const filesByDirectory = groupBy(fileList, dirname);

forEach(filesByDirectory, (list, folder) => {
  const exportedIdentifiers = new Set<string>();

  const exportees = list.flatMap(file => {
    const base = basename(file, extname(file));
    if (base === 'anonymous-query') {
      return `export * from './${base}'`;
    }
    const contents = fs.readFileSync(file, 'utf-8');
    const ids = [...contents.matchAll(/export type (\w+) =/g)].map(r => r[1]);
    const validExportees = ids.filter(id => !exportedIdentifiers.has(id));
    validExportees.forEach(id => exportedIdentifiers.add(id));
    return `export type { ${validExportees.join(', ')} } from './${base}';`;
  });

  fs.writeFileSync(
    `${folder}/index.ts`,
    `/* eslint-disable */\n// Automatically generated file.\n${exportees.join(
      '\n',
    )}`,
  );
});
