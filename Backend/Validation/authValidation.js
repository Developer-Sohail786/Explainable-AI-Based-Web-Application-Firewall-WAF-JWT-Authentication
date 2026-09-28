// import Joi from "joi";

// //  Register Validation Schema
// export const registerSchema = Joi.object({
//   name: Joi.string().required(),
//   email: Joi.string().required(),
//   password: Joi.string().required()
// }).unknown(true);


// // Login Validation Schema
// export const loginSchema = Joi.object({
//   email: Joi.string().email().required().messages({
//     "string.email": "Invalid email format",
//   }),
//   password: Joi.string().min(8).required().messages({
//     "string.min": "Password must be at least 8 characters",
//   }),
// });
