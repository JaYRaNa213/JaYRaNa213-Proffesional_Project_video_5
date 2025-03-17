import express from "express";
import mongoose from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";



const videoSchema = new mongoose.Schema({

  videofile:{
    type : String, // cloudnary url
    required:true,
  },
  thumbnail:{
    type :String,
    required: true
    
  },
  owner:{
    type :mongoose.Schema.Types.ObjectId,
    ref:"User"
    
  },
  title:{
    type :String,
    required:true
  },
  duration:{
    type :number,
    required:true
  },
  views:{
    type :number,
    default:0
    
  },
  isPublished:{
    type :boolean,
    default:true
  },
  description:{
    type :Sting,
    
  }



},{timestamps:true})


videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video",videoSchema)