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
   firstname:String,
   lastname:String,
   address1:String,
   address2:String,
   city:String,
   state:String,
   zip:String,
   phone:Number,
   email:String,
   date:Date,
   location:String,
   lat:Number, 
   lng:Number, 
   numberOfSpots:Number, 
   price:Number, 
});


var parkingspot=mongoose.model("parkingspot",parkingspotSchema);

module.exports=parkingspot;