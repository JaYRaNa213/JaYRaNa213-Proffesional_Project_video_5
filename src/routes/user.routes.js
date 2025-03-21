// import { Router } from "express";
// import { registerUser } from "../controllers/user.controller.js";

// import {upload} from "../middlewares/multer.middleware.js"
// const userRouter = Router()

// userRouter.route("/register").post(
//   upload.fields([
//     {
//       name:"avatar",
//       maxCount:1
//     },
//     {
//       name:"coverImages",
//       maxcount:3
//     }

//   ]),
  
//   registerUser)
// // userRouter.route("/login").post(loginUser)
// // userRouter.route("/login").post(loginUser)
// export default userRouter

// userRouter.js
import { Router } from 'express';
import { registerUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const userRouter = Router();

// Route to handle user registration with file uploads
userRouter.route('/register').post(
  upload.fields([
    {
      name: 'avatar',
      maxCount: 1,  // Limit to 1 file for 'avatar'
    },
    {
      name: 'coverImages',
      maxCount: 3,  // Limit to 3 files for 'coverImages'
    },
  ]),
  registerUser // Call the registerUser controller after files are uploaded
);

// Optionally, other routes like login could go here:
// userRouter.route("/login").post(loginUser);

export default userRouter;
