// import { ApiError } from "../utils/ApiError.js";
// import  asyncHandler  from "../utils/asyncHandler.js";
// import jwt from "jsonwebtoken"
// import { User } from "../models/user.model.js";

// export const verifyJWT = asyncHandler(async(req, _, next) => {
//     try {
//         const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
//         // console.log(token);
//         if (!token) {
//             throw new ApiError(401, "Unauthorized request")
//         }
    
//         const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
//         const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
//         if (!user) {
            
//             throw new ApiError(401, "Invalid Access Token")
//         }
    
//         req.user = user;
//         next()
//     } catch (error) {
//         throw new ApiError(401, error?.message || "Invalid access token")
//     }
    
// })

import { ApiError } from "../utils/ApiError.js"; // Assuming your custom error class
import { User } from "../models/user.model.js"; // User model
import jwt from "jsonwebtoken"; // JWT library

// Async handler will wrap the function and handle errors
import asyncHandler from "../utils/asyncHandler.js";

// Middleware function to verify JWT
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
    // If no token is found, throw an error
    if (!token) {
      throw new ApiError(401, "Unauthorized request: Token not provided");
    }
    
    // Verify token using JWT secret from environment variables
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    // Find user by ID decoded from the token
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
    // If user is not found, throw an error
    if (!user) {
      throw new ApiError(401, "Invalid Access Token: User not found");
    }

    // Attach the user to the request object
    req.user = user;
    next();
  } catch (error) {
    // If any error occurs, pass it to the next middleware for handling
    next(error);
  }
});
