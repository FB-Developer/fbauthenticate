var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');
const jwt= require('jsonwebtoken');
const config = require('../config');
const userModel=require('../model/user');
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express Test' });
});

router.post('/login',(request,response,next)=>{
  console.log(request.body);
  userModel.findOne({userId:request.body.userId},(error,result)=>{
        if(error){
          response.status(400).json({success:false,mesg:'Error Processing Request'+error});
        }
        if(!result){
          response.status(201).json({success:false,mesg:'user !exists'});
        }
        else if(result){
          result.comparePassword(request.body.password,(error,ismatch)=>{
            if(ismatch&&!error)
            {
                var crendential=jwt.sign({'userId':result.userId},config.jwtsecret,{
                  expiresIn:config.timeout
                });
                var userdetail;
                console.log(result);
                if(result.userRole=='student')
                    userdetail=result.studentdetail;
                else if(result.userRole=='faculty')
                        userdetail=result.facultydetail;
                else
                    userdetail=result.userdetail;
                response.status(201).json({
                  success:true,mesg:{'userId':result.userId,
                                    'userName':result.userName,
                                    'userRole':result.userRole,
                                    'userDetail':userdetail},
                            crendential:crendential
                });
            }
            else{
              response.status(201).json({success:false,mesg:'Incorrect Login credential'});
            }
          });
  }});
});
module.exports = router;
