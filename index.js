const express=require ('express');
const app=express();
const cors=require('cors')
const dotenv=require('dotenv').config()
const multer = require('multer');
var fs = require('fs');
 const { uploadCloudinary } = require('./utilities/Cloudinary.js');
const path = require('path');
const Mongoose=require('mongoose');

Mongoose.connect(process.env.DB_URL)


const Vtt = require('vtt-creator');
const { dataModel } = require('./model/DataModel.js');

//cors  config
app.use(cors({origin:true,credentials:true}))


//express json
app.use(express.json())

//videos
app.use('/uploads',express.static("server/uploads/Video"));   

//video uploads 
const storage=multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'uploads/Video')
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+file.originalname) 
    }
})

const upload=multer({storage})
app.post('/videoUpload',upload.single('file'),async(req,res)=>{ 
    const file=req.file
    try {
      const response= await uploadCloudinary(file.path) 
      res.status(200).json(response)
    } catch (error) {
      console.log(error)
    }
})

//converting string time to seconds
 const stringToTime=(timeString)=> {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);

  //  time format (hours, minutes, seconds)
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  return totalSeconds;
}

//converting object to vtt content

const ObjToVtt=(files)=>{

  const v=new Vtt()

  files.forEach((d)=>{
    v.add(stringToTime(d.start),stringToTime(d.end),d.caption)
  })
  console.log(v.toString())
  return v.toString()
}



//uploading vtt file
app.post('/vttUpload',async(req,res)=>{

  const{file}=req.body
  const FinalPath="/uploads/vtt"+Date.now()+".vtt"
  const pathName=path.join(__dirname,FinalPath)
  const vttString=ObjToVtt(file)

  if(vttString){
    fs.writeFile(pathName,vttString,(err)=>{
      if(err)throw err
    })
  
    try {
      const vttResponse=await uploadCloudinary(pathName)
      res.status(200).json(vttResponse)    
    } catch (error) {
      console.log(error)
    }
  }
})

app.post('/uploadData',(req,res)=>{
  const {VideoUrl,VttUrl}=req.body
  dataModel.create({
    VideoUrl,
    VttUrl
  })
  .then(()=>{
    res.json("successfully uploaded")
  })
})

app.get('/getuploadData',(req,res)=>{
  dataModel.find()
  .then(result=>{
    res.json(result)
  })
  .catch(err=>{
    console.log(err)
  })
})

app.post('/updateData',(req,res)=>{
  const {VideoUrl,VttUrl}=req.body
  dataModel.findOneAndUpdate({VideoUrl},{VttUrl})
  .then(result=>{
    res.json("update successfull")
  })
  .catch(err=>{
    console.log(err)
  })
})





//urlencoded
 app.use(express.urlencoded({extended:false}));

 app.listen(process.env.PORT,()=>{
    console.log("port=3000")
 })