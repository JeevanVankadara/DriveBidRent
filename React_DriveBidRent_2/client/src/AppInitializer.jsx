import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from './redux/slices/authSlice';
import App from './App';


function AppInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Restore auth state from localStorage on app initialization
    const savedAuthState = localStorage.getItem('authState');
    if (savedAuthState) {
      try {
        const authData = JSON.parse(savedAuthState);
        dispatch(setUser(authData.user));
      } catch (err) {
        console.error('Failed to restore auth state:', err);
      }
    }
  }, [dispatch]);

  return <App />;
}

export default AppInitializer;
