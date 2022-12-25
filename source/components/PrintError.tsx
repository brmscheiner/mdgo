import React, {FC} from 'react';
import {Text} from 'ink';

const PrintError: FC<{text: string}> = ({ text }) => {
  return <Text color="red"><Text bold>Error: </Text>{text}</Text>
}

module.exports = PrintError;
export default PrintError;
