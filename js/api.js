'use strict';

// Create a request to a url with an optional callback (data, err)
function createRequest(method, url, callback) {
  let xhttp = new XMLHttpRequest()
  xhttp.open(method, url, true)
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      let data = this.responseText
      let err = this.status == 200 ?
                null : 
                `${this.status} ${this.statusText}`
      
      if (typeof callback === 'function') callback(data, err)
    }
  }
  return xhttp
}

// Send a GET request to a url with an optional callback (data, err)
function get(url, callback) {
  createRequest('GET', url, callback).send()
}

// Send a POST request to a url with an optional callback (data, err)
function post(url, data, callback) {
  let xhttp = createRequest('POST', url, callback)
  xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
  xhttp.send(data)
}
