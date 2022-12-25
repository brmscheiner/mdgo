"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const ink_1 = require("ink");
const PrintError = ({ text }) => {
    return react_1.default.createElement(ink_1.Text, { color: "red" },
        react_1.default.createElement(ink_1.Text, { bold: true }, "Error: "),
        text);
};
module.exports = PrintError;
exports.default = PrintError;
