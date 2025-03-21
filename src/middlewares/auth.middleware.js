
// file name : auth.middleware.js
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async(req , _ ,next) =>{

try{
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace(Bearer,"");

  if(!req.token){
    throw new ApiError(401,"Unauthorized request");

  }

  const decodedToken = Jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

  const user = await User.findById(decodedToken?._id)
  .select("-password -refreshToken")

  if(!user){
    // next_video: disscuss about frontend
    throw new ApiError(401,"Invalid Access Token");


  }

  req.user = user;
  next();
}catch(error){
  throw new ApiError(401,error?.message || "Invalid Access Token");
}
})