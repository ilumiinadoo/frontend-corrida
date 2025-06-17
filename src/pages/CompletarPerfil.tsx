import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Endpoints } from '../utils/endpoints';

type PerfilFormData = {
  nome: string;
  idade: number;
  foto: string;
  nivelExperiencia: string;
  estiloCorrida: string;
};

const fotosPredefinidas = [
  "/imgs/corredor1.png", "/imgs/corredor2.png", "/imgs/corredor3.png", "/imgs/corredor4.png",
  "/imgs/corredor5.png", "/imgs/corredor6.png", "/imgs/corredor7.png", "/imgs/corredor8.png",
  "/imgs/corredor9.png", "/imgs/corredor10.png", "/imgs/corredor11.png", "/imgs/corredor12.png",
  "/imgs/corredor13.png", "/imgs/corredor14.png", "/imgs/corredor15.png", "/imgs/corredor16.png",
  "/imgs/corredor17.png", "/imgs/corredor18.png", "/imgs/corredor19.png", "/imgs/corredor20.png",
  "/imgs/corredor21.png", "/imgs/corredor22.png", "/imgs/corredor23.png", "/imgs/corredor24.png",
  "/imgs/corredor25.png", "/imgs/corredor26.png", "/imgs/corredor27.png", "/imgs/corredor28.png",
  "/imgs/corredor29.png", "/imgs/corredor30.png", "/imgs/corredor31.png", "/imgs/corredor32.png",
];

export function CompletarPerfil() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [fotoSelecionada, setFotoSelecionada] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PerfilFormData>();

  const onSubmit = async (data: PerfilFormData) => {
    try {
      if (!fotoSelecionada) {
        toast({
          title: "Erro",
          description: "Selecione uma imagem de perfil.",
          variant: "destructive",
        });
        return;
      }

      data.idade = Number(data.idade);
      data.foto = fotoSelecionada;

      await axios.put(Endpoints.ATUALIZAR_USUARIO, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: "Perfil atualizado",
        description: "Informações complementares salvas com sucesso!",
      });

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Erro ao atualizar perfil.";
      toast({
        title: "Erro ao salvar",
        description: Array.isArray(msg) ? msg[0] : msg,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white text-black rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">Complete seu perfil</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input {...register("nome", { required: "Nome é obrigatório" })} />
            {errors.nome && <p className="text-red-500 text-sm">{errors.nome.message}</p>}
          </div>

          <div>
            <Label>Idade</Label>
            <Input
              type="number"
              {...register("idade", { required: "Idade é obrigatória", min: 10 })}
            />
            {errors.idade && <p className="text-red-500 text-sm">{errors.idade.message}</p>}
          </div>

          <div>
            <Label>Foto de perfil</Label>
            <div className="flex flex-wrap gap-4 mt-2">
              {fotosPredefinidas.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt="Avatar"
                  onClick={() => {
                    setFotoSelecionada(url);
                    setValue("foto", url);
                  }}
                  className={`w-16 h-16 rounded-full border-2 cursor-pointer ${
                    fotoSelecionada === url
                      ? "border-blue-600"
                      : "border-gray-300 hover:border-green-400"
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <Label>Nível de Experiência</Label>
            <Select onValueChange={(val) => setValue("nivelExperiencia", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="iniciante">Iniciante</SelectItem>
                <SelectItem value="intermediário">Intermediário</SelectItem>
                <SelectItem value="avançado">Avançado</SelectItem>
              </SelectContent>
            </Select>
            {errors.nivelExperiencia && (
              <p className="text-red-500 text-sm">Campo obrigatório</p>
            )}
          </div>

          <div>
            <Label>Estilo de Corrida</Label>
            <Select onValueChange={(val) => setValue("estiloCorrida", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pista">Pista</SelectItem>
                <SelectItem value="trilha">Trilha</SelectItem>
                <SelectItem value="rua">Rua</SelectItem>
              </SelectContent>
            </Select>
            {errors.estiloCorrida && (
              <p className="text-red-500 text-sm">Campo obrigatório</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
            disabled={!fotoSelecionada}
          >
            Salvar
          </Button>
        </form>
      </div>
    </div>
  );
}
