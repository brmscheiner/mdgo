#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './App';

const flags = {
	boxy: 'boxy',
};

/* 
Ideas: 
--interactive, -i mode to stay in the app after running a command
--copy, -c mode to copy command to clipboard instead of running it 
*/

const cli = meow(`
	Usage
	  $ mdrun <file.md>

	Options
		--${flags.boxy}, -b  put each command in a cute lil box

	Examples
	  $ mdrun -c README.md
`, {
	flags: {
		[flags.boxy]: {
			type: 'boolean',
			alias: 'b',
		}
	}
});

render(<App input={cli.input} boxy={!!cli.flags[flags.boxy]}/>);
