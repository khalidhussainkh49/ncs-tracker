import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
     // setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
      setShowConfirmation(false);
    }
  };

  return (
    <>
      <button
        //onClick={() => setShowConfirmation(true)} //true initially
        onClick={() => handleLogout}
        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Logout"
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to log out? This will end your current session.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isLoggingOut}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}