"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const ink_1 = require("ink");
const promises_1 = require("node:fs/promises");
const { spawn } = require("child_process");
const PrintError_1 = __importDefault(require("./components/PrintError"));
const useScreenSize_1 = __importDefault(require("./hooks/useScreenSize"));
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
function spawnCommand(command) {
    const runner = spawn(command, {
        shell: true,
        stdio: "inherit",
    });
    runner.on("exit", () => {
        process.exit();
    });
}
async function readMarkdown(filename, setCommandList, setError) {
    let filehandle;
    try {
        /* If this whole project actually winds up being useful, this part should
        * be refactored to handle large files and correctly parse the markdown
        * using an AST. */
        filehandle = await (0, promises_1.open)(filename);
        const buffer = await filehandle.readFile();
        const lines = buffer.toString().split('\n');
        let cmds = [];
        let inCmd = false;
        for (const line of lines) {
            if (line.includes('```')) {
                inCmd = !inCmd;
            }
            else {
                if (inCmd)
                    cmds.push(line);
            }
        }
        if (cmds.length >= 1) {
            setCommandList(cmds);
        }
        else {
            setError('No commands found. (mdgo looks for \`\`\`<code>\`\`\` blocks)');
        }
    }
    catch (error) {
        if (error?.code === 'ENOENT') {
            setError(`File '${filename}' not found.`);
        }
        else if (error?.code === 'EISDIR') {
            setError(`'${filename}' appears to be a directory.`);
        }
        else {
            console.error(error);
            setError('An unknown error occurred.');
        }
    }
    finally {
        await filehandle?.close();
    }
}
function getPreviousIndex(selectedIndex, commandList) {
    if (typeof selectedIndex === 'number' && commandList) {
        return selectedIndex === 0 ? commandList.length - 1 : selectedIndex - 1;
    }
    else {
        return 0;
    }
}
function getNextIndex(selectedIndex, commandList) {
    if (typeof selectedIndex === 'number' && commandList) {
        return selectedIndex === commandList.length - 1 ? 0 : selectedIndex + 1;
    }
    else {
        return 0;
    }
}
const App = ({ input, boxy }) => {
    const { width = 70 } = (0, useScreenSize_1.default)();
    const [selected, setSelected] = (0, react_1.useState)(null);
    const [commandList, setCommandList] = (0, react_1.useState)(null);
    const [runningCommand, setRunningCommand] = (0, react_1.useState)(null);
    const [error, setError] = (0, react_1.useState)(null);
    const filename = (input && input.length > 0) ? input?.[0] : null;
    (0, ink_1.useInput)((input, key) => {
        if (key.tab)
            setSelected(getNextIndex(selected, commandList));
        if (key.upArrow || key.leftArrow)
            setSelected(getPreviousIndex(selected, commandList));
        if (key.downArrow || key.rightArrow)
            setSelected(getNextIndex(selected, commandList));
        if (numberStrings.includes(input))
            setSelected(parseInt(input) - 1);
        if (key.return && commandList && selected) {
            const selectedCommand = commandList?.[selected];
            setRunningCommand(selectedCommand || null);
        }
    }, { isActive: !!filename && !error && !runningCommand });
    (0, react_1.useEffect)(() => {
        if (filename)
            readMarkdown(filename, setCommandList, setError);
    }, [filename]);
    (0, react_1.useEffect)(() => {
        if (runningCommand)
            spawnCommand(runningCommand);
    }, [runningCommand]);
    if (!filename)
        return react_1.default.createElement(PrintError_1.default, { text: "No file specified." });
    if (error)
        return react_1.default.createElement(PrintError_1.default, { text: error });
    if (!commandList)
        return react_1.default.createElement(ink_1.Text, null, "Loading...");
    return (react_1.default.createElement(ink_1.Box, { flexDirection: "column" },
        react_1.default.createElement(ink_1.Text, { color: textEmphasisColor }, `${commandList.length} commands found, use <Tab>, numbers or arrow keys to select a command, then hit <Enter>`),
        commandList.map((command, i) => {
            const isSelected = i === selected;
            const label = `(${i + 1}) ${command}`;
            return boxy ? (react_1.default.createElement(ink_1.Box, { borderColor: isSelected ? boxEmphasisColor : undefined, width: width, paddingX: 1, borderStyle: "single", key: label },
                react_1.default.createElement(ink_1.Text, { color: isSelected ? textSelectionColor : undefined }, label))) : react_1.default.createElement(ink_1.Text, { key: label, color: isSelected ? textSelectionColor : undefined }, label);
        }),
        runningCommand && (react_1.default.createElement(ink_1.Box, { flexDirection: "column" },
            react_1.default.createElement(ink_1.Newline, null),
            react_1.default.createElement(ink_1.Text, { color: textEmphasisColor }, `Running command \`${runningCommand}\``)))));
};
module.exports = App;
exports.default = App;
