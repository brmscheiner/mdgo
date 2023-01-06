import React, {FC, useEffect, useState} from 'react';
import {Box, Newline, Text, useInput} from 'ink';
import { open } from 'node:fs/promises';
const { spawn } = require("child_process");

import PrintError from './components/PrintError';
import useScreenSize from './hooks/useScreenSize';

const boxEmphasisColor = 'magenta';
const textSelectionColor = 'blueBright';
const textEmphasisColor = 'blueBright';
const numberStrings = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/*
TODO
Support more than 10 commands 
Fix tests 
- there is a problem with xo: https://github.com/xojs/xo/issues/546
*/


function spawnCommand(command: string) {
	const runner = spawn(command, {
		shell: true,
		stdio: "inherit",
	});

	runner.on("exit", () => {
		process.exit();
	});
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


function getPreviousIndex(selectedIndex: number | null, commandList: string[] | null) {
	if (typeof selectedIndex === 'number' && commandList) {
		return selectedIndex === 0 ? commandList.length - 1 : selectedIndex - 1;
	} else {
		return 0;
	}
}

function getNextIndex(selectedIndex: number | null, commandList: string[] | null) {
	if (typeof selectedIndex === 'number' && commandList) {
		return selectedIndex === commandList.length - 1 ? 0 : selectedIndex + 1;
	} else {
		return 0;
	}
}

interface AppProps {
	boxy: boolean;
	input?: string[];
}


const App: FC<AppProps> = ({ input, boxy }) => {
	const { width = 70 } = useScreenSize();
	const [selected, setSelected] = useState<number | null>(null);
	const [commandList, setCommandList] = useState<string[] | null>(null);
	const [runningCommand, setRunningCommand] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const filename = (input && input.length > 0) ? input?.[0] : null;

	useInput((input, key) => {
		if (key.tab) setSelected(getNextIndex(selected, commandList));
		if (key.upArrow || key.leftArrow) setSelected(getPreviousIndex(selected, commandList));
		if (key.downArrow || key.rightArrow) setSelected(getNextIndex(selected, commandList));
		if (numberStrings.includes(input)) setSelected(parseInt(input) - 1);

		if (key.return && commandList && selected) {
			const selectedCommand = commandList?.[selected];
			setRunningCommand(selectedCommand || null);
		}
	}, { isActive: !!filename && !error && !runningCommand });

	useEffect(() => {
		if (filename) readMarkdown(filename, setCommandList, setError);
	}, [filename]);

	useEffect(() => {
		if (runningCommand) spawnCommand(runningCommand);
	}, [runningCommand]);

	if (!filename) return <PrintError text="No file specified." />;
	if (error) return <PrintError text={error} />;
	if (!commandList) return <Text>Loading...</Text>;

	return (
		<Box flexDirection="column">
			<Text color={textEmphasisColor}>{`${commandList.length} commands found, use <Tab>, numbers or arrow keys to select a command, then hit <Enter>`}</Text>
			{commandList.map((command, i) => {
				const isSelected = i === selected;
				const label = `(${i+1}) ${command}`;
				return boxy ? (
					<Box borderColor={isSelected ? boxEmphasisColor : undefined} width={width} paddingX={1} borderStyle="single" key={label}>
						<Text color={isSelected ? textSelectionColor : undefined}>{label}</Text>
					</Box>
				) : <Text key={label} color={isSelected ? textSelectionColor : undefined}>{label}</Text>;
			})}
			{runningCommand && (
				<Box flexDirection="column">
					<Newline />
					<Text color={textEmphasisColor}>{`Running command \`${runningCommand}\``}</Text>
				</Box>
			)}
		</Box>
	);
};

module.exports = App;
export default App;
