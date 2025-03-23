import express from "express";
import mongoose from "mongoose";

const likeSchema = new mongoose.Schema
(
  {
    tweet:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Tweet"
    },
    
    tweet:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tweet"
    },

    
    likedBy:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User"
    }

},
{timestamps:true}

)

export const Like = mongoose.model("Like",likeSchema)