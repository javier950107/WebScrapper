const express = require('express')
const path = require('path')
const bp = require('body-parser')

const routes = require('./src/routes')

const app = express()
const PORT = 3004

app.use(bp.json())
app.use(bp.urlencoded({extended:true}))
app.use(express.static(`${__dirname}/src/`,{extensions: ['js']}))
app.use(routes)
app.listen(PORT)
console.log(`Server is running in PORT ${PORT}`)
