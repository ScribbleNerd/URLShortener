const urlregex = new RegExp('^(https?:\\/\\/)?((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-x]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))(\\:\\d+)?(\\/[-a-z\\d%_.!+]*)*(\\?[[;&a-z\\d%_.~+=-]*)?(\\#[-a-z\\d_]*)?$', 'i')

async function loadJSON(location, callback) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', location, true);
  xobj.onreadystatechange = () => {
    if (xobj.readyState == 4 && xobj.status == "200") {
      callback(xobj.responseText)
    }
  }
  xobj.send(null);
}

async function getTitle(callback) {
  loadJSON('/api/gettitle', (data) => {
    const json = JSON.parse(data)
    callback(json.title)
  })
}

async function submitUrl(urlPath, urlRedirect, callback) {
  loadJSON('/api/geturls', (data) => {
    const json = JSON.parse(data)
    if (json[urlPath] != undefined) {
      callback('exists')
    } else if (!urlRedirect.match(urlregex)) {
      callback('invalidurlredirect')
    } else {
      loadJSON(`/api/submiturl/${encodeURIComponent(urlPath)}/${encodeURIComponent(urlRedirect)}`, (data) => {
        const json = JSON.parse(data)
        console.log(json)
        if (json.submiturl == 'success') {
          callback('success')
        } else {
          callback('error')
        }
      })
    }
  })
}