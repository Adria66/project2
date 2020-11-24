const mongoose = require('mongoose')
const Schema = mongoose.Schema

const placesSchema = new Schema({
  name: {type: String, require: true},
  placeId: {type: String, require: true},
  owner: {type: Schema.Types.ObjectId}
})

const Places = mongoose.model('Places', placesSchema)

module.exports = Places