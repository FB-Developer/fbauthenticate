const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fbSchema = new Schema({
      academicyear:String,
      dept:String,
      sem:String,
      degree:String,
      class:String,
      sectionList:[
        {
            section:String,
            batch:String,
            subjectList:[{
                subname:String,
                facultyList:[{
                  fname:String,
                  fdept:String,
                  fimage:String
                }]
            }]
        }]
});

// const fbSchema = new Schema({
//       academicyear:String,
//       dept:String,
//       sem:String,
//       class:String,
//       theory:[{
//           subname:String,
//           faculty:[{
//             facultyname:String,
//             facultydept:String
//           }]
//       }],
//       practical:[{
//                     batch:String,
//                     subject:[
//                            {
//                             subname:String,
//                               faculty:[
//                                 {
//                                   facultyname:String,
//                                   facultydept:String
//                                 }]
//                           }]
//               }]
// });
fbSchema.index({  academicyear:1,dept:1, sem:1, class:1, degree:1},{unique:true});
module.exports = mongoose.model('fbdetail', fbSchema);
