import express from "express";
import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({

  videofile:{
    type : String,
    required:true,
  },
  thumbnail:{
    type :String,
    
  },
  owner:{
    type :mongoose.Types.ObjectId,
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
    
  },
  isPublished:{
    type :boolean,
  },
  description:{
    type :Sting,
    
  }



},{timestamps:true})

export const Video = mongoose.model("Video",videoSchema)