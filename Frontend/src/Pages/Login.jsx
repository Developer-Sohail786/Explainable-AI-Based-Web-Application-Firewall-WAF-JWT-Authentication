import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import axiosPrivate from "../utils/axiosPrivate";
import { endpoints } from "../utils/api";
const Login = () => {
  const navigate = useNavigate();
  const [serverError, setserverError] = useState("");
  // const {setAuth}=useAuth() milestone13
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();
  // const onSubmit = async (data) => {
  //   setserverError("");
  //   try {
  //     const response = await axiosPrivate.post(endpoints.login, {
  //       email: data.email,
  //       password: data.password,
  //     });

  //     navigate("/dashboard");
  //   } catch (error) {
  //     console.error("Error:", error.response?.data);
  //     if (error.response?.status === 404) {
  //       setserverError("User Not found. Registr first.");
  //     } else if (error.response?.status === 401) {
  //       setserverError("Incorrect password. Try again");
  //     } else {
  //       setserverError("Internal server error");
  //     }
  //   }
  // };

  const onSubmit = async (data) => {

  setserverError("");

  try {

    const response = await axiosPrivate.post(
      endpoints.login,
      {
        email: data.email,
        password: data.password,
      }
    );

    console.log(response.data);

    navigate("/dashboard");

  } catch (error) {

    console.error(
      "Error:",
      error.response?.data
    );

    // AI WAF Block
    if (
      error.response?.status === 403 &&
      error.response?.data?.blocked
    ) {

      setserverError(
        `Blocked by AI WAF (${error.response.data.attackType.toUpperCase()})`
      );

    }

    // Normal errors

    else if (
      error.response?.status === 404
    ) {

      setserverError(
        "User not found."
      );

    }

    else if (
      error.response?.status === 401
    ) {

      setserverError(
        "Incorrect password."
      );

    }

    else {

      setserverError(
        "Internal server error."
      );

    }

  }

};
  return (

  <div className="min-h-screen flex items-center justify-center bg-slate-200 px-4">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800">Login</h1>
        <p className="text-gray-500 mt-2 text-sm">
          Login to access your account
        </p>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="bg-red-100 text-red-600 text-sm p-3 rounded-md mt-4 text-center">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">

        <div>
          <label className="text-sm font-medium text-gray-600">Email</label>
          <input
            className="mt-1 w-full h-11 border border-gray-300 rounded-lg px-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Enter your email"
            {...register("email", {
              required: { value: true, message: "Field can't be empty" },
              //  pattern: {
              //     value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              //     message: "Invalid email format",
              //   },
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Password</label>
          <input
            className="mt-1 w-full h-11 border border-gray-300 rounded-lg px-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="password"
            placeholder="Enter your password"
        {...register("password")}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full h-11 rounded-lg font-semibold transition ${
            isSubmitting
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Login"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        New user?{" "}
        <Link
          to="/register"
          className="text-blue-600 font-medium hover:underline"
        >
          Register here
        </Link>
      </p>
    </div>
  </div>
);

};

export default Login;
