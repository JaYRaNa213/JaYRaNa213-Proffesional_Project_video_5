// using promises 



// const asyncHandler = (requestHandler) =>{
//   return (req,res,next) => {
//     Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err))
//   }
// }
// export default asyncHandler;

// for simple 
// export { asyncHandler};


//for understand higher order function
  
// const asyncHandler =  () =>{} 
// const asyncHandler = (func) => () =>{} 
// const asyncHandler = (fn) => async() =>{} 



//  using try - catch 

// const asyncHandler = (fn) => async(req,res,next) =>{
//   try{
//     await fn(req,res,next)

//   }catch(error){
//     res.status(err.code || 500).json({
//       success: false,
//       message:err.message
//     })

//   }
// } // higher order function

// Async handler to wrap async functions and handle errors


const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next); // Await the async function (your route handler)
  } catch (error) {
    console.error(error); // Log the error for debugging
    // Respond with a formatted error message
    res.status(error.code || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export default asyncHandler;
