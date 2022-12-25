"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const ink_1 = require("ink");
const useScreenSize = () => {
    const { stdout } = (0, ink_1.useStdout)();
    const getSize = (0, react_1.useCallback)(() => ({
        height: stdout?.rows,
        width: stdout?.columns,
    }), [stdout]);
    const [size, setSize] = (0, react_1.useState)(getSize);
    (0, react_1.useEffect)(() => {
        const onResize = () => setSize(getSize());
        stdout?.on("resize", onResize);
        return () => {
            stdout?.off("resize", onResize);
        };
    }, [stdout, getSize]);
    return size;
};
exports.default = useScreenSize;
