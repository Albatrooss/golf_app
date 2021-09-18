  
/// <reference lib="ES2019" />
/* eslint-disable import/no-extraneous-dependencies */
import prettier from 'prettier';
import { resolve } from 'path';
import { readFileSync } from 'fs';

export function formatCode(
  ...codes: ((() => Generator<string, void, unknown>) | string | false)[]
) {
  const settings = JSON.parse(
    readFileSync(resolve(__dirname, '../.prettierrc'), 'utf-8'),
  );
  const code = codes
    .flatMap(item =>
      typeof item === 'function' ? Array.from(item()).join('\n') : item,
    )
    .join('\n');
  return prettier.format(code, {
    ...settings,
    parser: 'babel-ts',
  });
}
