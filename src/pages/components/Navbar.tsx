import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from '../../context/AuthContext';

export function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleIrParaPerfil = () => {
    navigate('/perfil');
  };

  const userName = user?.nome ?? 'Usuário';
  const avatarOptions = [
    "/imgs/corredor1.png",
    "/imgs/corredor2.png",
    "/imgs/corredor3.png",
    "/imgs/corredor4.png",
    "/imgs/corredor5.png",
    "/imgs/corredor6.png",
    "/imgs/corredor7.png",
    "/imgs/corredor8.png",
    "/imgs/corredor9.png",
    "/imgs/corredor10.png",
    "/imgs/corredor11.png",
    "/imgs/corredor12.png",
    "/imgs/corredor13.png",
    "/imgs/corredor14.png",
    "/imgs/corredor15.png",
    "/imgs/corredor16.png",
    "/imgs/corredor17.png",
    "/imgs/corredor18.png",
    "/imgs/corredor19.png",
    "/imgs/corredor20.png",
    "/imgs/corredor21.png",
    "/imgs/corredor22.png",
    "/imgs/corredor23.png",
    "/imgs/corredor24.png",
    "/imgs/corredor25.png",
    "/imgs/corredor26.png",
    "/imgs/corredor27.png",
    "/imgs/corredor28.png",
    "/imgs/corredor29.png",
    "/imgs/corredor30.png",
    "/imgs/corredor31.png",
    "/imgs/corredor32.png",
    ];

    // Se a foto do usuário estiver na lista de opções válidas, usa ela. Senão, usa uma padrão.
    const avatarUrl = avatarOptions.includes(user?.foto ?? '') 
    ? user!.foto 
    : "/imgs/corredor1.png";

  return (
    <header className="bg-black text-gray-300 sticky top-0 z-50 shadow-md">
    <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-white hover:text-green-400 transition"
            >
            Corrida<span className="text-green-400">+</span>
        </Link>

        {/* Navegação */}
        <nav className="flex space-x-6 text-sm font-medium">
        <Link to="/perfil" className="text-gray-300 hover:text-green-400 transition">Perfil</Link>
        <Link to="/calendario" className="text-gray-300 hover:text-green-400 transition">Calendário</Link>
        <Link to="/grupos" className="text-gray-300 hover:text-green-400 transition">Grupos</Link>
        </nav>

        {/* Perfil com Dropdown */}
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0">
            <Avatar className="h-8 w-8 border-2 border-white">
                <AvatarImage src={avatarUrl} alt={userName} />
                <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
            </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48" align="end">
            <DropdownMenuItem onClick={handleIrParaPerfil}>
            Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
            <Link to="/editar-perfil" className="text-green-400 hover:text-green-600">Editar Perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
            Sair
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
    </div>
    </header>
  );
}
