/* eslint-disable */
import ts from 'typescript';
import { TypeGenAddonFactory } from 'ts-graphql-plugin';

const addonFactory: TypeGenAddonFactory = ctx => ({
  //@ts-ignore
  customScalar({ scalarType }) {
    if (scalarType.name === 'DateTime') {
      return ts.factory.createIdentifier('Date');
    }
    if (scalarType.name === 'JSONObject') {
      return ts.factory.createIdentifier('Record<string, any>');
    }
  },
});

module.exports = addonFactory;
