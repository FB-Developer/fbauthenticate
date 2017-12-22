var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');
const jwt= require('jsonwebtoken');
const config = require('../config');
const userModel=require('../model/user');
const facultydetailModel=require('../model/facultydetail');
const subjectdetailModel=require('../model/subjectdetail');


/*
*Function to add fname and fdept pair to the collection
*/
router.post('/addfacultylist',(request,response,next)=>{
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
router.post('/updatefacultylist', (request, response,next)=>{
    //console.log(request.body.facultyList);
    facultydetailModel.update({dept: request.body.dept},
    { $addToSet: { facultyList: { $each: request.body.facultyList}} }, (error, result)=>{

      if (result == 0)
        response.send(error)
      else if(result.nModified == 0)
          response.send({status:false,mesg:"Faculty Name may be Already Exist or Department/Semester Entry Not Found."});
      else
        response.json({status:true, mesg:"Faculty List Updated."});
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

/*
* Function to Add Subject list in the Database
* input @params: dept, degree sem
*/
router.post('/addsubjectlist',(request,response,next)=>{
  console.log(request.body);
  subject1=new subjectdetailModel(request.body);
   subject1.save((error,subjectlist)=>{
    if(error){
      response.send(error);
    }else{
    response.json({status:true,mesg:"Subject List Added.",subjectlist:subjectlist});
  }
  });
});

/*
* Function to get Subject List from the Database
* input @params: dept, degree, userModel
* output @params: subjectlist
*/
router.get('/getsubjectlist', (request, response,next)=>{
  //console.log(request.query);

  subjectdetailModel.find({dept:request.query.dept,degree:request.query.degree,sem:request.query.sem}, (error,result)=>{
    console.log(result);
    if(result.length == 0){
      response.json({status:false,mesg:"Department/Semester Subjectlist Entry Not Available in Database."});
    }else{
      if(error)
        response.json({status:false,mesg:error.errmsg});
      else
      {
        if((result[0].subjectlist).length == 0)
          response.json({status:false,mesg:"Specified Semester Subject List is Empty in Database."});
        else
          response.json({status:true,fnames:result[0].subjectlist});
      }
    }
  });
});

/*
* Function to update the subject list in the Database
* input @params: dept, degree, sem, Subjectlist
*/
router.post('/updatesubjectlist', (request, response,next)=>{
    //console.log(request.body.facultyList);
    subjectdetailModel.update({dept:request.body.dept,degree:request.body.degree,sem:request.body.sem},
    { $addToSet: { subjectlist: { $each: request.body.subjectlist}} }, (error, result)=>{

      console.log(result);
      if(result == 0)
        response.send(error);
      else if (result.nModified == 0){
        response.send({status:false,mesg:"Subject May Already Exist or Department/Semester Entry Not Found."});
      }else{
        response.json({status:true, mesg:"Subject List Updated."});
      }
    }
  )
});









module.exports = router;
