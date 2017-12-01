var mongoose=require("mongoose");
mongoose.Promise=global.Promise;


var parkingspotSchema=new mongoose.Schema({
   author:{
      id:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"user"
      },
      name:String
   },
   address:String,
   image:String,
   location:String,
   lat:Number,
   lng:Number,
   createdAt: { type: Date, default: Date.now },
   booked:{type:Boolean,default:false},
   numberOfSpots:Number,
   price:Number,
   description:String,
});


var parkingspot=mongoose.model("parkingspot",parkingspotSchema);

module.exports=parkingspot;