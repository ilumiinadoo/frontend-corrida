import { jwtDecode } from "jwt-decode";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      const decoded: any = jwtDecode(token);

      login(token); // salva no contexto

      if (decoded.profileIncomplete) {
        navigate("/completar-perfil");
      } else {
        navigate("/dashboard");
      }
    }
  }, [navigate, login]);

  return <p>Autenticando via Google...</p>;
};

export default LoginCallback;
