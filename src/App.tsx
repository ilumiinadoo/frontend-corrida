import 'leaflet/dist/leaflet.css'; // ✅ necessário para o mapa funcionar visualmente
//import "react-big-calendar/lib/css/react-big-calendar.css";
import "./index.css";

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import LoginCallback from './pages/LoginCallback'
//import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import { useAuth } from './context/AuthContext'
import Calendario from './pages/Calendario'
import Grupos from './pages/Grupos'
import GrupoDetalhe from './pages/GrupoDetalhe'
import NovaRota from './pages/NovaRota'
import VerRota from './pages/VerRota'
import { CadastroUsuario } from './pages/CadastroUsuario'
import { CompletarPerfil } from './pages/CompletarPerfil';
import EditarPerfil from "./pages/EditarPerfil";
import { Toaster } from "@/components/ui/toaster"
import NovaAtividade from './pages/NovaAtividade';
import { Navbar } from './pages/components/Navbar';

//import TesteCalendario from './pages/TesteCalendario';


function App() {
  const { token } = useAuth()

  return (
    <BrowserRouter>
    <Toaster />
      {token && <Navbar />}
      <Routes>
        <Route path="/" element={!token ? <Login /> : <Navigate to="/perfil" replace />} />
        <Route path="/login/callback" element={<LoginCallback />} />
        <Route path="/cadastro" element={<CadastroUsuario />} />
        <Route path="/completar-perfil" element={<CompletarPerfil />} />
        <Route path="/editar-perfil" element={<EditarPerfil />} />
        {/*<Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/" />} />*/}
        <Route path="/perfil" element={token ? <Profile /> : <Navigate to="/" />} />
        <Route path="/perfil/:id" element={<Profile />} />
        <Route path="/nova-atividade" element={token ? <NovaAtividade /> : <Navigate to="/" />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/grupos" element={token ? <Grupos /> : <Navigate to="/" />} />
        <Route path="/grupos/:id" element={token ? <GrupoDetalhe /> : <Navigate to="/" />} />
        <Route path="/grupos/:id/nova-rota" element={token ? <NovaRota /> : <Navigate to="/" />} />
        <Route path="/rotas/:rotaId" element={<VerRota />} />
        {/*<Route path="/teste-calendario" element={<TesteCalendario />} />*/} 
      </Routes>
    </BrowserRouter>
  )
}

export default App
