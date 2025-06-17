import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const navigate = useNavigate()
  const { token, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleIrParaPerfil = () => {
    navigate('/perfil')
  }
  /*
  return (
    
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={handleIrParaPerfil}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Meu Perfil
          </button>

          <button
            onClick={() => navigate('/nova-atividade')}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition"
          >
            Nova Atividade
          </button>

          <button
            onClick={() => navigate('/calendario')}
            className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 transition"
          >
            Calendário de Corridas
          </button>

          <button
            onClick={() => navigate('/grupos')}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Grupos de Corrida
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Sair
          </button>
        </div>
      </div>

      <p className="mb-4">Você está autenticado com token JWT.</p>
      
      <pre className="text-sm bg-gray-100 p-4 rounded break-all">
        {token}
      </pre>
      
      <pre className="text-sm bg-gray-100 p-4 rounded break-all">
        {token}
      </pre>

    </div>
  
  )
  */
}
