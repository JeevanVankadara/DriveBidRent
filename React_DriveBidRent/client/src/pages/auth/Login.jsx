// client/src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authServices } from '../../services/auth.services';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authServices.login({ email, password });
      console.log('=== LOGIN RESPONSE ===');
      console.log('Full response:', response);
      console.log('response.success:', response.success);
      console.log('response.redirect:', response.redirect);
      console.log('response.user:', response.user);
      console.log('response.user.approved_status:', response.user?.approved_status);
      console.log('=== END RESPONSE ===');

      if (response.success) {
        setSuccess('Login Successful! Redirecting...');

        // Backend now returns { success, message, redirect, user }
        const redirectUrl = response.redirect || '/';
        const loggedUser = response.user || {};

        console.log('Parsed redirectUrl:', redirectUrl);
        console.log('Parsed loggedUser:', loggedUser);

        // If mechanic is not approved, show approval modal and do not redirect
        // Only block if userType is 'mechanic' AND status is not 'Yes' (i.e., is 'No' or missing)
        if (loggedUser.userType === 'mechanic' && loggedUser.approved_status !== 'Yes') {
          console.log('BLOCKING: Mechanic not approved');
          console.log('userType:', loggedUser.userType);
          console.log('approved_status:', loggedUser.approved_status);
          setShowApprovalModal(true);
          setLoading(false);
          return;
        }
        
        console.log('ALLOWING: User approved or not mechanic, proceeding to redirect');

        // Normalize known legacy redirect paths (server may still return old strings if not restarted)
        let finalRedirect = redirectUrl || '/';
        if (finalRedirect.includes('mechanic-dashboard')) {
          finalRedirect = finalRedirect.replace('mechanic-dashboard', 'mechanic/dashboard');
        }

        console.log('Final redirect URL:', finalRedirect);

        setTimeout(() => {
          console.log('Navigating to:', finalRedirect);
          navigate(finalRedirect, { replace: true });
        }, 1000);
      } else {
        console.log('Login failed with message:', response.message);
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('=== LOGIN ERROR ===');
      console.error('Login error:', err);
      console.error('Full error object:', JSON.stringify(err, null, 2));
      console.error('err.response:', err.response);
      console.error('err.response?.data:', err.response?.data);
      console.error('=== END ERROR ===');
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Clear messages when user starts typing
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setError('');
    setSuccess('');
  };

  return (
    <>
      <style>{`
        .container {
          max-width: 400px;
          margin: 50px auto;
          padding: 20px;
        }
        .form-container {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .form-title {
          text-align: center;
          margin-bottom: 20px;
          color: #333;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
        }
        .input-group {
          position: relative;
          margin-bottom: 10px;
        }
        .input-group i {
          position: absolute;
          left: 15px;
          top: 15px;
          color: #777;
        }
        .input-group input {
          padding-left: 40px;
          width: 100%;
          height: 45px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
          box-sizing: border-box;
        }
        .input-group input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
        }
        .btn {
          width: 100%;
          padding: 12px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.2s;
        }
        .btn:hover:not(:disabled) {
          background: #0069d9;
        }
        .btn:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .divider {
          text-align: center;
          margin: 20px 0;
          position: relative;
        }
        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #ddd;
        }
        .divider span {
          background: white;
          padding: 0 10px;
          color: #666;
          position: relative;
          z-index: 1;
        }
        .social-login {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .btn-social {
          background: #f8f9fa;
          color: #333;
          border: 1px solid #ddd;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background-color 0.2s;
        }
        .btn-social:hover {
          background: #e9ecef;
        }
        .login-link {
          text-align: center;
          margin-top: 20px;
          color: #666;
        }
        .login-link a {
          color: #007bff;
          text-decoration: none;
        }
        .login-link a:hover {
          text-decoration: underline;
        }
        .loading {
          opacity: 0.7;
          pointer-events: none;
        }
        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
          border: 1px solid #f5c6cb;
        }
        .success-message {
          background-color: #d4edda;
          color: #155724;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
          border: 1px solid #c3e6cb;
        }
      `}</style>

      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Account Pending Approval</h2>
            <p className="mb-4">Your account is pending admin approval. Please wait until an administrator approves your mechanic account.</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 bg-gray-200 rounded mr-2"
              >
                Close
              </button>
              <button
                onClick={() => { setShowApprovalModal(false); navigate('/'); }}
                className="px-4 py-2 bg-orange-600 text-white rounded"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        <div className="form-container">
          <h1 className="form-title">Login to Your Account</h1>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className={loading ? 'loading' : ''}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-group">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleInputChange(setEmail)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-group">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={handleInputChange(setPassword)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>

            <div className="divider">
              <span>OR</span>
            </div>

            <div className="social-login">
              <button type="button" className="btn btn-social btn-google">
                <i className="fab fa-google"></i> Login with Google
              </button>
              <button type="button" className="btn btn-social btn-facebook">
                <i className="fab fa-facebook-f"></i> Login with Facebook
              </button>
            </div>

            <div className="login-link">
              Don't have an account? <a href="/signup">Sign up</a>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;