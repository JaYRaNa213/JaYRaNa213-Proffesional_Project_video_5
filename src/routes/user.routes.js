// file name : userRouter.js

import { Router } from "express";
import { registerUser, } from "../controllers/user.controller.js";
import { loginUser,logoutUser,refreshAccessToken} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js"

const router = Router()

// Route to handle user registration with file uploads


router.route('/register').post(
  upload.fields([
    {
      name: 'avatar',
      maxCount: 1,  // Limit to 1 file for 'avatar'
    },
    {
      name: 'coverImages',
      maxCount: 1,  // Limit to 3 files for 'coverImages'
    },
  ]),
  registerUser // Call the registerUser controller after files are uploaded
)



// Route to handle user login

router.route('/login').post(loginUser)

// secured routes for logout

router.route('/logout').post(verifyJWT,logoutUser)

// secured routes for refresh token
router.route('/refresh').post(refreshAccessToken)



export default router;
