// Load a javascript file dynamically
function require(url) {
  let script = document.createElement("script")
  script.src = url

  document.head.appendChild(script)
}

require('js/api.js')