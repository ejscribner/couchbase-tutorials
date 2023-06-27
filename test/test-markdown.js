const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const chalk = require('chalk')


// go through every file specified directory

const getAllFiles = function(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      if (path.extname(file).toLowerCase() === '.md')
        arrayOfFiles.push(path.join(dirPath, file))
    }
  })

  return arrayOfFiles
}

let mdFiles = []

mdFiles = getAllFiles('./tutorial/markdown', mdFiles)
mdFiles = getAllFiles('./learn/markdown', mdFiles)


// parse data
function ParseMarkdown(path) {

  try {

    let data = fs.readFileSync(path, { encoding: 'utf-8' })
    extractedContent = data.match(/---\n([^]*?)\n---/) // for LF line break

    if (!extractedContent)
      extractedContent = data.match(/---\r\n([^]*?)\r\n---/) //for CRLF line break

    if (!extractedContent)
      throw `md file at: ${path} doesn't have data in the specified format`

    const formattedData = yaml.load(extractedContent[1])

    test(formattedData, path)

  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('File not found : ', err)
    } else {
      throw err
    }

    process.exit(1)
  }

}

mdFiles.forEach((e) => {
  ParseMarkdown(e)
})

console.log(chalk.green('Test Completed:') + ' ' + chalk.bgGreen('SUCCESS') + '\n')
