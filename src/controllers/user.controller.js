
// // file name : user.controller.js

import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { response } from "express";
import jwt from "jsonwebtoken";

// Function to generate access and refresh tokens
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

// User registration function
const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  // Ensure all fields are provided
  if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Handle avatar and cover image
  let avatarLocalPath;
  let coverImageLocalPath;

  console.log('Request Body:', req.body);
  console.log('Uploaded Files:', req.files);

  if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
    avatarLocalPath = req.files.avatar[0].path;
  }

  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // Ensure avatar file is present
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Upload to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

  if (!avatar || !avatar.url) {
    throw new ApiError(400, "Avatar upload failed");
  }

  // Create user in the database
  const user = await User.create({
    fullName: fullname,
    avatar: avatar.url || "",
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(), // Optional: keep this if you want the username in lowercase
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
});

// User login function
const loginUser = asyncHandler(async (req, res) => {
  const { email, password, username } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  // Check if the password is correct
  const isPasswordValid = await user.isPasswordCorrect(password);
  console.log("Password entered: ", password);  // Log the password (debugging)

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid Password");
  }

  // Generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)  // Use accessToken here instead of string "accessToken"
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {
        user: loggedInUser,
        accessToken,
        refreshToken,
      }, "User Logged in successfully")
    );
});

// User logout function
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
    expires: new Date(0),
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
}
)


// Refresh access token function
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if(!incomingRefreshToken){
    throw new ApiError(400, "unauthorized request");
  }

try{
  const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  const user = await User.findById(decodedToken._id).select("-password -refreshToken");

  if(!user){
    throw new ApiError(401, "Invalid refresh token");
  }

  if(user?.refreshToken !== incomingRefreshToken){
    throw new ApiError(401, "Refresh token is expired or used");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };
  const {accessToken, newRefreshToken} = await
  generateAccessAndRefreshTokens(user._id)

  generateAccessAndRefreshTokens(user._id)
  return res.status(200)
  .cookie("accessToken", newRefreshToken, options)
  .json(
    new ApiResponse(
      200, 
      {accessToken,refreshToken:newRefreshToken},
      "Access token refreshed successfully"
    )
  )}catch(error){
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
  
})    


// change current user password

const changeCurrentPassword = asyncHandler(async(req,res) =>{
  const {oldPassword , newPassword,confPassword} = req.body;

  if(!(newPassword === confPassword)){
    throw new ApiError(400, "Passwords do not match");
  }

  const user = await User.findById(req.user._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if(!isPasswordCorrect){
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword 
  await user.save({validateBeforeSave:false})

  return res
  .status(200)
  .json(new ApiResponse(200,{},"Password changed successfully"))
})

// if user loggedin then give current user details

const getCurrentUser = asyncHandler(async(req,res)=>{

  return res
  .status(200)
  .json(new ApiResponse(200,req.user,"Current user fetched successfully"))
})


// update user account 

const updateUserAccount = asyncHandler(async(req,res) =>{

  const {fullname,email}= req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        fullname:fullname,
        email:email
      }
    },
    {
      new:true
    }
  ).select("-password")

  if(!fullname || !email){
    throw new ApiError(400, "All fields are required");

  }

  return res
  .status(200)
  .json(new ApiResponse(200,user,"User account updated successfully"))

})

// update user avatar

const updatUserAvatar = asyncHandler(async(req,res)=>{

  const avatarLocalPath = req.file?.avatar[0].path

  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  if(!avatar.url){
    throw new ApiError(400,"Error While uploading Avatar file on multer")
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        avatar:avatar.url
      }
    },
    {
      new:true
    }
  )
  return res
  .status(200)
  .json(new ApiResponse(200, user,"User avatar updated successfully"))
})

// update user cover image 

const updateUserCoverImage = asyncHandler(async(req,res)=>{

  const coverImageLocalPath = req.file?.coverImage[0].path

  if(!coverImageLocalPath){
    throw new ApiError(400,"Cover image is missing")
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!coverImage.url){
    throw new ApiError(400,"Error while uploading cover image on multer")
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        coverImage:coverImage.url
      }
    },
    {
      new:true
    }
  )
  return res
  .status(200)
  .json(new ApiResponse(200,user,"User cover image updated successfully"))
})



// get user channel profile

const getUserChannelProfile = asyncHandler(async(req,res)=>{
  const {username} = req.params;
  if(!username?.trim()){
    throw new ApiError(400,"Username is missing")
  }

  const channel = await User.aggregate([
    {
      $match:{
        username:username?.toLowerCase()
      }

    },
    {
      $lookup:{
        from:"sunscriptions",
        localField:"_id",
        foreignField:"channel",
        as:"subscribers"
      }
      
    },
    {
      $lookup:{
        from:"sunscriptions",
        localField:"_id",
        foreignField:"subscriber",
        as:"subscribedTO"
      }

    },
    {
      $addFields:{
        subscribersCount:{$size:"$subscribers"},
        channelSubscribedToCount:{$size:"$subscribedTO"}
      },
      isSubscribed:{
        $cond:{
          if:{$in:[req.user._id,"$subscribers.subscriber"]},
          then:true,
          else:false
        }

      }
    },

    {
      $project:{
        fullname:1,
        username:1,
        avatar:1,
        coverImage:1,
        subscribersCount:1,
        channelSubscribedToCount:1,
        email:1
      }
    }
    
  ])

  if(!channel?.length){
    throw new ApiError(404,"Channel not found")
  }

  return res
  .status(200)
  .json(new ApiResponse(200,channel[0],"Channel profile fetched successfully"))


})

// watch user history

const getWatchHistory = asyncHandler(async(req,res) =>{
  const user = await User.aggregate([
    {
      $match:{
        _id:new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup:{
        from :"videos",
        localField:"watchHistory",
        foreignField:_id,
        as : "watchHistory",
        pipeline:[
          {
            $lookup:{
              from :"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[{
                $project:{
                  fullname:1,
                  username:1,
                  avatar:1
                }
              }]
            }
          },
          {
            $addFields:{
              owner:{
                $first:"owner"
              }
            }
          }
        ]
      }
    },


  ])

  return res
  .status(200)
  .json(new ApiResponse(200,user[0].getWatchHistory,
    "watchHistory fetch successfully"
  ))
})


export
 { registerUser,
   loginUser, 
   logoutUser,
   refreshAccessToken,
   changeCurrentPassword,
   getCurrentUser,
   updatUserAvatar,
   updateUserAccount,
   updateUserCoverImage,
   getUserChannelProfile,
   getWatchHistory
  };