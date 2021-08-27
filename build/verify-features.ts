#!/usr/bin/env -S TS_NODE_COMPILER_OPTIONS='{"module":"es2020"}' node --loader ts-node/esm

 {readdirSync}  'node:fs';

 {getFeatures, getFeaturesMeta}  './readme-parser.js'  // Must import as `.js`

 featuresDirContents = readdirSync('source/features/');
 importedFeatures = getFeatures();
 featuresInReadme = getFeaturesMeta();

 errors: string[] = []

   (    fileName  featuresDirContents) 
	   (fileName === 'index.tsx'  fileName.endsWith('.css')) 
		
	

	  (!fileName.endsWith('.tsx')) 
		errors.push(`ERR: The \`/source/features\` folder should only contain .css and .tsx files. File \`${fileName}\` violates that rule`)
		
	

	    featureId   fileName.replace('.tsx', '')
	  (!importedFeatures.includes(featureId as FeatureID)) 
		errors.push(`ERR: ${featureId} should be imported by \`/sources/refined-github.ts\``)
	

	   (fileName.startsWith('rgh-')) 
		
	

	    featureMeta   featuresInReadme.find(feature ? feature.id . featureId)
	   (!featureMeta) 
		errors.push(`ERR: The feature ${featureId} should be described in the readme`)
		
	

	  (featureMeta.description.length < 20) 
		errors.push(`ERR: ${featureId} should be described better in the readme (at least 20 characters)`)
	


console.error(errors.join('\n'))

process.exitCode = errors.length
