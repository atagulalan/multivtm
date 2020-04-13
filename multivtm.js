#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')
let encoderApp = './EncoderApp.exe'
let outputDir = 'instances'
let configsDir = 'configs'
let outputFile = 'out.txt'
let args = process.argv.slice(2)

function help() {
  console.log(
    [
      '',
      'Usage: multivtm [options]',
      '       multivtm -e ./encoder.exe',
      '',
      'Options:',
      '       -e, --encoder <file>      EncoderApp.exe path. Can be relative.',
      '       -i, --instance <folder>   Instances will be outputted this folder.',
      '       -c, --configs <folder>    Configs folder for each instance to work.',
      '       -o, --output <file>       Outputs returned lines to specified file',
      '',
    ].join('\n')
  )
}

if (args.includes('--encoder') || args.includes('-e')) {
  argIndex = args.findIndex((e) => e === '--encoder' || '-e')
  encoderApp = args.splice(argIndex, 2)[1]
}
if (args.includes('--instance') || args.includes('-i')) {
  argIndex = args.findIndex((e) => e === '--instance' || '-i')
  outputDir = args.splice(argIndex, 2)[1]
}
if (args.includes('--configs') || args.includes('-c')) {
  argIndex = args.findIndex((e) => e === '--configs' || '-c')
  configsDir = args.splice(argIndex, 2)[1]
}
if (args.includes('--output') || args.includes('-o')) {
  argIndex = args.findIndex((e) => e === '--output' || '-o')
  outputFile = args.splice(argIndex, 2)[1]
}

var deleteFolderRecursive = function (path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      var curPath = path + '/' + file
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}

function run(options, configs) {
  let reConfig = []
  configs.forEach((el) => {
    reConfig.push('-c')
    reConfig.push(el)
  })
  fs.copyFileSync(
    path.join(`${encoderApp}`),
    path.join(
      process.cwd(),
      `${outputDir}/${options.configPath}/EncoderApp.exe`
    )
  )
  exec(
    `"${path.join(
      process.cwd(),
      `${outputDir}/${options.configPath}/EncoderApp.exe`
    )}" ${[...reConfig].join(' ')} > ${outputFile} 2>&1`,
    {
      cwd: path.join(process.cwd(), `${outputDir}/${options.configPath}/`),
      windowsHide: true,
    },
    function (err, data) {
      process.exit(1)
    }
  )
}

if (args[0] === '--help' || args[0] === '--h' || args[0] === 'help') {
  help()
} else {
  deleteFolderRecursive(path.join(process.cwd(), `${outputDir}`))
  fs.mkdirSync(path.join(process.cwd(), `${outputDir}/`))
  fs.readdir(path.join(process.cwd(), `${configsDir}/`), function (err, files) {
    if (err) return console.log('Unable to scan directory: ' + err)
    files.forEach((configPath) => {
      fs.mkdirSync(path.join(process.cwd(), `${outputDir}/${configPath}/`))
      fs.readdir(
        path.join(process.cwd(), `${configsDir}/${configPath}/`),
        function (err, files) {
          if (err) return console.log('Unable to scan directory: ' + err)
          let list = []
          files.forEach(function (file) {
            fs.copyFileSync(
              path.join(process.cwd(), `${configsDir}/${configPath}/${file}`),
              path.join(process.cwd(), `${outputDir}/${configPath}/${file}`)
            )
            if (file.endsWith('.cfg')) list.push(file)
          })
          run({ configPath }, list)
        }
      )
    })
  })
}
