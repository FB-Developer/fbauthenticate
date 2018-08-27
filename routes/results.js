var express = require('express');
var router = express.Router();
var mongoXlsx = require('mongo-xlsx');

const mongoose = require('mongoose');
const jwt= require('jsonwebtoken');
const config = require('../config');
const userModel=require('../model/user');
const fbdetail=require('../model/faculty');
const fbresult=require('../model/fbresultdetail');

/*
* Function to get overall results
* @params: academicyear & dept
*/
router.get('/overall', function(request, response, next) {
 //  fbresult.find((error,resp)=>{
 //      if(error)
 //          console.log("Error");
 //      res.json(resp);
 // });

 fbresult.aggregate([{
   $match: {academicyear: request.query.academicyear,fdept:request.query.dept}
    },
    {$unwind: "$fbValueList"},
    {$group:
      {_id: {fname: "$fname",rating:"$fbValueList.rating"},
        count: {"$sum": 1 },
        total:{"$sum":"$fbValueList.score"}
      }
      },
        {$group:
           {_id: "$_id.fname",
              rating_group: {$push: {rating: "$_id.rating",count: "$count"}},
              totalScore:{$sum:"$total"},
              totalCount:{$sum:"$count"}
          },
        }
      ],(error,result)=>{
        if(error){
          response.json(error);}else{
        response.json(result); }
      });
});

router.get('/export2xslx', function(request, response, next) {
 fbresult.aggregate([{
   $match: {academicyear: request.query.academicyear,fdept:request.query.dept}
    },
    {$unwind: "$fbValueList"},
    {$group:
      {_id: {fname: "$fname",rating:"$fbValueList.rating"},
        count: {"$sum": 1 },
        total:{"$sum":"$fbValueList.score"}
      }
      },
        {$group:
           {_id: "$_id.fname",
              rating_group: {$push: {rating: "$_id.rating",count: "$count"}},
              totalScore:{$sum:"$total"},
              totalCount:{$sum:"$count"}
          },
        }
      ],(error,result)=>{
        if(error){
          response.json(error);}else{
            console.log(result.length);
            if (result.length != 0) {

              result.map(x => {
                    for (let grp of x.rating_group) {
                            x[grp['rating']] = grp['count'];
                    }
                    let tempScore = x.totalScore;  //temporary storage made inorder to put total score and total count at last position
                    let tempCount = x.totalCount;
                    delete x.rating_group;   // deleting it as it is not necessary
                    delete x.totalCount;
                    delete x.totalScore;
                    x.totalScore = tempScore;  //pushing totalScore to second last position
                    x.totalCount = tempCount;  //pushing totalCount to last position
                });
                  /* Generate automatic model for processing (A static model should be used) */
                  var model = mongoXlsx.buildDynamicModel(result);
                  /* Generate Options */
                  var options = {

                    save: true,
                    fileName: request.query.academicyear+"_"+request.query.dept+"_"+ new Date().getHours() + "_" + new Date().getMinutes() + "_" + new Date().getSeconds() +".xlsx",
                    path : "./reports",
                    defaultSheetName: request.query.academicyear+"_"+request.query.dept
                  }

                  /* Generate Excel */
                  mongoXlsx.mongoData2Xlsx(result, model,options, function(err, res) {

                    if (err) {
                      response.json({status:false,mesg:err});
                    }else{
                      console.log('File saved at:', res.fullPath);
                      console.log(res);
                      response.json({status:true,mesg:res});
                    }

                  });

            }else{
              response.json({status:false,mesg:"No Data Available for this selections."});
            }

      }
      });
});

/*
* Function to get Result based on passed parameters
* input @params: avademicyear, dept, fname
* output : List of response fbResult Node
*/
router.get('/',(request,response,next)=>{
    console.log(request);
    fbresult.find({academicyear: request.query.academicyear,fdept:request.query.dept,fname:request.query.fname},
  (error,result)=>{
    if(error)
      response.json({status:false,mesg:error.errmsg});
    else
    {
      var fbValueList = 0;
      if(result.length==0){}
        fbValueList = "Data !Found";
      //console.log(result[0].fbValueList);
      // console.log(JSON.stringify(result[0].fbValueList.find({"fbValueList.rating":"Excellent"}).count()).count(), null, 2));
      resultList=new Array();
      result.map((tempresult)=>{
        console.log('----',tempresult);
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
          // fbValueList="'academicyear':" + request.query.academicyear +
          //         ",'dept':" + request.query.dept +
          //         ",'fname':" + request.query.fname +
          //         ",'fbResult':{'Total':"+ totalCount +
          //         ",'Excellent':"+ excellentCount +
          //         ",'Very Good':"+ verygoodCount +
          //         ",'Good':"+ goodCount +
          //         ",'Fair':"+ fairCount +
          //         ",'Avgscore':" + (scoreTotal/totalCount) +
          //       "}";

                resultList.push(
                    {
                        degree:tempresult.degree,
                        dept:tempresult.dept,
                        class:tempresult.class,
                        sem:tempresult.sem,
                        section:tempresult.section,
                        subname:tempresult.subname,
                        batch:tempresult.batch,
                        fbResult:{
                            total:totalCount,
                            excellent:excellentCount,
                            verygood:verygoodCount,
                            good:goodCount,
                            fair:fairCount,
                            avgscore:(scoreTotal/totalCount)
                        }
                    });
                //
          // response.json({status:true,mesg:fbValueList});
      });
      response.json({status:true,mesg:resultList});
    }
  });
});


/*
* Function to get fbResult
*/
router.post('/getfbresult', (request, response, next)=>{
  console.log(request.body);
fbresult.find(request.body,(error,result)=>
  {
      if(error){
        response.json({status:false,mesg:error.errmsg}); }
      else
      {
        if(result.length==0){
          response.json({status:false,mesg:"Data !Found"});}
        else{

        console.log(result[0].fbValueList);
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
      } }
  });
});

router.get('/downloadreport',(request,response)=>{
  response.download('reports/'+request.query.filename,(error)=>{

    if(error){
      console.log('----',error);
      response.json({status:false,mesg:error});
    }
    else{
      console.log('----download done');
    }
  })
});
module.exports = router;
