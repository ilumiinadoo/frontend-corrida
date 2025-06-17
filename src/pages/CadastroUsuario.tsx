import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Endpoints } from '../utils/endpoints';
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
import { useToast } from "@/hooks/use-toast";

type FormData = {
  nome: string;
  email: string;
  senha: string;
  idade: number;
  foto: string;
  nivelExperiencia: string;
  estiloCorrida: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
};

const fotosPredefinidas = [
  "/imgs/corredor1.png", "/imgs/corredor2.png", "/imgs/corredor3.png",
  "/imgs/corredor4.png", "/imgs/corredor5.png", "/imgs/corredor6.png",
  "/imgs/corredor7.png", "/imgs/corredor8.png", "/imgs/corredor9.png",
  "/imgs/corredor10.png", "/imgs/corredor11.png", "/imgs/corredor12.png",
  "/imgs/corredor13.png", "/imgs/corredor14.png", "/imgs/corredor15.png",
  "/imgs/corredor16.png", "/imgs/corredor17.png", "/imgs/corredor18.png",
  "/imgs/corredor19.png", "/imgs/corredor20.png", "/imgs/corredor21.png",
  "/imgs/corredor22.png", "/imgs/corredor23.png", "/imgs/corredor24.png",
  "/imgs/corredor25.png", "/imgs/corredor26.png", "/imgs/corredor27.png",
  "/imgs/corredor28.png", "/imgs/corredor29.png", "/imgs/corredor30.png",
  "/imgs/corredor31.png", "/imgs/corredor32.png",
];

export function CadastroUsuario() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      foto: "",
    },
  });

  const navigate = useNavigate();
  const [fotoSelecionada, setFotoSelecionada] = useState<string>("");
  const { toast } = useToast();

  const onSubmit = async (data: FormData) => {
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

      await axios.post(Endpoints.REGISTRAR_USUARIO, data);

      toast({
        title: "Cadastro realizado",
        description: "Usuário cadastrado com sucesso!",
      });

      setTimeout(() => navigate("/"), 1500);
    } catch (error: any) {
      const data = error?.response?.data;
      const msg = Array.isArray(data?.message)
        ? data.message[0]
        : data?.message || "Erro ao cadastrar usuário.";

      toast({
        title: "Erro ao cadastrar",
        description: msg,
        variant: "destructive",
      });
    }
  };

  const handleSelectFoto = (url: string) => {
    setFotoSelecionada(url);
    setValue("foto", url);
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white text-black rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Cadastro de Usuário</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input {...register("nome", { required: "Nome é obrigatório" })} />
            {errors.nome && <p className="text-red-500 text-sm">{errors.nome.message}</p>}
          </div>

          <div>
            <Label>Email</Label>
            <Input type="email" {...register("email", { required: "Email é obrigatório" })} />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          <div>
            <Label>Senha</Label>
            <Input type="password" {...register("senha", { required: "Senha é obrigatória" })} />
            {errors.senha && <p className="text-red-500 text-sm">{errors.senha.message}</p>}
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
            <Label>Foto de Perfil</Label>
            <div className="flex flex-wrap gap-4 mt-2">
              {fotosPredefinidas.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt="Avatar"
                  onClick={() => handleSelectFoto(url)}
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

          <div>
            <Label>Redes Sociais (opcional)</Label>
            <Input placeholder="Instagram" {...register("instagram")} />
            <Input placeholder="Facebook" {...register("facebook")} className="mt-1" />
            <Input placeholder="Twitter" {...register("twitter")} className="mt-1" />
          </div>

          <Button
            type="submit"
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
            disabled={!fotoSelecionada}
          >
            Cadastrar
          </Button>
        </form>
      </div>
    </div>
  );
}
