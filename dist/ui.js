"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const ink_1 = require("ink");
const PrintError = ({ text }) => {
    return react_1.default.createElement(ink_1.Box, { borderStyle: "single" },
        react_1.default.createElement(ink_1.Text, { color: "red" },
            react_1.default.createElement(ink_1.Text, { bold: true }, "Error: "),
            text));
};
const App = (props) => {
    const { name = 'Stranger' } = props;
    console.log(props);
    const filename = props?.input?.[0];
    if (!filename)
        return react_1.default.createElement(PrintError, { text: "No file specified." });
    return (react_1.default.createElement(ink_1.Text, null,
        "Hello, ",
        react_1.default.createElement(ink_1.Text, { color: "green" }, name)));
};
module.exports = App;
exports.default = App;
