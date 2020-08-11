getTitle((actualtitle) => {
  var title = document.getElementsByClassName('title')
  for (var  i = 0; i < title.length; i++) {
    title[i].innerHTML = actualtitle;
  }
})

document.getElementById('urlpath').placeholder = `${location.hostname}/`

if (location.search.length != 0) {
  if (location.search == "?success") {
    success()
  } else if (location.search == '?error') {
    error()
  } else {
    const info = location.search.split('&')
    var urlpath;
    var urlredirect;
    for (var i = 0; i < info.length; i++) {
      const infosplit = info[i].split('=')
      if (infosplit[0] == '?urlpath') {
        urlpath = decodeURIComponent(infosplit[1]).replace(`${location.hostname}/`, '')
      } else if (infosplit[0] == 'urlredirect') {
        urlredirect = decodeURIComponent(infosplit[1]);
      }
      donewithurl()
    }
    function donewithurl() {
      submitUrl(urlpath, urlredirect, (status) => {
        if (status == 'exists') {
          exists()
        } else if (status == 'invalidurlredirect') {
          invalidurlredirect()
        } else if (status == 'success') {
          location.search = "?success"
        } else if (status == 'error') {
          location.search = "?error"
        }
      })
    }
  }
}

function exists() {
  document.getElementById('error').innerHTML = '<div class="alert alert-danger alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>That shortlink already exists!</strong> </div>'
}
function invalidurlredirect() {
  document.getElementById('error').innerHTML = '<div class="alert alert-danger alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>That\'s an invalid long URL!</strong> </div>'
}

function success() {
  document.getElementById('error').innerHTML = '<div class="alert alert-primary alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Successfully created short url.</strong> </div>'
}

function error() {
  document.getElementById('error').innerHTML = '<div class="alert alert-danger alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>An unknown error occurred. Please try again later.</strong> </div>'
}
$(".alert").alert();