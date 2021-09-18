tsn="node -r ts-node/register/transpile-only"

$tsn ./codegen/env.ts
echo "✨ Generated environment variables types"

$tsn ./codegen/type-graphql.ts
echo "✨ Generated type-graphql decorators"

# $tsn ./codegen/mutations.ts < ./server/schema.gql > ./server/mutations.generated.ts
# echo "✨ Generated mutation boilerplates"

rm -rf client/**/__generated__/*.ts
npx ts-graphql-plugin typegen
echo "✨ Generated typed gpl queries"

$tsn ./codegen/ts-graphql-group-type-files.ts
echo "✨ Consolidated gql type files"
