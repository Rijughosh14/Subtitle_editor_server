const Mongoose=require('mongoose')


//schema for form
const DataSchema= new Mongoose.Schema(
    {
        VideoUrl:String,
        VttUrl:String
    },
    { collection: 'VideoDetails' }
)

const dataModel=Mongoose.model('VideoDetails',DataSchema)


module.exports={dataModel}
