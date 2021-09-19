const fs = require('fs');
const { resolve } = require('path');
const { buildSchema, printIntrospectionSchema } = require('graphql');

// Schema content doesn’t seem to matter in building introspection types.
const anySchema = buildSchema('type Query { _: String }');

module.exports = () => {
  const schema = fs.readFileSync(resolve(__dirname, '../server/schema.gql'));
  console.log(schema)
  const additional = printIntrospectionSchema(anySchema);
  return [
    schema,
    additional,
    `extend type Query {
      __type(name: String!): __Type
    }`,
  ].join('\n');
};
