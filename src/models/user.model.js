// import express from "express";
// import mongoose from "mongoose";

// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";

// const userSchema = new mongoose.Schema(
//   {

//   username:
//   {
//     type : String,
//     // required:true,
//     unique:true,
//     lowercase:true,
//     trim:true,
//     index:true
//   },
//   email:
//   {
//     type :String,
//     // required:true,
//     unique:true,
//     lowercase:true,
//   },
//   password:
//   {
//     type :String,
//     // required:[true,"Password is required"]
//   },
//   fullname:
//   {
//     type :String,
//     // required:true,
//     index:true
//   },
//   // avatar:
//   // {
//   //   type :String,  /// cloud url
    
//   // },
//   coverImage:
//   {
//     type :String,
//   },
//   watchHistory:[
//     {
//     type: mongoose.Schema.Types.ObjectId ,
//     ref:"Video"
//     }
//   ],
//   refreshToken:
//   {
//     type:String
//   }



// },{timestamps:true})


// userSchema.pre("Save", async function(next) {
//   if (!this.isModified("password")) return next() ;
//   this.password = await bcrypt.hash(this.password,10)
//   next()
// })

// userSchema.methods.isPasswordCorrect = async function(password){
//   return await bcrypt.compare(password,this.password)
// }

// userSchema.methods.generateAccessToken = function(){
//   return jwt.sign(
//     {
//     _id :this._id,
//     email:this.email,
//     username:this.username,
//     fullname:this.fullname
//   },
//   process.env.ACCESS_TOKEN_SECRET,
//   {
//     expiresIn:process.env.ACCESS_TOKEN_EXPIRY
//   }
// )
// }
// userSchema.methods.generateRefreshToken = function(){
//   return jwt.sign(
//     {
//     _id :this._id,
    
//   },
//   process.env.REFRESH_TOKEN_SECRET,
//   {
//     expiresIn:process.env.REFRESH_TOKEN_EXPIRY
//   }
// )
// }

// export const User = mongoose.model("User",userSchema)

import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // Use bcryptjs instead of bcrypt

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    fullname: {
      type: String,
      index: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// Hash the password before saving the user (if password is modified)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash the password if it's modified
  this.password = await bcrypt.hash(this.password, 10); // Hash the password with 10 salt rounds
  next();
});

// Compare the provided password with the hashed password stored in the database
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password); // Compare the password with the stored hash
};

// Generate an access token for the user
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET, // Secret for signing the access token
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY, // Expiry time for the token
    }
  );
};

// Generate a refresh token for the user
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET, // Secret for signing the refresh token
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY, // Expiry time for the refresh token
    }
  );
};

export const User = mongoose.model("User", userSchema);
