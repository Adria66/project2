const mongoose = require('mongoose')
const Schema = mongoose.Schema

const placesSchema = new Schema({
  placeName: {type: String, require: true},

})

const Places = mongoose.model('Places', quoteSchema)

module.exports = Places