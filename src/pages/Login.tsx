import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Endpoints } from '../utils/endpoints';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(Endpoints.AUTENTICAR_LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    const data = await res.json();
    if (data.access_token) {
      login(data.access_token);
      navigate('/dashboard');
    } else {
      alert('Credenciais inválidas');
    }
  };

  const handleLoginGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <form
        onSubmit={handleLogin}
        className="bg-gray-100 p-8 rounded-lg shadow-md w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Corrida<span className="text-green-500">+</span>
        </h2>

        <Input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <Button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          Entrar
        </Button>

        <Separator />

        <Button
          type="button"
          variant="outline"
          className="w-full hover:bg-gray-200"
          onClick={handleLoginGoogle}
        >
          Entrar com Google
        </Button>

        <Button
          type="button"
          variant="link"
          className="w-full text-gray-600 hover:text-green-500 text-sm"
          onClick={() => navigate('/cadastro')}
        >
          Ainda não tem conta? Registre-se
        </Button>
      </form>
    </div>
  );
}
