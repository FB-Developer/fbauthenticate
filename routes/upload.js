var express = require('express');
var router = express.Router();
var multer	=	require('multer');
const userModel=require('../model/user');
var mongoxlsx = require('../lib/mongo-xlsx');
var xlsxFile='studentlist.xlsx';
var model=null;


//userId:{type:String,unique:true},
//    password:String,
//    userRole:String,
//    userName:String,
//    facultydetail:{
//        dept:String
//    },
//    studentdetail:{
//      academicyear:String,
//      degree:String,
//      dept:String,
//      sem:String,
//      class:String,
//      batch:String,
//      completed:Boolean
//    }




var storage	=	multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './UploadedFile');
  },
  filename: function (req, file, callback) {
	callback(null, xlsxFile);
  }
});
var upload = multer({ storage : storage}).single('file');

router.post('/',function(req,res){
	upload(req,res,function(err) {
		if(err) {
          console.log('----',err);
        }
        else{

        mongoxlsx.xlsx2MongoData('./UploadedFile/'+xlsxFile, model, function(err, data) {
            let errorFlag=false;
            let errorMesg;
          for (dt of data) {
            console.log('----',dt);
                var user=new userModel();
              user.userId=dt.userId;
              user.userName=dt.userName;
              user.userRole='student';
                  user.password=dt.userId;
              user.studentdetail={
                  academicyear:dt.academicyear,
                  degree:dt.degree,
                  dept:dt.dept,
                  sem:dt.sem,
                  class:dt.class,
                  batch:dt.batch,
                  completed:false
              };
              user.save((error)=>{
                        if(error)
                        {
                            errorFlag=true;
                            errorMesg=error.errmesg;
                        }
                        else{
                        }
                    });
          }
          if(!errorFlag)
          {
                return res.json({'success':true,'mesg':"File is uploaded successfully!"});
          }
           else
           {
                return res.json({'success':false,'mesg':errorMesg});
           }
          });
        }
	});
});
module.exports = router;
