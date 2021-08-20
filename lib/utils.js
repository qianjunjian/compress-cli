#!/usr/bin/env node

let count = 0;
let all = 0;

const fs = require('fs');
const path = require('path');
const tinify = require('tinify');
const cfg = require('../cfg');
const chalk = require('chalk');
const ui = require("cliui")({ width: process.stdout.columns || 80 });
const { start, stop, succeed } = require("./spinner");

tinify.key = cfg.apiKey;

const sourceSize = []
const imagesInfo = {}

function makeRow (a, b, c) {
  return `  ${a}\t    ${b}\t ${c}`
}

function formatSize (size) {
  return (size / 1024).toFixed(2) + " KB"
}

function shrinkImageByPath(filePath, sPath, fSize) {
  const savePath = sPath || cfg.dist;
  const filename = filePath.split('/').slice(-1)[0];
  const distPath = path.join('./',  savePath, filename);
  const statInfo = fs.statSync(filePath);
  if (statInfo.size < fSize * 1024) {
    count ++;
    return;
  }

  const source = tinify.fromFile(filePath);
  source.toFile(distPath, function(err) {
    if (err) {
      console.log(chalk.redBright(`error: 图片 ${filename} 压缩失败！`))
    } else {
      const statInfo2 = fs.statSync(distPath);
      sourceSize.push({
        name: filePath,
        size1: statInfo.size,
        size2: statInfo2.size
      })
    }
    count ++;
    if (count === all) {
      succeed()
      // 打印
      sourceSize.sort((b, c) => b.name.localeCompare(c.name))
      ui.div(
        "\n" +
        makeRow(
            chalk.cyan.bold("文件名"),
            chalk.cyan.bold("压缩前"),
            chalk.cyan.bold("压缩后")
        ) + "\n\n" +
        sourceSize.map(asset => makeRow(
            chalk.greenBright(asset.name),
            chalk.blueBright(formatSize(asset.size1)),
            chalk.blueBright(formatSize(asset.size2))
        )).join("\n")
      )
      console.log(`${ui.toString()}\n`)
      console.log(chalk.gray(`注意：压缩后的图片在目录${savePath}下。`))
      console.log(`\n`)
    }
  });
}

function shrinkImageByUrl(url, sPath) {
  const savePath = sPath || cfg.dist;
  if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath);
  }
  const filename = url.split('/').slice(-1)[0];
  const distPath = path.join('./',  savePath, filename);
  const source = tinify.fromUrl(url);
  source.toFile(distPath, function(err) {
    if (err) {
      console.log(chalk.redBright(`error: 图片 ${filename} 压缩失败！`))
    } else {
      console.log(chalk.greenBright(`success: 图片 ${filename} 压缩完成！`));
    }
  });
}

function getImages(fromPath, sPath) {
  if (!imagesInfo[fromPath]) {
    imagesInfo[fromPath] = [];
  }
  if (sPath) {
    if (!fs.existsSync(sPath)) {
      fs.mkdirSync(sPath);
    }
  }
  const files = fs.readdirSync(fromPath);
  files.map(file => {
    const statInfo = fs.statSync(fromPath + '/' + file);
    if (statInfo.isDirectory()) {
      getImages(fromPath + '/' + file, sPath + '/' + file)
    } else if (file.endsWith(".png") || file.endsWith(".jpg")) {
      imagesInfo[fromPath].push({
        fromPath: fromPath,
        image: fromPath + '/' + file,
        savePath: sPath
      })
    }
  })
}

function readDir(fromPath, sPath, size) {
  const savePath = sPath ? sPath : path.resolve(process.cwd() , fromPath, "../", cfg.dist) ;
  const fSize = size || cfg.maxSize;
  count = 0;
  all = 0;
  if (!imagesInfo[fromPath]) {
    imagesInfo[fromPath] = [];
  }

  if (savePath) {
    if (!fs.existsSync(savePath)) {
      fs.mkdirSync(savePath);
    }
  }
  start()
  if (fromPath.indexOf('.') != -1) {
    if (fs.existsSync(fromPath)) {
      shrinkImageByPath(fromPath, savePath, fSize);
    } else {
      stop()
      console.log(chalk.redBright("error: 图片不存在！"))
    }
  } else {
    fs.readdir(fromPath, function(err, files) {
      if (err) {
        stop()
        console.log(chalk.redBright("error: 当前目录文件读取失败！"))
      } else {
        files.map(file => {
          const statInfo = fs.statSync(fromPath + '/' + file);
          if (statInfo.isDirectory()) {
            getImages(fromPath + '/' + file, savePath + '/' + file)
          } else if (file.endsWith(".png") || file.endsWith(".jpg")) {
            imagesInfo[fromPath].push({
              fromPath: fromPath,
              image: fromPath + '/' + file,
              savePath: savePath
            })
          }
        })
        Object.keys(imagesInfo).forEach(key => {
          all += imagesInfo[key].length;
        })
        Object.keys(imagesInfo).forEach(key => {
          const images = imagesInfo[key];
          images.forEach(function(item) {
            shrinkImageByPath(item.image, item.savePath, fSize);
          });
        })
      }
    });
  }
}

module.exports = {
  readDir: readDir,
  shrinkImageByUrl: shrinkImageByUrl
};
