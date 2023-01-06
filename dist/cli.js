#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const ink_1 = require("ink");
const meow_1 = __importDefault(require("meow"));
const App_1 = __importDefault(require("./App"));
const flags = {
    boxy: 'boxy',
};
/*
Ideas:
--interactive, -i mode to stay in the app after running a command
--copy, -c mode to copy command to clipboard instead of running it
*/
const cli = (0, meow_1.default)(`
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
(0, ink_1.render)(react_1.default.createElement(App_1.default, { input: cli.input, boxy: !!cli.flags[flags.boxy] }));
