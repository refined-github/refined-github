# GraphQL Integration

This project uses GraphQL to query the GitHub API. The integration provides:

1. **TypeScript types** for all GraphQL queries
2. **IDE autocomplete** for GraphQL queries via schema
3. **ESLint validation** for GraphQL syntax and schema compliance
4. **Type-safe API calls** with proper TypeScript inference

## Setup

The GraphQL integration is already configured. The key files are:

- `.graphqlrc.yml` - GraphQL configuration
- `codegen.ts` - Code generator configuration
- `schema.docs.graphql` - GitHub GraphQL schema (downloaded from GitHub)
- `source/github-helpers/github-graphql-types.ts` - Generated TypeScript types

## Using GraphQL Queries

### 1. Create a `.gql` file

Create your query in a `.gql` file alongside your feature:

```graphql
# source/features/my-feature.gql
query GetMyData($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    name
    description
  }
}
```

### 2. Import and use in TypeScript

```typescript
import api from '../github-helpers/api.js';
import type {GetMyDataQuery, GetMyDataQueryVariables} from '../github-helpers/github-graphql-types.js';
import MyQuery from './my-feature.gql';

async function fetchData(): Promise<void> {
  // TypeScript will validate the variables type
  const response = await api.v4<GetMyDataQuery, GetMyDataQueryVariables>(
    MyQuery,
    {
      variables: {
        owner: 'refined-github',
        name: 'refined-github',
      },
    },
  );

  // TypeScript knows the response structure
  console.log(response.repository?.name);
}
```

## Scripts

### Regenerate Types

When you add or modify `.gql` files, regenerate the types:

```bash
npm run graphql:codegen
```

### Update Schema

To update the GitHub GraphQL schema:

```bash
npm run graphql:download-schema
```

### Update Schema and Regenerate Types

To update both the schema and regenerate types in one command:

```bash
npm run graphql:generate
```

## IDE Support

### VS Code

Install the recommended extension:
- [GraphQL: Language Feature Support](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql-syntax)

This provides:
- Syntax highlighting for `.gql` files
- Autocomplete based on the schema
- Inline validation
- Go to definition

## ESLint

GraphQL files are automatically linted with:
- Schema validation
- Syntax checking
- Variable usage validation

Run `npm run lint:js` to check all files including GraphQL.

## Type Safety

The integration provides several levels of type safety:

1. **Query strings are validated** against the schema at lint time
2. **Variables are type-checked** - TypeScript will error if you pass wrong types
3. **Response data is typed** - You get autocomplete on response fields
4. **Variables are validated** - ESLint warns about unused or undefined variables

## Notes

- The generated types file (`github-graphql-types.ts`) is excluded from Git and TypeScript checking
- Always regenerate types after modifying `.gql` files
- The schema is downloaded from GitHub's public documentation
