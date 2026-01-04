import type {CodegenConfig} from '@graphql-codegen/cli';

const config: CodegenConfig = {
	schema: './schema.docs.graphql',
	documents: ['source/**/*.gql', 'source/**/*.graphql'],
	generates: {
		'./source/github-helpers/github-graphql-types.ts': {
			plugins: ['typescript', 'typescript-operations'],
			config: {
				strictScalars: true,
				immutableTypes: true,
				avoidOptionals: false,
				useTypeImports: true,
				namingConvention: {
					typeNames: 'pascal-case#pascalCase',
					enumValues: 'upper-case#upperCase',
				},
				scalars: {
					DateTime: 'string',
					URI: 'string',
					HTML: 'string',
					GitObjectID: 'string',
					GitSSHRemote: 'string',
					X509Certificate: 'string',
					Date: 'string',
					Base64String: 'string',
					BigInt: 'number',
					PreciseDateTime: 'string',
					GitTimestamp: 'string',
					CustomPropertyValue: 'string | number | boolean',
					GitRefname: 'string',
				},
			},
			hooks: {
				afterOneFileWrite: ['node -e "const fs=require(\'fs\');const file=\'source/github-helpers/github-graphql-types.ts\';const content=fs.readFileSync(file,\'utf8\');fs.writeFileSync(file,\'/* eslint-disable */\\n// @ts-nocheck\\n\'+content);"'],
			},
		},
	},
};

export default config;
