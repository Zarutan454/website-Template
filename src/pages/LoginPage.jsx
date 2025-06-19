import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  const navigate = useNavigate();
  const handleLoginSuccess = () => {
    navigate('/');
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-dark-300 via-dark-200 to-dark-100 p-4">
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </div>
  );
};

export default LoginPage; 