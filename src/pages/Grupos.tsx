import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Endpoints } from "../utils/endpoints";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface Grupo {
  _id: string;
  nome: string;
  descricao: string;
  criadorId: string;
  administradores: string[];
  membros: string[];
  pendentes: string[];
}

export default function Grupos() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [meuId, setMeuId] = useState("");
  const token = localStorage.getItem("token") || "";
  const navigate = useNavigate();

  // Buscar todos os grupos
  const buscarGrupos = async () => {
    try {
      const res = await fetch(Endpoints.GRUPOS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setGrupos(data);
      }
    } catch (error) {
      console.error("Erro ao buscar grupos:", error);
    }
  };

  // Buscar o ID do usuário logado
  const buscarMeuId = async () => {
    try {
      const res = await fetch(Endpoints.USUARIO_ATUAL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMeuId(data._id);
      }
    } catch (error) {
      console.error("Erro ao buscar usuário atual:", error);
    }
  };

  // Criar um novo grupo
  const criarGrupo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(Endpoints.CRIAR_GRUPO, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome, descricao }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        toast({
          title: "Erro ao criar grupo",
          description: data?.message || "Não foi possível criar o grupo. Tente novamente.",
        });
      } else {
        toast({
          title: "Grupo criado com sucesso!",
          description: `O grupo "${nome}" foi criado.`,
        });
        setNome("");
        setDescricao("");
        buscarGrupos();
      }
    } catch (error) {
      console.error("Erro ao criar grupo:", error);
    }
  };

  // Solicitar entrada no grupo
  const solicitarEntrada = async (id: string) => {
    try {
      const res = await fetch(Endpoints.SOLICITAR_ENTRADA(id), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast({
          title: "Solicitação enviada",
          description: "Sua solicitação de entrada no grupo foi enviada com sucesso.",
        });
        buscarGrupos();
      } else {
        toast({
          title: "Erro ao solicitar entrada",
          description: "Não foi possível enviar a solicitação. Tente novamente.",
        });
      }
    } catch (error) {
      console.error("Erro ao solicitar entrada:", error);
    }
  };

  // Excluir grupo
  const excluirGrupo = async (id: string) => {
    const confirmar = window.confirm("Tem certeza que deseja excluir este grupo?");
    if (!confirmar) return;

    try {
      const res = await fetch(Endpoints.EXCLUIR_GRUPO(id), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast({
          title: "Grupo excluído",
          description: "O grupo foi removido com sucesso.",
        });
        buscarGrupos();
      } else {
        toast({
          title: "Erro ao excluir grupo",
          description: "Não foi possível excluir o grupo. Tente novamente.",
        });
      }
    } catch (error) {
      console.error("Erro ao excluir grupo:", error);
    }
  };

  // Sair do grupo
  const sairDoGrupo = async (id: string) => {
    const confirmar = window.confirm("Tem certeza que deseja sair deste grupo?");
    if (!confirmar) return;

    try {
      const res = await fetch(Endpoints.SAIR_DO_GRUPO(id), {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast({
          title: "Saída confirmada",
          description: "Você saiu do grupo com sucesso.",
        });
        buscarGrupos();
      } else {
        const data = await res.json();
        toast({
          title: "Erro ao sair do grupo",
          description: data.message || "Não foi possível sair. Tente novamente.",
        });
      }
    } catch (error) {
      console.error("Erro ao sair do grupo:", error);
    }
  };

  // Ordenação: Grupos que o usuário participa primeiro
  const gruposOrdenados = [...grupos].sort((a, b) => {
    const estaNoA = a.membros.includes(meuId);
    const estaNoB = b.membros.includes(meuId);

    if (estaNoA && !estaNoB) return -1;
    if (!estaNoA && estaNoB) return 1;
    return 0;
  });

  useEffect(() => {
    buscarMeuId();
    buscarGrupos();
  }, []);

  return (
    <div className="min-h-screen bg-black text-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Cabeçalho */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white">Grupos de Corrida</h1>
          <p className="text-gray-400">
            Participe de grupos para correr junto com a comunidade.
          </p>
        </div>

        {/* Formulário de criação de grupo */}
        <Card>
          <CardHeader>
            <CardTitle>Criar novo grupo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={criarGrupo} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do grupo</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Corredores da Alegria"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Ex: Grupo para corridas de sábado pela manhã"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                Criar grupo
              </Button>
            </form>
          </CardContent>
        </Card>

        <Separator />

        {/* Lista de grupos */}
        <div className="space-y-4">
          {grupos.length === 0 ? (
            <p className="text-gray-400">Nenhum grupo disponível ainda.</p>
          ) : (
            gruposOrdenados.map((grupo) => {
              const souAdmin = grupo.administradores.includes(meuId);
              const souMembro = grupo.membros.includes(meuId);
              const souPendente = grupo.pendentes.includes(meuId);

              return (
                <Card
                  key={grupo._id}
                  className="bg-white text-black hover:shadow-md transition"
                >
                  <CardHeader>
                    <CardTitle>{grupo.nome}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-gray-700">{grupo.descricao}</p>

                    {/* Badges de status */}
                    <div className="flex flex-wrap gap-2">
                      {souAdmin && (
                        <Badge className="bg-green-700 text-white">Administrador</Badge>
                      )}
                      {souMembro && !souAdmin && (
                        <Badge variant="outline" className="border-green-500 text-green-700">
                          Membro
                        </Badge>
                      )}
                      {souPendente && (
                        <Badge variant="destructive">Solicitação pendente</Badge>
                      )}
                    </div>

                    {/* Botões de ação */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {!souMembro && !souPendente && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => solicitarEntrada(grupo._id)}
                        >
                          Solicitar entrada
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/grupos/${grupo._id}`)}
                      >
                        Ver grupo
                      </Button>

                      {souMembro && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => sairDoGrupo(grupo._id)}
                        >
                          Sair do grupo
                        </Button>
                      )}

                      {souAdmin && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => excluirGrupo(grupo._id)}
                        >
                          Excluir grupo
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
