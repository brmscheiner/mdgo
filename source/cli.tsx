#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './App';

const cli = meow(`
	Usage
	  $ mdrun <file.md>

	Options
		--compact, -c  condense output

	Examples
	  $ mdrun -c README.md
`, {
	flags: {
		compact: {
			type: 'boolean',
			alias: 'c',
		}
	}
});

render(<App input={cli.input} compact={!!cli.flags['compact']}/>);
