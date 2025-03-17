

// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import mongoose, { connect } from "mongoose";
import {DB_name} from "../constants.js";
import connectDB from "./db/index.js";

dotenv.config({
  path: './.env'
})

connectDB()
.then(() => {
  app.listen(process.env.PORT || 8000 ,() => {
    console.log(`server is running at port ${process.env.PORT}`);
  })
})
.catch((err) => {
  console.log("Mongo db connection failed !!! :",err);
})

















// first appproch to data connection this approch is not good for big project because index.js may be very complex

/*

import express from "express";
const app = express()

// function connectDB(){}

// connectDB()

// or




;(async () => {

  try{
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_name}`)

    app.on("error", () => {
      console.log("ERROR ",error);
      throw error
    })

    app.listen(process.env.PORT, () => {
      console.log(`App is listening on port ${process.env.PORT}`);
    })

  } catch{
    console.error("ERROR :",error)
    throw err
  }
})()

*/