var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');
const jwt= require('jsonwebtoken');
const config = require('../config');
const userModel=require('../model/user');
const fbdetail=require('../model/faculty');
const fbresult=require('../model/fbresultdetail');




/*
* Function to get overall results
* @params: academic year & fdept
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
        if(error)
          response.json(error);
        response.json(result);
      });
});


router.get('/',(request,response,next)=>{

    fbresult.find({academicyear: request.query.academicyear,fdept:request.query.dept,fname:request.query.fname},
  (error,result)=>{
    console.log(result);
    if(error)
      response.json({status:false,mesg:error.errmsg});
    else
    {
      var fbValueList = 0;
      if(result.length==0){}
        fbValueList = "Data !Found";
      //console.log(result[0].fbValueList);
      // console.log(JSON.stringify(result[0].fbValueList.find({"fbValueList.rating":"Excellent"}).count()).count(), null, 2));
      result.map((tempresult)=>{
        //console.log(tempresult);
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
          fbValueList="'academicyear':" + request.query.academicyear +
                  ",'dept':" + request.query.dept +
                  ",'fname':" + request.query.fname +
                  ",'fbResult':{'Total':"+ totalCount +
                  ",'Excellent':"+ excellentCount +
                  ",'Very Good':"+ verygoodCount +
                  ",'Good':"+ goodCount +
                  ",'Fair':"+ fairCount +
                  ",'Avgscore':" + (scoreTotal/totalCount) +
                "}";
          //response.json({status:true,mesg:fbValueList});
      });
      response.json({status:true,mesg:fbValueList});
    }
  });
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
module.exports = router;
