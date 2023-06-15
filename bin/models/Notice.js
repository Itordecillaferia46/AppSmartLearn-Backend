const mongoose = require('mongoose')
const NoticiasSchema = new mongoose.Schema({
    title : String,
    autor: String,
    category: String,
    time: String,
    abstract: String,
    content: String,
    images: String,
})

var Notice = mongoose.model('Notice', NoticiasSchema)
module.exports = Notice;