var express = require('express');
var router = express.Router();

var find =require('lodash.find');
const mongoose = require('mongoose');
const jwt= require('jsonwebtoken');
const config = require('../config');
const userModel=require('../model/user');
const fbdetail=require('../model/faculty');
const fbresult=require('../model/fbresultdetail');

router.get('/', function(req, res, next) {
  fbdetail.find((error,resp)=>{
      if(error)
          console.log("Error");
      //console.log(resp[0].theory[0].subname);
      // console.log(resp[0].academicyear);
      // console.log(resp[0].dept);
      // console.log(resp[0].sem);
      // console.log(resp[0].class);
      // console.log(resp[0].practical[0].subject[0].subname);
      res.json(resp);
 });
});

//method to get Main Node details as the student details
// router.post('/fbdetail', function(request, response, next) {
//     const cursor=fbdetail.findOne({academicyear:request.body.academicyear})
//       .where('dept').equals(request.body.dept)
//       .where('sem').equals(request.body.sem)
//       .where('class').equals(request.body.class)
//       .exec((error,document)=>{
//           if(error || document == null){
//             // console.log('Error:' + error);
//             response.json({status:false,mesg: 'data not exist'});
//           } else
//           {
//             practical=find(document.practical,{'batch':request.body.batch});
//             if(practical.subject)
//               mesg1={
//                 "theory":document.theory,
//                   "practical":practical.subject
//               };
//               else {
//                 mesg1={
//                   "theory":document.theory
//                 }}
//             response.json({status:true, mesg: mesg1});
//           }
//         });
// });


router.get('/fbformlistbydept', function(request, response, next) {
    const cursor=fbdetail.find({academicyear:request.query.academicyear})
      .where('dept').equals(request.query.dept)
      .exec((error,document)=>{
          if(error || document == null){
            // console.log('Error:' + error);
            response.json({status:false,mesg: 'data not exist'});
          } else
          {

            temp=[];
            for (var indx = 0; indx < document.length; indx++) {
              temp.push({"academicyear":document[indx].academicyear,
              "dept":document[indx].dept,
              "sem":document[indx].sem,
              "class":document[indx].class,
              "degree":document[indx].degree
              });
          }
          response.json(temp);
          }
        });
});

//Delete whole FB details node from the database
router.delete('/deletefbdetail', function(request, response, next){

    console.log(request.query);
    
    fbdetail.remove({academicyear:request.query.academicyear, degree:request.query.degree,
                    dept:request.query.dept, sem:request.query.sem, class:request.query.class},         function(err, result){
        
        console.log("Callback: " + result + "\t N:" + JSON.parse(result).n);
        
        if(err){
            response.json({ status:false, mesg: 'Data Not Removed. Refresh to try again.'});
            
        }
        else{
           response.json({ status:true, mesg: result});
        }
    
    });
    
});

router.get('/fbformdetail', function(request, response, next) {
    const cursor=fbdetail.findOne({academicyear:request.query.academicyear})
      .where('dept').equals(request.query.dept)
      .where('sem').equals(request.query.sem)
      .where('class').equals(request.query.class)
      .where('degree').equals(request.query.degree)
      .exec((error,document)=>{
          if(error || document == null){
            response.json({status:false,mesg: 'data not exist'});
          } else
          {
              response.json({status:true, mesg: document});
          }
        });
});

router.post('/fbdetailv1', function(request, response, next) {
    const cursor=fbdetail.findOne({academicyear:request.body.academicyear})
      .where('dept').equals(request.body.dept)
      .where('sem').equals(request.body.sem)
      .where('class').equals(request.body.class)
      .where('degree').equals(request.body.degree)
      .exec((error,document)=>{
          if(error || document == null){
            // console.log('Error:' + error);
            response.json({status:false,mesg: 'data not exist'});
          } else
          {
            // practical=find(document.practical,{'batch':request.body.batch});
            // if(practical.subject)
            //   mesg1={
            //     "theory":document.theory,
            //       "practical":practical.subject
            //   };
            //   else {
            //     mesg1={
            //       "theory":document.theory
            //     }}

            theory=find(document.sectionList,{'section':"Theory"});
            practical=find(document.sectionList,{'section':"Practical",'batch':request.body.batch});
            technician=find(document.sectionList,{'section':"Technician",'batch':request.body.batch});
            if(theory&&practical)
            {
              if(technician)
                mesg1={"sectionList":[theory,practical,technician]};
              else {
                mesg1={"sectionList":[theory,practical]};
              }
              response.json({status:true, mesg: mesg1});
            }
            else {
              mesg1="Something Wrong with datasource!!!!";
              response.json({status:false, mesg: mesg1});
            }
          }
        });
});

router.get('/getallusers', (request, response, next)=>{
  //console.log(request.body);
userModel.find({'studentdetail.academicyear':request.query.academicyear})
.where('studentdetail.dept').equals(request.query.dept)
.where('studentdetail.sem').equals(request.query.sem)
.where('studentdetail.class').equals(request.query.class)
.where('studentdetail.degree').equals(request.query.degree)
.exec((error, document)=>{
    console.log(document.length);
    if(error){
      // console.log('Error:' + error);
      response.json({status:false,mesg: 'data not exist'});
    }
    else if(document.length == 0)
      response.json({status:false,mesg:"User List Empty"});
    else
      response.json({status:true, mesg: document});
  });
});

//-------------------------

router.get('/getcompletedusers', (request, response, next)=>{

  /*
  *   THis section of code is not working properely - See below with details
  */
  // console.log(request.body);
  // console.log(request.query.dept);
  // console.log(request.query.academicyear);
  // console.log(request.query.sem);
  // console.log(request.query.class);
  // console.log(request.query.completed);
  //
  // var query = {};
  //
  // if (request.query.academicyear) query.academicyear = request.query.academicyear;
  // if (request.query.dept) query.dept = request.query.dept;
  // if (request.query.sem) query.sem = request.query.sem;
  // if (request.query.class) query.class = request.query.class;
  // if (request.query.completed) query.completed = request.query.completed;
  //
  // console.log(query);
  //
  //   userModel.find(query, (error, document)=>{
  //
  //     if (error) console.log(error);
  //     else return response.json(document);
  //   });


/*
 *  This Section of Code is working properely
 *  input @params: academicyear, dept, sem, class, completed
 *  output : Will response with array of non-completed feedback list of users with whole node details
 *      as specified in the user Model (see /model/user.js)
 */

  console.log(request.body);
  userModel.find({'studentdetail.academicyear':request.query.academicyear})
  .where('studentdetail.dept').equals(request.query.dept)
  .where('studentdetail.sem').equals(request.query.sem)
  .where('studentdetail.class').equals(request.query.class)
  .where({'studentdetail.completed': {$eq :request.query.completed}})
  .exec((error, document)=>{
    console.log(document.length);
    if(error){
      console.log('Error:' + error);
      response.json({status:false,mesg: 'data not exist'});
    }
    else if(document.length == 0)
      response.json({status:false,mesg:"!found"});
    else
      response.json({status:true, mesg: document});
  });
});


router.delete('/deleteusers', (request, response, next)=>{

        console.log("****",request.query.idList);
       userModel.deleteMany({ userId: { $in: JSON.parse(request.query.idList)}}, function(error,result) {
           if(error)
           {
               response.send({status:false,mesg:error.errmsg});
           }
            response.send({status:true,mesg:result});
        });
});


router.post('/addfbresult', (request, response, next)=>{
  fbresult.find(request.body.fbrequest,(error,result)=>{
    console.log(result,error);
      if(result.length==0)
      {
        fr=new fbresult(request.body.fbrequest);
        fr.save((error,result)=>{
          if(error)
            response.json({status:false,mesg:error.errmsg});
          else {
            fbresult.update(request.body.fbrequest,{$push:{fbValueList:request.body.fbresult}},(error,result)=>
            {
                if(error)
                  response.json({status:false,mesg:error.errmsg});
                response.json({status:true,mesg:result});
            });
          }}
        );
      }
      else{
        fbresult.update(request.body.fbrequest,{$push:{fbValueList:request.body.fbresult}},(error,result)=>
        {
            if(error)
              response.json({status:false,mesg:error.errmsg});
            response.json({status:true,mesg:result});
        });
      }});
    });


/*
*   To add the academicyear node details
*   See model (/model/faculty.js) for details
*/
router.post('/addfbdetail',(request,response,next)=>{
    fbdt=new fbdetail(request.body);
    fbdt.save((error,result)=>{
      if(error)
        response.json({status:false,mesg:error.errmsg});
      else {
        response.json({status: true, mesg: result});
      }
    });
});


/*
*  Function to add the user (Student/Faculty)
*  See model (/model/user.js) for details
*/
router.post('/adduser',(request,response,next)=>{
  console.log(request.body);
  user1=new userModel(request.body);
   user1.save((error,userdt)=>{
    if(error)
      response.send(error);
    response.json(userdt);
  });
});

/*
*   Function to register user fddeback and ser COMPLETED = true
*   input @params: userId
*/
router.post('/setcompleted', (request, response, next)=>{
    userModel.find(request.body, (error, result)=>{
    //  console.log(result, error);
      if(result.length != 0){

        userModel.update(request.body,{ $set: { "studentdetail.completed" : true }}, (error, result)=>{
              if (error)
                response.json({status:false,mesg:error.errmsg});
              else{
                console.log(result);
                response.json({status:true,mesg:"Feedback Registered"});
              }
          });
        }else{
                response.json({status:false,mesg:"!Found"});
      }
    });
});

/*
* Function to De-Register user fddeback (set COMPLETED = false)
* input @params: userId
*/
router.post('/setcompletedfalse', (request, response, next)=>{
    userModel.find(request.body, (error, result)=>{
    //  console.log(result, error);
      if(result.length != 0){

        userModel.update(request.body,{ $set: { "studentdetail.completed" : false }}, (error, result)=>{
              if (error)
                response.json({status:false,mesg:error.errmsg});
              else{
                console.log(result);
                response.json({status:true,mesg:"Feedback De-registered"});
              }
          });
        }else{
                response.json({status:false,mesg:"!Found"});
      }
    });
});


/*
*  Function to completed status of user
*  To check weather feedback is submitted or not
*/
router.get('/getCompletedStatus', (request, response, next)=>{
  //console.log(request.query);
  //response.send(request.query);

  userModel.find(request.query, (error, result)=>{
  //  console.log(result, error);

  console.log(result);
    if(result.length != 0){

        if(result[0].userRole == "student"){
            response.json({status: true, mesg: {'completed':result[0].studentdetail.completed}});
          }
        else{
            response.json({status: false, mesg:"Is Not Student"});
        }
      }else{
              response.json({status:false,mesg:"!Found"});
    }
  });
});

module.exports = router;
