// server implementation of Node.js

const fs = require('fs')
const path = require('path')
const http = require('http')

const server = http.createServer((req, res) => {
  console.log('HTTP/' + req.httpVersion, req.method, req.url, req.headers)

  // Access-Control-Allow-Origin, Access-Control-Allow-Headers were necessary
  res.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Accept, Content-Type',
    'Content-Type': 'application/json',
  })

  // eager return, can be used for health checking
  if (req.method !== 'POST') {
    return res.end(JSON.stringify({ status: 0, data: 'success' }))
  }

  const now = new Date()
  const [y, m, d /* h, m_, s */] = [
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
    // now.getHours(),
    // now.getMinutes(),
    // now.getSeconds()
  ]
  const file =
    y +
    '-' +
    [m, d]
      .map((x) => String(x).padStart(2, '0'))
      .join(
        '-'
      ) /* +
      ' ' +
      [h, m_, s].map(x => String(x).padStart(2, '0')).join(':') */

  req.pipe(fs.createWriteStream(path.join(__dirname, '../db', file + '.json')))

  req.on('end', () => {
    res.end(JSON.stringify({ status: 0, data: 'success' }))
  })
})

server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
})

server.listen(1234, 'localhost')
