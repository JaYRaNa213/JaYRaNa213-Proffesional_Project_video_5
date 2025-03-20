import {ApiError} from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {User} from "../models/user.model.js"

const registerUser = asyncHandler(async (req,res) =>{

  // get user details from frontend
  // validation - not empty
  // check if user already exists: user name or email
  // check for avatar, check for image
  // upload them to cloudinary , avatar

  // create  user object = create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return response


  const {fullname,email,username,password} =req.body
  console.log("email : ");

  // if(fullname === ""){
  //   throw new ApiError(400,"full name is required")
  // }
  // or


  if([fullname,email,username,password].some((field) =>field?.trim() == "")){
    throw new ApiError(400,"All fields are required")
  }

  const existedUser = User.findOne({
    $or:[{ username },{ email },{}]
  })

  if (existedUser){
    throw new ApiError(409,"User with email or username already exists")
  }

  const avatarLocalPath = req.files?.avatar[0]?.path
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if(!avatarLocalPath){
    
  }
throw new ApiError(400,"Avatar file is required")
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!avatar){
    throw new ApiError(400,"Avatar file is required")
  }

  const user = await User.create({
    fullname,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    eamil,
    password,
    username:username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser){
    throw new ApiError(500,"SOMETHING WENT WRONG WHILE REGISTERING THE USER")
  }


    
  
  
})

export {registerUser}