const chalk = require("chalk");
const readline = require("readline");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

console.log(chalk.red("This text is Red like Taylor™"));
rl.question(
	"Type something and I will echo it back in 3 seconds...\n",
	(answer) => {
		setTimeout(() => {
			console.log(chalk.yellow(answer));
		}, 3000);
		rl.close();
	}
);
