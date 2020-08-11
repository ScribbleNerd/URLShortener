const express = require('express');
const fs = require('fs');
const https = require('https');
const wget = require('wget-improved');
const colors = require('colors');
const semver = require('semver')
const statuscodes = require('../apistatic/status_codes.json');
const app = express();

//Load config
var config = undefined;
function updateConfig(callback) {
  fs.readFile('src/json/config.json', (err, data) => {
    if (err) throw err;
    config = JSON.parse(data);
    if (config != undefined) {
      if (callback != undefined) {
        callback()
      }
    } else {
      throw 'An unexpected error occurred in the updateConfig() function.'.red.bold
    }
  })
}

//Load database
var db = undefined;
function updateDatabase(callback) {
  fs.readFile('src/json/db.json', (err, data) => {
    if (err) throw err;
    db = JSON.parse(data);
    if (db != undefined) {
      if (callback != undefined) {
        callback()
      }
    } else {
      throw 'An unexpected error occurred in the updateDatabase() function'.red.bold
    }
  })
}

//Middleware
updateConfig(() => {
  updateDatabase(() => {
    app.get('*', (req, res, next) => {
      console.log('Request for '.cyan + req.originalUrl.green + ' from '.cyan + req.ip.green)
      const info = req.originalUrl.substr(1)
      updateDatabase(() => {
        if (db.urls[info] != undefined) {
          res.redirect(db.urls[info])
          console.log('Redirecting request '.cyan + req.originalUrl.green + ' to '.cyan + db.urls[info].green)
        } else {
          return next()
        }
      })
    })

    //Web
    //If you would like, you can write your own web interface and just use the api. To learn how the api works, you can go here: *link*
    app.use('/', express.static('src/web/'))

    //API
    app.get('/api/map*', (req, res) => {
      res.send(require('../apistatic/map.json'))
    })

    app.get('/api/gettitle*', (req, res) => {
      updateConfig(() => {
        res.send(JSON.parse(`{"title":"${config.sitename}"}`))
      })
    })

    app.get('/api/geturls*', (req, res) => {
      updateDatabase(() => {
        res.send(db.urls)
      })
    })

    app.get('/api/submiturl*', (req, res) => {
      updateDatabase(() => {
        const info = req.originalUrl.split('/')
        if (info.length < 5) {
          res.send(JSON.parse('{"error":"Please provide the urlPath and urlRedirect"}'))
        } else {
          const urlPath = decodeURIComponent(info[3])
          const urlRedirect = decodeURIComponent(info[4])
          db.urls[urlPath] = urlRedirect
          fs.writeFile('src/json/db.json', JSON.stringify(db), () => {
            res.send(JSON.parse('{"submiturl":"success"}'))
          })
        }
      })
    })

    app.get('/api*', (req, res) => {
      res.status(404).send(statuscodes[404])
    })

    app.get('*', (req, res) => {
      console.log('Error 404 '.red + 'on '.cyan + req.originalUrl.green + ' from '.cyan + req.ip.green)
      fs.readFile('src/errorstatic/404.html', "utf8", (err, data) => {
        if (err) throw err;
        res.status(404).send(data)
      })
    })
    
    //Start server
    if (config.http.enabled) {
      app.listen(config.http.port, () => {
        console.log('HTTP '.green + 'module has been started and is listening on port '.cyan + `${config.http.port}`.green)
      })
    }
    if (config.https.enabled) {
      https.createServer({
        key: fs.readFileSync(config.https.key, (err) => { if (err) console.log(`Error starting HTTPS module due to: ${err}`.red.bold); }),
        cert: fs.readFileSync(config.https.cert, (err) => { if (err) console.log(`Error starting HTTPS module due to: ${err}`.red.bold); })
      }, app).listen(config.https.port, () => {
        console.log('HTTPS '.green +  'module has been started and is listening on port '.cyan + `${config.https.port}`.green)
      })
    }
    if (!config.http.enabled && !config.https.enabled) {
      throw "You cannot have both http and https disabled!".red.bold
    }

    //Check for updates
    function checkForUpdates(tmplocation) {
      let download = wget.download('https://raw.githubusercontent.com/ScribbleNerd/UrlShortener/master/version.json', `${tmplocation}/latest.json`)
      download.on('end', () => {
        const output = fs.readFileSync(`${tmplocation}/latest.json`)
        var json = JSON.parse(output)
        if (semver.gte(json.version, config.version)) {
          if (json.version != config.version) {
            console.log('The version of URLShortener you are running is out of date!'.red.bold)
            console.log('You\'re on version '.cyan + config.version.red + ', but the latest version is '.cyan + json.version.green + '.'.cyan)
            console.log('Please download the latest version from the github: '.cyan + 'https://github.com/ScribbleNerd/UrlShortener/releases.'.cyan.bold)
          }
        }
      })
    }
    if (process.env.TMP != undefined) {
      checkForUpdates(process.env.TMP)
    } else if (process.env.TEMP != undefined) {
      checkForUpdates(process.env.TEMP)
    } else {
      checkForUpdates('/tmp')
    }
    
  })
})