import { useNavigate } from 'react-router-dom';
import PageTemplate from '../components/templates/PageTemplate';
import RegisterForm from '../components/RegisterForm';

const RegisterPage = () => {
  const navigate = useNavigate();
  
  const handleRegisterSuccess = () => {
    navigate('/login');
  };
  
  return (
    <PageTemplate>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black via-[#06071F] to-[#050520] py-12 px-4">
        <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
      </div>
    </PageTemplate>
  );
};

export default RegisterPage; 