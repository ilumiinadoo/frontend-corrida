import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { Endpoints } from "../utils/endpoints";
import CalendarioGrupo from "./components/CalendarioGrupo";
import ModalEventoDetalhe from "./components/ModalEventoDetalhe";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface Grupo {
  _id: string;
  nome: string;
  descricao: string;
  criadorId: string;
  administradores: string[];
  membros: string[];
  pendentes: string[];
}

export default function GrupoDetalhe() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [meuId, setMeuId] = useState("");
  //const [feed, setFeed] = useState<any[]>([]);
  const [rotas, setRotas] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any | null>(null);
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<string | null>(null);
  const navigate = useNavigate();
  const [usuariosMap, setUsuariosMap] = useState<{ [key: string]: any }>({});
  const [eventos, setEventos] = useState<any[]>([]);

  const fetchMeuId = async () => {
    const res = await fetch(Endpoints.USUARIO_ATUAL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setMeuId(data._id);
    }
  };

  const fetchGrupo = async () => {
    const res = await fetch(Endpoints.GRUPO_POR_ID(id!), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setGrupo(data);
    }
  };

  /*const fetchFeed = async () => {
    const res = await fetch(Endpoints.FEED_DO_GRUPO(id!), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setFeed(await res.json());
  };*/

  const fetchRotas = async () => {
    const res = await fetch(Endpoints.ROTAS_POR_GRUPO(id!), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setRotas(await res.json());
  };

  const solicitarEntrada = async () => {
    const res = await fetch(Endpoints.SOLICITAR_ENTRADA(id!), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      toast({ title: "Solicitação enviada!", description: "Aguarde a aprovação." });
      fetchGrupo();
    }
  };

  const aprovarMembro = async (userId: string) => {
    await fetch(Endpoints.APROVAR_MEMBRO(id!, userId), {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchGrupo();
  };

  const promoverAdmin = async (userId: string) => {
    await fetch(Endpoints.PROMOVER_ADMIN(id!, userId), {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchGrupo();
  };

  const excluirRota = async (rotaId: string) => {
    const confirmar = window.confirm("Deseja excluir esta rota?");
    if (!confirmar) return;

    const res = await fetch(Endpoints.EXCLUIR_ROTA(rotaId), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      toast({ title: "Rota excluída!", description: "A lista foi atualizada." });
      fetchRotas();
    } else {
      toast({ title: "Erro ao excluir rota", description: "Tente novamente." });
    }
  };

  const abrirRanking = async () => {
    try {
      setLoadingRanking(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/groups/${id}/rankings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRankings(res.data);
    } catch {
      toast({ title: "Erro", description: "Não foi possível carregar o ranking." });
    } finally {
      setLoadingRanking(false);
    }
  };

  const fetchUsuarios = async (ids: string[]) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/multiple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids }),
      });

      if (res.ok) {
        const data = await res.json();
        const map: { [key: string]: any } = {};
        data.forEach((user: any) => {
          map[user._id] = user;
        });
        setUsuariosMap(map);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const fetchEventosFuturos = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/events/group/${id}/futuros`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setEventos(data.slice(0, 3));
      }
    } catch (error) {
      console.error("Erro ao buscar eventos futuros:", error);
    }
  };

  useEffect(() => {
    if (token && id) Promise.all([fetchMeuId(), fetchGrupo()]);
  }, []);

  useEffect(() => {
    if (grupo && meuId) {
      const souAdmin = grupo.administradores.includes(meuId);
      const souMembro = grupo.membros.includes(meuId);
      if (souAdmin || souMembro) {
        //fetchFeed();
        fetchRotas();
        fetchEventosFuturos();
      }
    }
  }, [grupo, meuId]);

  useEffect(() => {
    if (grupo) {
      const todosIds = [
        ...grupo.administradores,
        ...grupo.membros,
        ...grupo.pendentes,
      ];
      const idsUnicos = Array.from(new Set(todosIds));
      if (idsUnicos.length > 0) fetchUsuarios(idsUnicos);
    }
  }, [grupo]);

  if (!grupo) return <p className="text-white">Carregando...</p>;
  const souAdmin = grupo.administradores.includes(meuId);
  const souMembro = grupo.membros.includes(meuId);
  const souPendente = grupo.pendentes.includes(meuId);

  const renderNivel = (titulo: string, lista: any[], cor: string) => (
    <div>
      <h3 className="font-semibold">{titulo}</h3>
      {lista.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhum corredor.</p>
      ) : (
        <ul className="space-y-2 mt-2">
          {lista.map((user, idx) => (
            <li key={user.accomplishmentId} className="flex items-center gap-3">
              <span>{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}º`}</span>
              <img src={user.foto} alt={user.nome} className="w-8 h-8 rounded-full" />
              <span>{user.nome}</span>
              <Badge variant="outline" className={cor}>
                {user.mediaRitmo.toFixed(2)} min/km
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-gray-100 p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">{grupo.nome}</h1>
        <p className="text-gray-400">{grupo.descricao}</p>
      </div>

      {!souMembro && !souPendente && (
        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={solicitarEntrada}
        >
          Solicitar entrada
        </Button>
      )}
      {souPendente && (
        <Badge variant="destructive">Solicitação pendente</Badge>
      )}

      {(souMembro || souAdmin) && (
        <>
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default">Calendário de Eventos</Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Calendário do Grupo</DialogTitle>
                </DialogHeader>
                <CalendarioGrupo groupId={grupo._id} souAdmin={souAdmin} />
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={abrirRanking} variant="default">
                  Ver Ranking Geral
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ranking por Nível</DialogTitle>
                </DialogHeader>
                {loadingRanking ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  rankings && (
                    <>
                      {renderNivel('Iniciantes', rankings['iniciante'], 'border-blue-500')}
                      {renderNivel('Intermediários', rankings['intermediário'], 'border-yellow-500')}
                      {renderNivel('Avançados', rankings['avançado'], 'border-red-500')}
                    </>
                  )
                )}
              </DialogContent>
            </Dialog>

            {souAdmin && (
              <Button
                onClick={() => navigate(`/grupos/${id}/nova-rota`)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Criar Rota
              </Button>
            )}
          </div>

          <Separator className="my-6" />

          {/* Mural */}
          <Card className="bg-white text-black">
            <CardHeader>
              <CardTitle>Mural de Eventos (Próximos 3)</CardTitle>
            </CardHeader>
            <CardContent>
              {eventos.length === 0 ? (
                <p className="text-gray-500">Nenhum evento futuro encontrado.</p>
              ) : (
                <ul className="space-y-4">
                  {eventos.map((evento) => {
                    const dataEvento = new Date(evento.startDate);
                    return (
                      <li key={evento._id} className="border rounded p-3">
                        <p className="font-bold text-lg">{evento.title}</p>
                        <p className="text-sm text-gray-600">
                          {dataEvento.toLocaleDateString()} às{" "}
                          {dataEvento.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p className="text-sm">{evento.descricao}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => setEventoSelecionado(evento._id)}
                        >
                          Ver detalhes
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
          {/* Rotas */}
          <Card className="bg-white text-black">
            <CardHeader>
              <CardTitle>Rotas do Grupo</CardTitle>
            </CardHeader>
            <CardContent>
              {rotas.length === 0 ? (
                <p className="text-gray-500">Nenhuma rota.</p>
              ) : (
                <ul className="space-y-3">
                  {rotas.map((rota) => (
                    <li key={rota._id} className="p-3 border rounded">
                      <p><strong>Nome:</strong> {rota.nome}</p>
                      <p><strong>Distância:</strong> {rota.distanciaKm} km</p>
                      <div className="flex gap-3 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/rotas/${rota._id}`)}
                        >
                          Ver no mapa
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => excluirRota(rota._id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Administradores */}
          <Card className="bg-white text-black">
            <CardHeader>
              <CardTitle>Administradores</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6">
                {grupo.administradores.map((id) => (
                  <li key={id} className="flex items-center gap-2">
                    <span>{usuariosMap[id]?.nome || id}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/perfil/${id}`)}
                    >
                      Ver perfil
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Membros */}
          <Card className="bg-white text-black">
            <CardHeader>
              <CardTitle>Membros</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6">
                {grupo.membros.map((id) => (
                  <li key={id} className="flex items-center gap-2">
                    <span>{usuariosMap[id]?.nome || id}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/perfil/${id}`)}
                    >
                      Ver perfil
                    </Button>
                    {souAdmin && !grupo.administradores.includes(id) && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => promoverAdmin(id)}
                      >
                        Promover a admin
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Solicitações Pendentes */}
          {souAdmin && (
            <Card className="bg-white text-black">
              <CardHeader>
                <CardTitle>Solicitações Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                {grupo.pendentes.length === 0 ? (
                  <p className="text-gray-500">Nenhuma solicitação.</p>
                ) : (
                  <ul className="list-disc pl-6">
                    {grupo.pendentes.map((id) => (
                      <li key={id} className="flex items-center gap-2">
                        <span>{usuariosMap[id]?.nome || id}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/perfil/${id}`)}
                        >
                          Ver perfil
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => aprovarMembro(id)}
                        >
                          Aprovar
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Modal de Detalhes do Evento */}
      {eventoSelecionado && (
        <ModalEventoDetalhe
          eventoId={eventoSelecionado}
          aberto={!!eventoSelecionado}
          onClose={() => setEventoSelecionado(null)}
        />
      )}
    </div>
  );
}
