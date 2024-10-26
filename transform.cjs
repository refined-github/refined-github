module.exports = function transformer(file, api) {
	const index = api.jscodeshift;
	const root = index(file.source);

	const options = {
		parser: 'ts',
	};

	// Find imports and track what local names are used for the $ import
	const dollarImportNames = new Set();

	// First pass: find all select-dom imports and track the local names
	for (const path of root
		.find(index.ImportDeclaration, {
			source: {
				value: 'select-dom',
			},
		})) {
		const specifiers = path.value.specifiers;

		for (const specifier of specifiers) {
			if (
				specifier.type === 'ImportSpecifier'
				&& specifier.imported.name === 'expectElement'
			) {
				// Store the current local name
				dollarImportNames.add(specifier.local?.name || 'expectElement');

				// Create new import specifier with explicit 'as $$$'
				const newSpecifier = index.importSpecifier(
					index.identifier('expectElement'),
					index.identifier('$$$'),
				);

				// Replace the old specifier with the new one
				Object.assign(specifier, newSpecifier);
			}
		}
	}

	// Only proceed if we found any relevant imports
	if (dollarImportNames.size > 0) {
		// Second pass: replace only the identifiers that match our tracked names
		for (const path of root
			.find(index.Identifier)) {
			// Only proceed if this identifier matches one of our import names
			if (!dollarImportNames.has(path.value.name)) {
				continue;
			}

			// Skip if we're in a type context or the import specifier itself
			const isTypeContext = (
				path.parent.value.type === 'TSTypeReference'
				|| path.parent.value.type === 'TSQualifiedName'
				|| path.parent.value.type === 'TSTypeQuery'
				|| path.parent.value.type === 'ImportSpecifier'
			);

			if (!isTypeContext) {
				index(path).replaceWith(index.identifier('$$$'));
			}
		}
	}

	return root.toSource(options);
};

// Add test cases
/*
  // Input case 1 - basic import:
  import {$ as $$$} from 'select-dom';
  $('.some-selector');  // should change
  $('other');          // should NOT change (different $)

  // Output case 1:
  import {$ as $$$} from 'select-dom';
  $$$('.some-selector');
  $('other');

  // Input case 2 - already renamed import:
  import {$ as select} from 'select-dom';
  select('.some-selector');  // should change
  select();                  // should change
  otherSelect();            // should NOT change

  // Output case 2:
  import {$ as $$$} from 'select-dom';
  $$$('.some-selector');
  $$$();
  otherSelect();

  // Input case 3 - with type usage:
  import {$ as select} from 'select-dom';
  type SelectorResult = ReturnType<typeof select>;
  select('.some-selector');

  // Output case 3:
  import {$ as $$$} from 'select-dom';
  type SelectorResult = ReturnType<typeof $$$>;
  $$$('.some-selector');
*/
