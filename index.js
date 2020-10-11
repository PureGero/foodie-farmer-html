const express = require('express')
const fs = require('fs')
const path = require('path')
const proxy = require('express-http-proxy')
const sharp = require('sharp')
const url = require('url')

const PORT = 8080
const SRC = 'foodie farmers'
const DIST = 'dist'

const app = express()

app.use('/api', proxy('localhost:3000'))

app.use((req, res, next) => {
  let path = decodeURI(url.parse(req.url).pathname)

  if (path.endsWith('/')) {
    path = path + 'index.html'
  }

  let file = SRC + path
  
  if (file.endsWith('.html') || file.endsWith('.js')) {
    parseFile(file, (err, data) => {
      if (err) return next()

      if (file.endsWith('.html')) res.setHeader('content-type', 'text/html; charset=utf-8')
      if (file.endsWith('.js')) res.setHeader('content-type', 'text/js; charset=utf-8')

      res.end(data)
    })
  } else {
    fs.readFile(file, (err, data) => {
      if (err) return next()

      res.end(data)
    })
  }

})

function parseFile(file, callback) {
  fs.readFile(file, 'utf8', function(err, data) {
    if (err) return callback(err, null)

    parseData(file, data, callback)
  })
}

function parseData(file, data, callback) {
  let includesIndex = data.indexOf('%include ')

  if (~includesIndex) {
    let include = data.substring(includesIndex + 9, data.indexOf('%', includesIndex + 1))
    return fs.readFile(path.dirname(file) + '/' + include, 'utf8', function(err, includeData) {
      if (err) return callback(err, null)
  
      data = data.substring(0, includesIndex) + includeData + data.substring(data.indexOf('%', includesIndex + 1) + 1)
      parseData(file, data, callback)
    })
  }

  callback(null, data)
}

function buildDirectory(src, dist) {
  fs.mkdir(dist, err => { /* Ignored */ })

  fs.readdir(src, (err, files) => {
    files.forEach(file => {
      let from = path.join(src, file)
      let to = path.join(dist, file)

      fs.lstat(from, (err, stats) => {
        if (err) return console.log(err)
    
        if (stats.isDirectory()) {
          buildDirectory(from, to)
        } else if (file.endsWith('.html') || file.endsWith('.js')) {
          parseFile(from, (err, data) => {
            if (err) return console.log(err)

            fs.writeFile(to, data, err => {
              if (err) return console.log(err)

              console.log(from + ' was built')
            })
          })
        } else if (file.endsWith('.jpg')) {
          sharp(from)
            .resize(350)
            .toFile(to, (err, info) => {
              if (err) return console.log(err)

              console.log(from + ' was compressed')
            });
          fs.readFile(from, (err, data) => {
            if (err) return console.log(err)

            fs.writeFile(to.substr(0, to.lastIndexOf('.')) + '-large.jpg', data, err => {
              if (err) return console.log(err)

              console.log(from + ' was built')
            })
          })
        } else {
          fs.readFile(from, (err, data) => {
            if (err) return console.log(err)

            fs.writeFile(to, data, err => {
              if (err) return console.log(err)

              console.log(from + ' was built')
            })
          })
        }
      })
    })
  })
}

// npm run start
if (~process.argv.indexOf('start')) {
  app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
  })
}

// npm run build
if (~process.argv.indexOf('build')) {
  console.log('Build initiated')
  buildDirectory(SRC, DIST)
}
