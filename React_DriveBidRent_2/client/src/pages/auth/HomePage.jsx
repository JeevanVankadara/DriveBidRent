import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { clearSuccess, clearError } from '../../redux/slices/authSlice';
import axiosInstance from '../../utils/axiosInstance.util';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';

const AestheticCar = ({ isMoving, isIdling }) => {
  return (
    <motion.div
      animate={(isMoving || isIdling) ? { y: [0, -3, 0] } : { y: 0 }}
      transition={{ repeat: Infinity, duration: isMoving ? 0.3 : 0.1, ease: 'linear' }}
      className="relative"
      style={{ width: '220px', height: '80px', pointerEvents: 'none' }}
    >
       <svg width="220" height="80" viewBox="0 0 220 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="10%">
              <stop offset="0%" stopColor="#ff8c00" />
              <stop offset="100%" stopColor="#e65c00" />
            </linearGradient>
            <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#333" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Shadow */}
          <ellipse cx="110" cy="74" rx="95" ry="6" fill="rgba(0,0,0,0.2)" />

          {/* Body */}
          <path d="M 20 66 L 205 66 C 215 66, 218 55, 218 50 C 218 45, 215 40, 205 38 C 180 32, 160 22, 140 18 C 120 14, 90 14, 70 20 C 50 26, 30 35, 18 45 C 15 50, 15 66, 20 66 Z" fill="url(#bodyGrad)" />
          
          {/* Lower grille/skirt */}
          <path d="M 20 66 L 205 66 C 210 66, 208 68, 205 68 L 20 68 Z" fill="#222" />

          {/* Window */}
          <path d="M 72 23 C 90 18, 115 18, 135 22 C 145 25, 150 32, 160 36 L 80 36 C 75 32, 72 28, 72 23 Z" fill="url(#glassGrad)" />

          {/* Headlight */}
          <path d="M 200 40 C 205 40, 215 42, 218 45 L 200 45 Z" fill="#fff9cc" filter="url(#glow)"/>

          {/* Taillight */}
          <path d="M 18 45 L 25 45 C 25 48, 25 50, 16 50 Z" fill="#ff0000" filter="url(#glow)"/>
          
          {/* Spoiler */}
          <path d="M 20 38 L 45 28 L 50 32 L 25 42 Z" fill="#111" />
       </svg>

       {/* Wheels */}
       {[35, 155].map((leftVal, i) => (
         <div key={i} style={{ position: 'absolute', bottom: 2, left: leftVal, width: 34, height: 34 }}>
             <motion.div
               style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#111', border: '4px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
               animate={isMoving ? { rotate: 360 } : { rotate: 0 }}
               transition={{ repeat: Infinity, duration: 0.35, ease: "linear" }}
             >
                <div style={{ width: '100%', height: '3px', backgroundColor: '#777' }} />
                <div style={{ width: '3px', height: '100%', backgroundColor: '#777', position: 'absolute' }} />
                <div style={{ width: '100%', height: '3px', backgroundColor: '#777', position: 'absolute', transform: 'rotate(45deg)' }} />
                <div style={{ width: '3px', height: '100%', backgroundColor: '#777', position: 'absolute', transform: 'rotate(45deg)' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff8c00', position: 'absolute' }} />
             </motion.div>
         </div>
       ))}

       {/* Dust */}
       <AnimatePresence>
         {isMoving && (
           <motion.div
             initial={{ opacity: 0, x: 0, scale: 0.5 }}
             animate={{ opacity: [0, 1, 0], x: -60, scale: 2.5 }}
             transition={{ repeat: Infinity, duration: 0.6 }}
             style={{ position: 'absolute', bottom: 10, left: -20, width: 12, height: 12, borderRadius: '50%', background: '#cbd5e1', filter: 'blur(2px)' }}
           />
         )}
       </AnimatePresence>
    </motion.div>
  );
};

const LoadingScreen = ({ loadingState }) => {
  const [sequenceStage, setSequenceStage] = useState(0); 

  useEffect(() => {
    if (loadingState === 'dispensing') {
       let t = [];
       // Stage 0: Car is already at 15vw (Left).
       t.push(setTimeout(() => setSequenceStage(1), 300));   // Drop Logo
       t.push(setTimeout(() => setSequenceStage(2), 1200));  // Drive to Center
       t.push(setTimeout(() => setSequenceStage(3), 2400));  // Drop Nav Links
       t.push(setTimeout(() => setSequenceStage(4), 3300));  // Drive to Right
       t.push(setTimeout(() => setSequenceStage(5), 4500));  // Drop Auth
       t.push(setTimeout(() => setSequenceStage(6), 5500));  // Leave
       
       return () => t.forEach(clearTimeout);
    }
  }, [loadingState]);

  const isMoving = sequenceStage === 2 || sequenceStage === 4 || sequenceStage === 6 || loadingState === 'drivingIn';
  const isIdling = !isMoving && sequenceStage < 6;

  let carLeft = '15vw'; // Start position during drivingIn and idling
  if (sequenceStage >= 2 && sequenceStage < 4) carLeft = '50vw';
  if (sequenceStage >= 4 && sequenceStage < 6) carLeft = '85vw';
  if (sequenceStage >= 6) carLeft = '150vw';

  const dispenseStageTarget = {
     0: 0,
     1: 1, // Logo visible
     2: 1, 
     3: 2, // Nav visible
     4: 2, 
     5: 3, // Auth visible
     6: 3, 
  }[sequenceStage] || 0;

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#f8fafc', zIndex: 9999, overflow: 'hidden' }}>
        <motion.div
           initial={{ left: '-50vw', top: '50%', x: '-50%', y: '-50%' }}
           animate={{
             left: carLeft
           }}
           transition={{ 
             duration: 1.2,
             ease: sequenceStage >= 6 ? "easeIn" : "easeInOut"
           }}
           style={{ position: 'absolute', zIndex: 100 }}
        >
           <AestheticCar isMoving={isMoving} isIdling={isIdling || loadingState === 'dispensing'} />

           {/* Hidden Stack INSIDE car */}
           <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', gap: '0px', pointerEvents: 'none' }}>
              {dispenseStageTarget < 1 && <motion.div layoutId="logo" style={{ opacity: 0, fontSize: '2rem' }}>DriveBidRent</motion.div>}
              {dispenseStageTarget < 2 && <motion.div layoutId="buy" style={{ opacity: 0 }}>Buy</motion.div>}
              {dispenseStageTarget < 2 && <motion.div layoutId="sell" style={{ opacity: 0 }}>Sell</motion.div>}
              {dispenseStageTarget < 2 && <motion.div layoutId="rent" style={{ opacity: 0 }}>Rent</motion.div>}
              {dispenseStageTarget < 2 && <motion.div layoutId="auction" style={{ opacity: 0 }}>Auction</motion.div>}
              {dispenseStageTarget < 3 && <motion.div layoutId="login" style={{ opacity: 0 }}>Login</motion.div>}
              {dispenseStageTarget < 3 && <motion.div layoutId="signup" style={{ opacity: 0 }}>Sign Up</motion.div>}
           </div>
        </motion.div>

        {/* Real Navbar Frame for dispensing */}
        <header className="navbar" style={{ boxShadow: 'none', background: 'transparent' }}>
           <div className="logo" style={{ width: '250px' }}>
             {dispenseStageTarget >= 1 && (
               <motion.div 
                 layoutId="logo" 
                 transition={{ type: "spring", stiffness: 100 }}
                 style={{ display: 'inline-block' }}
               >
                 DriveBidRent
               </motion.div>
             )}
           </div>

           <nav>
             <ul style={{ display: 'flex', gap: '35px', listStyle: 'none', margin: 0, padding: 0 }}>
               <li style={{ width: '45px', display: 'flex', justifyContent: 'center' }}>
                 {dispenseStageTarget >= 2 && <motion.div layoutId="buy" transition={{ type: "spring", stiffness: 100 }} style={{ fontSize: '1.3rem', fontWeight: 600, color: '#333333', whiteSpace: 'nowrap' }}>Buy</motion.div>}
               </li>
               <li style={{ width: '45px', display: 'flex', justifyContent: 'center' }}>
                 {dispenseStageTarget >= 2 && <motion.div layoutId="sell" transition={{ type: "spring", stiffness: 100 }} style={{ fontSize: '1.3rem', fontWeight: 600, color: '#333333', whiteSpace: 'nowrap' }}>Sell</motion.div>}
               </li>
               <li style={{ width: '55px', display: 'flex', justifyContent: 'center' }}>
                 {dispenseStageTarget >= 2 && <motion.div layoutId="rent" transition={{ type: "spring", stiffness: 100 }} style={{ fontSize: '1.3rem', fontWeight: 600, color: '#333333', whiteSpace: 'nowrap' }}>Rent</motion.div>}
               </li>
               <li style={{ width: '80px', display: 'flex', justifyContent: 'center' }}>
                 {dispenseStageTarget >= 2 && <motion.div layoutId="auction" transition={{ type: "spring", stiffness: 100 }} style={{ fontSize: '1.3rem', fontWeight: 600, color: '#333333', whiteSpace: 'nowrap' }}>Auction</motion.div>}
               </li>
             </ul>
           </nav>

           <div className="auth-buttons" style={{ display: 'flex', gap: '10px' }}>
              <div style={{ width: '80px', height: '40px' }}>
                 {dispenseStageTarget >= 3 && (
                   <motion.div layoutId="login" transition={{ type: "spring", stiffness: 100 }} style={{ padding: '8px 15px', border: '1px solid #ff6b00', color: '#ff6b00', borderRadius: '5px', fontWeight: 700, fontSize: '16px', display: 'inline-block' }}>
                     Login
                   </motion.div>
                 )}
              </div>
              <div style={{ width: '100px', height: '40px' }}>
                 {dispenseStageTarget >= 3 && (
                   <motion.div layoutId="signup" transition={{ type: "spring", stiffness: 100 }} style={{ padding: '8px 15px', background: '#ff6b00', color: 'white', borderRadius: '5px', fontWeight: 700, fontSize: '16px', display: 'inline-block' }}>
                     Sign Up
                   </motion.div>
                 )}
              </div>
           </div>
        </header>

        <AnimatePresence>
          {loadingState !== 'ready' && sequenceStage < 6 && (
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.3 }}
               style={{ position: 'absolute', bottom: '20%', left: '50%', transform: 'translateX(-50%)', fontFamily: '"Montserrat", sans-serif', color: '#ff6b00', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}
            >
               Preparing your experience...
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
};

const HomePage = () => {
  const [topRentals, setTopRentals] = useState([]);
  const [topAuctions, setTopAuctions] = useState([]);
  const [loadingState, setLoadingState] = useState('drivingIn');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { success, error } = useSelector((state) => state.auth);

  // Show logout success or other auth messages
  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(clearSuccess());
    }
  }, [success, dispatch]);

  // Show auth errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // show loginMessage once using toast
  useEffect(() => {
    const message = localStorage.getItem('loginMessage');
    if (message) {
      toast.error(message);
      localStorage.removeItem('loginMessage');
    }
  }, []);

  // fetch home data on mount
  useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      try {
        const response = await axiosInstance.get('/home/data');
        if (response?.data?.success) {
          setTopRentals(response.data.data.topRentals || []);
          setTopAuctions(response.data.data.topAuctions || []);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      }
    };

    const minDriveInTime = new Promise(resolve => setTimeout(resolve, 1500));
    
    Promise.all([fetchHomeData(), minDriveInTime]).then(() => {
      if (!isMounted) return;
      setLoadingState('dispensing');
      setTimeout(() => {
        if (!isMounted) return;
        setLoadingState('leaving');
        setTimeout(() => {
          if (!isMounted) return;
          setLoadingState('ready');
        }, 1200);
      }, 5500); // 5500ms allows the full staged cross-screen sequence
    });

    setTimeout(() => {
      if (isMounted) {
        setLoadingState((prev) => prev === 'drivingIn' ? 'idling' : prev);
      }
    }, 1500);

    return () => { isMounted = false; };
  }, []);

  const handleAuth = (path) => {
    navigate(path);
  };

  const isLoggedIn = () => {
    // Simple check - in full app, use a protected route or store
    return document.cookie.includes('jwt=');
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Montserrat", sans-serif;
        }
        body {
          background-color: #ffffff;
          color: #333333;
        }
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 15px 50px;
          box-shadow: 0px 2px 20px rgba(255, 107, 0, 0.2);
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 1000;
        }
        .logo {
          font-size: 2rem;
          font-weight: 800; /* Increased from bold to 800 */
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #ff6b00;
        }
        .navbar ul {
          list-style: none;
          display: flex;
          gap: 35px;
        }
        .navbar ul li {
          display: inline;
        }
        .navbar ul li a {
          text-decoration: none;
          color: #333333;
          font-size: 1.3rem;
          font-weight: 600; /* Increased from 500 to 600 */
          transition: color 0.3s ease, transform 0.3s ease;
          cursor: pointer;
        }
        .navbar ul li a:not(.settings-btn):hover {
          color: #ff6b00;
          transform: scale(1.1);
        }
        .auth-buttons {
          display: flex;
          gap: 10px;
          position: relative;
        }
        .auth-buttons button {
          padding: 8px 15px;
          border: 1px solid #ff6b00;
          cursor: pointer;
          font-size: 16px;
          font-weight: 700; /* Increased from bold to 700 */
          transition: all 0.3s ease;
          border-radius: 5px;
        }
        .login {
          background: white;
          color: #ff6b00;
        }
        .signup {
          background: #ff6b00;
          color: white;
        }
        .login:hover {
          background: #ff6b00;
          color: white;
        }
        .signup:hover {
          background: white;
          color: #ff6b00;
        }
        .hero {
          position: relative;
          height: 500px;
          text-align: left;
          margin-top: 60px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding-left: 50px;
        }
        .hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 0;
        }
        .hero-content {
          position: relative;
          z-index: 10;
          color: #333333;
          max-width: 600px;
        }
        .hero-content h1 {
          font-size: 3rem;
          font-weight: 800; /* Increased from bold to 800 */
          color: #ff6b00;
        }
        .hero-content p {
          font-size: 1.5rem;
          margin-top: 10px;
          color: #333333;
          font-weight: 500; /* Added font-weight */
        }
        .cta-btn {
          padding: 12px 24px;
          font-size: 1.2rem;
          font-weight: 700; /* Increased from bold to 700 */
          background: #ff6b00;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.3s ease;
          margin-top: 20px;
        }
        .cta-btn:hover {
          background: #e65c00;
          transform: scale(1.05);
        }
        .about {
          text-align: center;
          padding: 50px;
        }
        .about h2 {
          font-size: 28px;
          margin-bottom: 15px;
          color: #ff6b00;
          font-weight: 700; /* Added font-weight */
        }
        .about p {
          font-size: 18px;
          color: #666666;
          max-width: 800px;
          margin: auto;
          font-weight: 500; /* Added font-weight */
        }
        .join-us {
          text-align: center;
          padding: 50px;
          background: #f8f8f8;
        }
        .join-us h2 {
          font-size: 2rem;
          margin-bottom: 20px;
          font-weight: 700; /* Increased from bold to 700 */
          color: #ff6b00;
        }
        .join-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          max-width: 900px;
          margin: auto;
          justify-items: center;
        }
        .join-box {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          text-align: center;
          width: 100%;
          max-width: 300px;
        }
        .join-box:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 15px rgba(255, 107, 0, 0.2);
        }
        .join-box h3 {
          font-size: 1.4rem;
          margin: 10px 0;
          color: #ff6b00;
          font-weight: 600; /* Added font-weight */
        }
        .join-box p {
          font-size: 1rem;
          color: #666666;
          margin: 10px 0;
          font-weight: 500; /* Added font-weight */
        }
        .join-btn {
          padding: 10px 20px;
          font-size: 1rem;
          font-weight: 700; /* Increased from bold to 700 */
          color: white;
          background: #ff6b00;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s ease;
          margin-top: 10px;
        }
        .join-btn:hover {
          background: #e65c00;
        }
        .top-rentals {
          text-align: center;
          padding: 50px;
          background: #f8f8f8;
        }
        .top-rentals h2 {
          font-size: 2rem;
          margin-bottom: 20px;
          font-weight: 700; /* Increased from bold to 700 */
          color: #ff6b00;
        }
        .rental-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          max-width: 1200px;
          margin: auto;
        }
        .rental-box {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          text-align: center;
        }
        .rental-box:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 15px rgba(255, 107, 0, 0.2);
        }
        .rental-box img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 5px;
        }
        .rental-box h3 {
          font-size: 1.4rem;
          margin: 10px 0;
          color: #ff6b00;
          font-weight: 600; /* Added font-weight */
        }
        .rental-box p {
          font-size: 1.2rem;
          color: #333333;
          font-weight: 600; /* Increased from bold to 600 */
        }
        .rent-btn {
          display: inline-block;
          margin-top: 10px;
          padding: 10px 20px;
          font-size: 1rem;
          font-weight: 700; /* Increased from bold to 700 */
          color: white;
          background: #ff6b00;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        .rent-btn:hover {
          background: #e65c00;
        }
        .top-auctions {
          text-align: center;
          padding: 50px;
          background: #f8f8f8;
        }
        .top-auctions h2 {
          font-size: 2rem;
          margin-bottom: 20px;
          font-weight: 700; /* Increased from bold to 700 */
          color: #ff6b00;
        }
        .auction-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          max-width: 1200px;
          margin: auto;
        }
        .auction-box {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          text-align: center;
        }
        .auction-box:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 15px rgba(255, 107, 0, 0.2);
        }
        .auction-box img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 5px;
        }
        .auction-box h3 {
          font-size: 1.4rem;
          margin: 10px 0;
          color: #ff6b00;
          font-weight: 600; /* Added font-weight */
        }
        .auction-box p {
          font-size: 1.2rem;
          color: #333333;
          font-weight: 600; /* Increased from bold to 600 */
        }
        .bid-btn {
          display: inline-block;
          margin-top: 10px;
          padding: 10px 20px;
          font-size: 1rem;
          font-weight: 700; /* Increased from bold to 700 */
          color: white;
          background: #ff6b00;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        .bid-btn:hover {
          background: #e65c00;
        }
        .see-more-container {
          text-align: center;
          margin-top: 20px;
        }
        .see-more-btn {
          display: inline-block;
          padding: 10px 20px;
          font-size: 1rem;
          font-weight: 700; /* Increased from bold to 700 */
          color: white;
          background: #ff6b00;
          border: none;
          border-radius: 5px;
          text-decoration: none;
          transition: background 0.3s ease;
          cursor: pointer;
        }
        .see-more-btn:hover {
          background: #e65c00;
        }
        .vehicle-types {
          text-align: center;
          padding: 50px;
          background: #f8f8f8;
        }
        .vehicle-types h2 {
          font-size: 2rem;
          margin-bottom: 20px;
          font-weight: 700; /* Increased from bold to 700 */
          color: #ff6b00;
        }
        .vehicle-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          max-width: 1200px;
          margin: auto;
        }
        .vehicle-box {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          text-align: center;
          width: 100%;
          max-width: 300px;
        }
        .vehicle-box:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 15px rgba(255, 107, 0, 0.2);
        }
        .vehicle-box img {
          width: 100%;
          height: 120px;
          object-fit: contain;
          object-position: center;
          border-radius: 5px;
          background-color: white;
        }
        .vehicle-box h3 {
          font-size: 1.4rem;
          margin: 10px 0;
          color: #ff6b00;
          font-weight: 600; /* Added font-weight */
        }
        footer {
          margin-top: 80px;
          color: white;
          padding: 30px 10px;
          text-align: center;
          border-top: 3px solid #ff6b00;
          background-color: #333333;
        }
        .footerbox {
          display: flex;
          justify-content: space-evenly;
          flex-wrap: wrap;
          padding: 20px;
        }
        .footercontainer {
          width: 30%;
          min-width: 250px;
          text-align: left;
          padding: 10px;
        }
        .footercontainer h3 {
          border-bottom: 3px solid #ff6b00;
          display: inline-block;
          padding-bottom: 5px;
          margin-bottom: 15px;
          font-weight: 600; /* Added font-weight */
        }
        .footercontainer ul {
          list-style: none;
          padding: 0;
        }
        .footercontainer ul li {
          margin: 8px 0;
          font-weight: 500; /* Added font-weight */
        }
        .footercontainer ul li a {
          color: white;
          text-decoration: none;
          transition: 0.3s;
          font-weight: 500; /* Added font-weight */
        }
        .footercontainer ul li a:hover {
          color: #ff6b00;
          text-decoration: underline;
        }
        .footercontainer p {
          margin: 8px 0;
          font-weight: 500; /* Added font-weight */
        }
        .footercontainer a {
          color: white;
          text-decoration: none;
          font-weight: 500; /* Added font-weight */
        }
        .footercontainer a:hover {
          color: #ff6b00;
        }
        .soc-med-img {
          width: 35px;
          height: auto;
          margin: 0 8px;
          transition: transform 0.3s ease-in-out;
        }
        .soc-med-img:hover {
          transform: scale(1.2);
        }
        .social-icons {
          display: flex;
          gap: 15px;
          justify-content: left;
          margin-top: 10px;
        }
        .footer-copy {
          margin-top: 20px;
          font-size: 14px;
          opacity: 0.8;
          font-weight: 500; /* Added font-weight */
        }
      `}</style>

      {loadingState !== 'ready' ? (
        <LoadingScreen loadingState={loadingState} />
      ) : (
        <>
          <header className="navbar">
            <div className="logo">DriveBidRent</div>
            <nav>
              <ul>
                <li><a onClick={() => navigate('#auctions')}>Buy</a></li>
                <li><a onClick={() => navigate('#join-us')}>Sell</a></li>
                <li><a onClick={() => navigate('#rentals')}>Rent</a></li>
                <li><a onClick={() => navigate('#auctions')}>Auction</a></li>
              </ul>
            </nav>
            <div className="auth-buttons">
              <button className="login" onClick={() => handleAuth('/login')}>Login</button>
              <button className="signup" onClick={() => handleAuth('/signup')}>
                Sign Up
              </button>
            </div>
          </header>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <section className="hero">
              <img
                src="/css/photos/mainPhoto.png"
                alt="Car Banner"
                className="hero-img"
              />
              <div className="hero-content">
                <h1>Find the Perfect Car for You</h1>
                <p>Buy, Sell, Rent, and Auction vehicles with ease.</p>
              </div>
            </section>

      <section className="about">
        <h2>Welcome to DriveBidRent</h2>
        <p>
          This online platform is designed for the automotive market, enabling
          users to buy, sell, and auction vehicles with ease. It offers instant
          purchase options, live auctions, and a comprehensive car rental
          service—with the option for a professional driver.
        </p>
        <button className="cta-btn" onClick={() => handleAuth('/login')}>
          Explore Now
        </button>
      </section>

      <section className="vehicle-types">
        <h2>Vehicle Types</h2>
        <div className="vehicle-container">
          <div className="vehicle-box">
            <img src="/css/photos/images (1).jpeg" alt="Cars" />
            <h3>Cars</h3>
          </div>
          <div className="vehicle-box">
            <img src="/css/photos/images (2).jpeg" alt="Bikes" />
            <h3>Bikes</h3>
          </div>
          <div className="vehicle-box">
            <img
              src="https://www.bluebirdtravels.in/wp-content/uploads/2017/01/Tempo_Traveller_PI-1200x900-cropped.png"
              alt="Tempos"
            />
            <h3>Tempos</h3>
          </div>
        </div>
      </section>

      <section className="top-auctions" id="auctions">
        <h2>Top Auctions</h2>
        {topAuctions && topAuctions.length > 0 ? (
          <div className="auction-container">
            {topAuctions.map((auction) => (
              <div key={auction._id} className="auction-box">
                <img src={auction.vehicleImage} alt={auction.vehicleName} />
                <h3>{auction.vehicleName} ({auction.year})</h3>
                <p>Starting Bid: ₹{auction.startingBid.toLocaleString('en-IN')}</p>
                <button className="bid-btn" onClick={() => handleAuth('/login')}>
                  Place Bid
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No active auctions available at the moment.</p>
        )}
        <div className="see-more-container">
          <a className="see-more-btn" onClick={() => handleAuth('/login')}>
            See More Auctions
          </a>
        </div>
      </section>

      <section className="top-rentals" id="rentals">
        <h2>Top Rentals</h2>
        {topRentals && topRentals.length > 0 ? (
          <div className="rental-container">
            {topRentals.map((rental) => (
              <div key={rental._id} className="rental-box">
                <img src={rental.vehicleImage} alt={rental.vehicleName} />
                <h3>{rental.vehicleName} ({rental.year})</h3>
                <p>₹{rental.costPerDay.toLocaleString('en-IN')}/day</p>
                <button className="rent-btn" onClick={() => handleAuth('/login')}>
                  Rent Now
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No rentals available at the moment.</p>
        )}
        <div className="see-more-container">
          <a className="see-more-btn" onClick={() => handleAuth('/login')}>
            See More Rentals
          </a>
        </div>
      </section>

      <section className="join-us" id="join-us">
        <h2>Join Us Today</h2>
        <div className="join-container">
          <div className="join-box">
            <h3>Buyers</h3>
            <p>Find best deals on vehicles tailored to your needs.</p>
            <button className="join-btn" onClick={() => handleAuth('/signup')}>
              Join as Buyer
            </button>
          </div>
          <div className="join-box">
            <h3>Sellers</h3>
            <p>Sell your vehicles to a wide audience effortlessly.</p>
            <button className="join-btn" onClick={() => handleAuth('/signup')}>
              Join as Seller
            </button>
          </div>
          <div className="join-box">
            <h3>Mechanics</h3>
            <p>Offer your expertise to ensure vehicles are in top condition.</p>
            <button className="join-btn" onClick={() => handleAuth('/signup')}>
              Join as Mechanic
            </button>
          </div>
        </div>
      </section>

        <Footer />
          </motion.div>
        </>
      )}
    </>
  );
};

export default HomePage;