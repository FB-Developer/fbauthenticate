var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');
const jwt= require('jsonwebtoken');
const config = require('../config');
const userModel=require('../model/user');
const facultydetailModel=require('../model/facultydetail');


/*
*Function to add fname and fdept pair to the collection
*/
router.post('/addfaculties',(request,response,next)=>{
  console.log(request.body);
  faculty1=new facultydetailModel(request.body);
   faculty1.save((error,userdt)=>{
    if(error){
      response.send(error);
    }else{
    response.json({status:true,mesg:"Faculty Details Added.",userdata:userdt});
  }
  });
});

/*
* Function to add a single faculty entry on the department faculty List
*/
router.post('/addfaculty', (request, response,next)=>{
    //console.log(request.body.facultyList);
    facultydetailModel.update({dept: request.body.dept},
    { $push: { facultyList: { $each: request.body.facultyList}} }, (error, result)=>{

      if (result == 0){
        response.send(error);
      }else{
        response.json({status:true, mesg:"Faculty List Updated."});
      }

    }
  )
});

/*
* Function to get fname based on the passed fdept
*/
router.get('/getfacultylist', (request, response,next)=>{

  console.log(request.query.fdept);

  facultydetailModel.find({dept:request.query.dept}, (error,result)=>{
    console.log(result);
    if(result.length == 0){
      response.json({status:false,mesg:"Department Entry Not Available in Database."});
    }else{
      if(error)
        response.json({status:false,mesg:error.errmsg});
      else
      {
        if((result[0].facultyList).length == 0)
          response.json({status:false,mesg:"Specified Department Faculty List Not Available in Database."});
        else
          response.json({status:true,fnames:result[0].facultyList});
      }
    }
  });

  /// aggregate code based on different collection format
  // facultydetailModel.aggregate([
  //   {
  //     $match:{fdept:request.query.dept}
  //   },{
  //     $group: {
  //         _id: null,
  //         faclutyList: {$push: { fname: "$fname"}}
  //     }
  //   }
  // ], (error,result)=>{
  //   if(error)
  //     response.json(error);
  //   response.json(result);
  //
  // });
});




module.exports = router;
