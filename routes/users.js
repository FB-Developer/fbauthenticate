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

router.post('/getallusers', (request, response, next)=>{
  console.log(request.body);
userModel.find({'studentdetail.academicyear':request.body.academicyear})
.where('studentdetail.dept').equals(request.body.dept)
.where('studentdetail.sem').equals(request.body.sem)
.where('studentdetail.class').equals(request.body.class)
.where({'studentdetail.completed': {$eq :request.body.completed}})
.exec((error, document)=>{
    console.log(document.length);
    if(error){
      // console.log('Error:' + error);
      response.json({status:false,mesg: 'data not exist'});
    }
    else if(document.length == 0)
      response.json({status:false,mesg:"!found"});
    else
      response.json({status:true, mesg: document});
  });
});

//-------------------------

router.get('/getcompletedusers', (request, response, next)=>{
  console.log(request.body);
  console.log(request.query.dept);
  console.log(request.query.academicyear);
  console.log(request.query.sem);
  console.log(request.query.class);
  console.log(request.query.completed);

  var query = {};

  if (request.body.academicyear) query.academicyear = request.body.academicyear;
  if (request.body.dept) query.academicyear = request.body.dept;
  if (request.body.sem) query.academicyear = request.body.sem;
  if (request.body.class) query.academicyear = request.body.class;
  if (request.body.completed) query.academicyear = request.body.completed;

    userModel.find(query, (error, document)=>{

      if (error) console.log(error);
      else return response.json(document);
    });

  // console.log(request.body);
  // userModel.find({'studentdetail.academicyear':request.body.academicyear})
  // .where('studentdetail.dept').equals(request.body.dept)
  // .where('studentdetail.sem').equals(request.body.sem)
  // .where('studentdetail.class').equals(request.body.class)
  // .where({'studentdetail.completed': {$eq :request.body.completed}})
  // .exec((error, document)=>{
  //   console.log(document.length);
  //   if(error){
  //     console.log('Error:' + error);
  //     response.json({status:false,mesg: 'data not exist'});
  //   }
  //   else if(document.length == 0)
  //     response.json({status:false,mesg:"!found"});
  //   else
  //     response.json({status:true, mesg: document});
  // });
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

router.post('/getfbresult', (request, response, next)=>{
fbresult.find(request.body,(error,result)=>
  {
      if(error)
        response.json({status:false,mesg:error.errmsg});
      else
      {
        if(result.length==0)
          response.json({status:false,mesg:"Data !Found"});
        //console.log(result[0].fbValueList);
        // console.log(JSON.stringify(result[0].fbValueList.find({"fbValueList.rating":"Excellent"}).count()).count(), null, 2));
        result.map((tempresult)=>{
          var excellentCount=0;
          var verygoodCount=0;
          var goodCount=0;
          var fairCount=0;
          var totalCount=0;
          var scoreTotal=0;
          tempresult.fbValueList.map((fbvalue)=>{
              if(fbvalue.rating=='Excellent')
                excellentCount++;
              else if(fbvalue.rating=='Very Good')
                  verygoodCount++;
              else if(fbvalue.rating=='Good')
                    goodCount++;
              else if(fbvalue.rating=='Fair')
                      fairCount++;
              totalCount++;
              scoreTotal+=fbvalue.score;
            });
            var resultResponse="fbResult:{'Total':"+totalCount+
                    ",'Excellent':"+excellentCount+
                    ",'Very Good':"+verygoodCount+
                    ",'Good':"+goodCount+
                    ",'Fair':"+fairCount+
                    ",'Avgscore':"+(scoreTotal/totalCount)+
                  "}";
            response.json({status:true,mesg:resultResponse});
        });
      }
  });
});


//-------------------------
//to add the academicyear node details
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


//method to add the user (Student/Faculty)
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
*function to register user fddeback and ser COMPLETED = true
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
                response.json({status:true,mesg:result});
              }
          });
        }else{
                response.json({status:false,mesg:"!Found"});
      }
    });
});

/*
*function to get completed status of user feedback
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
