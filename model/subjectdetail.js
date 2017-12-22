const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subjectdetailSchema = new Schema({
      dept:String, //{type:String, unique:true},
      degree:String,
      sem:String, //{type:String, unique:true},
      subjectlist: { type:Array,distinct:true}
  });
subjectdetailSchema.index({  dept:1,degree:1,sem:1},{unique:true});
module.exports = mongoose.model('subjectdetail',subjectdetailSchema);
