import express from "express";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

  username:{
    type : String,
    required:true,
  },
  email:{
    type :String,
    required:true
  },
  password:{
    type :String,
    required:true
  },
  fullname:{
    type :String,
    required:true
  },
  avatar:{
    type :String,
    required:true
  },
  coverImage:{
    type :String,
  },
  watchHistory:{
    type:mongoose.Types.PORT.ObjectId,
    ref:"Video"
  },
  refreshToken:{
    type:String
  }



},{timestamps:true})

export const User = mongoose.model("User",userSchema)