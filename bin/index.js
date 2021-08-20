#!/usr/bin/env node

const path = require('path');
const { program } = require('commander');
const utils = require('../lib/utils.js');
const pkg = require("../package.json");
const chalk = require("chalk");

program
  .version(pkg.version, '-V, --version')
  .option('-u, --url [url]', 'Image Url')
  .option('-d, --directory [directory]', 'Directory Name')
  .option('-f, --filename [filename]', 'File Name')
  .option('-p, --savepath [savepath]', 'Save Directory Name')
  .option('-s, --size [size]', 'file max size')
  .parse(process.argv)

console.log("\n")
const options = program.opts();
if (options.directory || options.filename) {
  const pathname = options.directory || options.filename;
  utils.readDir(path.join('./', pathname), options.savepath, options.size);
} else if (options.url) {
  utils.shrinkImageByUrl(options.url, options.savepath);
} else {
  console.log(chalk.redBright("error: 未输入图片名称或者路径！\n"))
  console.log(chalk.blackBright("<-------------------------命令列表--------------------------------->"))
  console.log(chalk.blackBright("info:  图片名称： -f, --filename [filename]"))
  console.log(chalk.blackBright("info:  图片文件夹： -d, --directory [directory]"))
  console.log(chalk.blackBright("info:  图片保存位置： -p, --savepath [savepath]"))
  console.log(chalk.blackBright("info:  图片超过多少尺寸开始压缩(默认50KB，单位为KB)： -z, --size [size]"))
  console.log("\n")
  console.log(chalk.blackBright("<-------------------------命令示例--------------------------------->"))
  console.log(chalk.blackBright("lk-compress -f [图片名称] -p [保存路径] -s [超过多少压缩]"))
  console.log("\n")
}
