const cors = require('cors')
const express = require('express')
const morgan = require('morgan')
const app = express()
const port = 80

const hostingAppId = process.argv[2]

if (!hostingAppId) {
  console.error("Holo Hosting App ID must be specified as command line argument, e.g.:")
  console.error("")
  console.error("    npm start <HHA_ID>")
  console.error("")
  process.exit(1)
}

app.use(morgan('dev'))
app.use(cors({origin: true}))

app.use('/', (req, res, next) => {
  if (req.hostname === 'resolver.holohost.net') {
    res.send({
        // Holo Hosting App ID (change)
        hash: hostingAppId,
        hosts: [
            // `pubkey` is arbitrary,
            // 48080 is the port that envoy is listening on for static asset serving
            "pubkey.holohost.net:48080",
        ],
    })
  } else {
    next()
  }
})

app.use(express.static(__dirname))

app.listen(port, () => console.log(`Mock resolver listening on port ${port} for HHA ID: ${hostingAppId}`))