import React from 'react';
import chalk from 'chalk';
import test from 'ava';
import {render} from 'ink-testing-library';
import App from '../App';

test('greet unknown user', t => {
	const {lastFrame} = render(<App boxy />);

	t.is(lastFrame(), chalk`Hello, {green Stranger}`);
});

test('greet user with a name', t => {
	const {lastFrame} = render(<App boxy />);

	t.is(lastFrame(), chalk`Hello, {green Jane}`);
});
