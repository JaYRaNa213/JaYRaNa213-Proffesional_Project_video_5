
// file name : user.controller.js

import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { response } from "express";


const generateAccessAndRefreshTokens = async(userId) => {

  try{

    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave : false});

    return {accessToken ,refreshToken};


  }catch(error){
    throw new ApiError(500,"Something went wrong while generating tokens");

  }
}


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

  // Log the received files for debugging
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

const loginUser = asyncHandler(async (req, res) =>{

  // algo
  // 1. request to data
  //2. cheack the credntials
  //3. find the user
  //4. generate the token
  ///5. send the response or send cookies
  const {email,password} = req.body;

  if(!email || ! password){
    throw new ApiError(400,"Email and password are required");
  }

  User.findOne({
    $or:[{email},{username}]
  })  // find the user

  if (!user){
    throw new ApiError(400,"User not found");
  }

  // check the password
  const isPasswordValid= await user.isPasswordCorrect(password);

  if(!isPasswordValid){
    throw new ApiError(400,"Invalid Password");
  }

  const {accessToken , refreshToken} = await generateAccessAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).
  select("-password -refreshToken");

  const options = {
    httpOnly:true,
    secure:true,
    
  }

  return response.status(200).cookie("accessToken","accessToken",options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(200,{
      user : loggedInUser, accessToken,refreshToken}
      ,"User Logged in successfully"
    )
  )



})


const logoutUser = asyncHandler(async(req,res) =>{

  User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )
  const options = {
    httpOnly:true,
    secure:true,
    expires:new Date(0)
  }

  return response
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"User logged out successfully"))

})

export { registerUser ,loginUser,logoutUser};