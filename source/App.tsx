import React, {FC, useEffect, useState} from 'react';
import {Box, Text, useInput} from 'ink';
import { open } from 'node:fs/promises';
const { spawn } = require("child_process");

import PrintError from './components/PrintError';
import useScreenSize from './hooks/useScreenSize';

const numberStrings = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/*
TODO
Clean up anys
What's up with stripAnsi from https://github.com/vadimdemedes/ink/blob/master/examples/subprocess-output/subprocess-output.js
Command line option to stay in CLI vs exit on selection (default should be to exit)
Quit app when command finishes running 
Handle command error
Make selection UI sexier 
Publish to npm 
*/


function spawnCommand(command: string, setCommandOutput: any) {
	const runner = spawn(command, {
		shell: true,
		// stdio: "inherit",
	});

	runner.stdout.on('data', (newOutput: any) => {
		const lines = newOutput.toString('utf8').split('\n');
		// const lines = stripAnsi(newOutput.toString('utf8')).split('\n');
		setCommandOutput(lines.slice(-5).join('\n'));
	});
	// runner.on("exit", function (exitCode: string) {
	// 	console.error("Docusaurus process exited with code: " + exitCode);
	// 	onExit(exitCode);
	// });
}

async function readMarkdown(filename: string, setCommandList: (cmds: string[]) => void, setError: (err: string) => void) {
	let filehandle;
	try {
		/* If this whole project actually winds up being useful, this part should 
		* be refactored to handle large files and correctly parse the markdown
		* using an AST. */
		filehandle = await open(filename);
		const buffer = await filehandle.readFile();
		const lines = buffer.toString().split('\n');

		let cmds: string[] = [];
		let inCmd = false;
		for (const line of lines) {
			if (line.includes('```')) {
				inCmd = !inCmd;
			} else {
				if (inCmd) cmds.push(line);
			}
		}
		if (cmds.length >= 1) {
			setCommandList(cmds);
		} else {
			setError('No commands found. (mdrun looks for \`\`\`<code>\`\`\` blocks)')
		}
	} catch (error: any) {
		if (error?.code === 'ENOENT') {
			setError(`File '${filename}' not found.`)
		} else if (error?.code === 'EISDIR') {
			setError(`'${filename}' appears to be a directory.`)
		} else {
			console.error(error);
			setError('An unknown error occurred.');
		}
	} finally {
		await filehandle?.close();
	}
}

const App: FC<{input?: string[]}> = (props) => {
	const { width = 70 } = useScreenSize();
	const [selected, setSelected] = useState<number | null>(null);
	const [commandList, setCommandList] = useState<string[] | null>(null);
	const [runningCommand, setRunningCommand] = useState<string | null>(null);
	const [runningCommandOutput, setRunningCommandOutput] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const filename = props?.input?.[0];

	useInput((input, key) => {
		if (key.tab) {
			if (selected === null) {
				setSelected(0);
			} else {
				if (!commandList) {
					setSelected(0);
				} else {
					setSelected(selected >= commandList.length - 1 ? 0 : selected + 1);
				}
			}
		}

		if (numberStrings.includes(input)) {
			setSelected(parseInt(input) - 1);
		}

		if (key.return && commandList && selected) {
			const selectedCommand = commandList?.[selected];
			setRunningCommand(selectedCommand || null);
		}
	}, { isActive: !!filename && !error });

	useEffect(() => {
		if (filename) readMarkdown(filename, setCommandList, setError);
	}, [filename]);

	useEffect(() => {
		if (runningCommand) spawnCommand(runningCommand, setRunningCommandOutput);
	}, [runningCommand]);

	if (!filename) return <PrintError text="No file specified." />;
	if (error) return <PrintError text={error} />;
	if (!commandList) return <Text>Loading...</Text>;

	return (
		<Box flexDirection="column">
			<Text color="green">{`${commandList.length} commands found, use <Tab> or number keys to select a command, then hit <Enter>`}</Text>
			{commandList.map((command, i) => {
				const isSelected = i === selected;
				return (
					<Box borderColor={isSelected ? 'green' : undefined} width={width} paddingX={1} borderStyle="single" key={i}>
						<Text>{`(${i+1}) ${command}`}</Text>
					</Box>
				)
			})}
			{runningCommand && (
				<Box flexDirection="column">
					<Text>{`Running command '${runningCommand}'...`}</Text>
					<Text>{runningCommandOutput}</Text>
				</Box>
			)}
		</Box>
	);
};

module.exports = App;
export default App;
