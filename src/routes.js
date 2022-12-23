const path = require('path')
const express = require('express')
const webScrapper = require('./webScrapper')

const api = express.Router()

// read html
api.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, '../index.html'))
})

api.post('/', webScrapper.readWeb)


module.exports = api
