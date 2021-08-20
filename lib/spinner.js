const ora = require('ora');
const chalk = require('chalk');

let spinner = null;

const start = () => {
    spinner && spinner.stop();
    spinner = ora(chalk.yellowBright("图片压缩中...")).start();
    spinner.color = "yellow";
}

const stop = () => {
    if (spinner) {
        spinner.stop();
    }
}

const succeed = () => {
    if (spinner) {
        spinner.stop();
        spinner.succeed(chalk.greenBright("图片压缩成功!"))
    }
}

module.exports = {
    start: start,
    stop: stop,
    succeed: succeed
};