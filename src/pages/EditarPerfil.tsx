import { useEffect, useState } from "react";
import { Endpoints } from "../utils/endpoints";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

export default function EditarPerfil() {
  const [perfil, setPerfil] = useState<any>(null);
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState(0);
  const [nivelExperiencia, setNivelExperiencia] = useState("");
  const [estiloCorrida, setEstiloCorrida] = useState("");
  const [foto, setFoto] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const avatares = [
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

  useEffect(() => {
    const fetchPerfil = async () => {
      const res = await fetch(Endpoints.USUARIO_ATUAL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPerfil(data);
        setNome(data.nome);
        setIdade(data.idade);
        setNivelExperiencia(data.nivelExperiencia);
        setEstiloCorrida(data.estiloCorrida);
        setFoto(data.foto);
      }
    };
    fetchPerfil();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      nome,
      idade,
      nivelExperiencia,
      estiloCorrida,
      foto,
    };

    const res = await fetch(Endpoints.ATUALIZAR_USUARIO, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Perfil atualizado com sucesso!");
      navigate("/perfil");
      window.location.reload();
    } else {
      alert("Erro ao atualizar o perfil.");
    }
  };

  if (!perfil) return <p className="text-center mt-8 text-white">Carregando...</p>;

  return (
    <div className="min-h-screen bg-black text-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white text-black rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-900">
          Editar Perfil
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Idade</Label>
            <Input
              type="number"
              value={idade}
              onChange={(e) => setIdade(Number(e.target.value))}
              required
            />
          </div>

          <div>
            <Label>Nível de experiência</Label>
            <Select
              value={nivelExperiencia}
              onValueChange={setNivelExperiencia}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="iniciante">Iniciante</SelectItem>
                <SelectItem value="intermediario">Intermediário</SelectItem>
                <SelectItem value="avancado">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Estilo de corrida</Label>
            <Select
              value={estiloCorrida}
              onValueChange={setEstiloCorrida}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estilo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pista">Pista</SelectItem>
                <SelectItem value="trilha">Trilha</SelectItem>
                <SelectItem value="rua">Rua</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Avatar</Label>
            <div className="flex flex-wrap gap-4 mt-2">
              {avatares.map((avatar) => (
                <img
                  key={avatar}
                  src={avatar}
                  alt="Avatar"
                  onClick={() => setFoto(avatar)}
                  className={`w-16 h-16 rounded-full cursor-pointer border-2 ${
                    foto === avatar
                      ? "border-blue-600"
                      : "border-gray-300 hover:border-green-400"
                  }`}
                />
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Salvar Alterações
          </Button>
        </form>
      </div>
    </div>
  );
}
