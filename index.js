const express = require('express')
const proxy = require('express-http-proxy')

const PORT = 8080

const app = express()

app.use(express.static('.'))

app.use('/api', proxy('localhost:3000'))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})