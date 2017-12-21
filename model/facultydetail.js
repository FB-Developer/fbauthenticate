const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const facultydetailSchema = new Schema({
      dept:{type:String, unique:true},
      facultyList: { type:Array}
  });
module.exports = mongoose.model('facultydetail',facultydetailSchema);
