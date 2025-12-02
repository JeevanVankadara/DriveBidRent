// client/src/pages/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authServices } from "../../services/auth.services";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await authServices.login({ email, password });

      const payload = response?.data ?? response;
      const inner = payload?.data ?? payload;

      if (payload.success) {
        setSuccess("Login Successful! Redirecting...");

        const redirectUrl = inner?.redirectUrl ?? payload?.redirectUrl ?? "/";
        const loggedUser = inner?.user ?? payload?.user ?? {};

        if (loggedUser.userType === "mechanic" && loggedUser.approved_status !== "Yes") {
          setShowApprovalModal(true);
          setLoading(false);
          return;
        }

        let finalRedirect = redirectUrl;
        if (finalRedirect.includes("mechanic-dashboard"))
          finalRedirect = "/mechanic/dashboard";

        if (finalRedirect === "/buyer-dashboard") finalRedirect = "/buyer";
        if (finalRedirect === "/auctionmanager-dashboard") finalRedirect = "/auctionmanager";

        if ((!redirectUrl || redirectUrl === "/") && loggedUser?.userType) {
          const map = {
            buyer: "/buyer",
            seller: "/seller",
            driver: "/driver-dashboard",
            mechanic: "/mechanic/dashboard",
            admin: "/admin/dashboard",
            auction_manager: "/auctionmanager",
          };
          finalRedirect = map[loggedUser.userType] || "/";
        }

        setTimeout(() => {
          navigate(finalRedirect, { replace: true });
        }, 800);
      } else {
        setError(payload.message || "Login failed");
      }
    } catch (err) {
      if (err.response?.data?.message) setError(err.response.data.message);
      else if (err.request) setError("Network error. Check your connection.");
      else setError("Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
      />

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Account Pending Approval
            </h2>
            <p className="text-gray-600 mb-6">
              Your mechanic account is pending admin approval. Please wait until it is approved.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  navigate("/");
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Login UI */}
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Login to Your Account
          </h1>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded text-center mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 text-green-700 p-3 rounded text-center mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Email Address
              </label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-3 top-3 text-gray-500"></i>
                <input
                  type="email"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Password
              </label>
              <div className="relative">
                <i className="fas fa-lock absolute left-3 top-3 text-gray-500"></i>
                <input
                  type="password"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white rounded-lg text-lg font-semibold transition 
              ${loading ? "bg-gray-400" : "bg-orange-600 hover:bg-orange-700"}`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Divider */}
            <div className="flex items-center mt-4 mb-2">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-3 text-gray-500">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Social Login */}
            <div className="space-y-3">
              <button
                type="button"
                className="w-full py-2 bg-gray-100 border rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200"
              >
                <i className="fab fa-google text-red-500"></i> Login with Google
              </button>

              <button
                type="button"
                className="w-full py-2 bg-gray-100 border rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200"
              >
                <i className="fab fa-facebook text-blue-600"></i> Login with Facebook
              </button>
            </div>

            <p className="text-center text-sm text-gray-600 mt-4">
              Don't have an account?{" "}
              <a href="/signup" className="text-orange-600 font-medium hover:underline">
                Sign up
              </a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
