const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fbResultSchema = new Schema({
      fid : String,
      fname : String,
      fdept : String,
      degree : String,
      class : String,
      sem : String,
      dept : String,
      section : String,
      subname : String,
      batch:String,
      academicyear:String,
      fbValueList : [
          {
              rating : String,
              score : Number
          }
      ]
  });
module.exports = mongoose.model('fbresult',fbResultSchema);
