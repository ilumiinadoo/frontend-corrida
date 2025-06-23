import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import ModalEventoDetalhe from "./ModalEventoDetalhe";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export type EventoGrupo = {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
};

export type RotaGrupo = {
  _id: string;
  nome: string;
};

type Props = {
  groupId: string;
  souAdmin: boolean;
  onSelectEvent?: (evento: EventoGrupo) => void;
};

type FormEvento = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  tipo: 'treino' | 'corrida' | 'outro' | '';
  rotaAssociada: string;
};

export default function CalendarioGrupo({ groupId, souAdmin }: Props) {
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const [eventos, setEventos] = useState<EventoGrupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [abrirModal, setAbrirModal] = useState(false);
  const [form, setForm] = useState<FormEvento>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    tipo: "",
    rotaAssociada: "",
  });
  const [loadingForm, setLoadingForm] = useState(false);
  const [rotasGrupo, setRotasGrupo] = useState<RotaGrupo[]>([]);
  const [eventoSelecionadoId, setEventoSelecionadoId] = useState<string | null>(null);

  const fetchEventos = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/events/group/${groupId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setEventos(Array.isArray(res.data) ? res.data : []);
    } catch {
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, [groupId]);

  useEffect(() => {
    const fetchRotas = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/routes/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setRotasGrupo(Array.isArray(res.data) ? res.data : []);
      } catch {
        console.error("Erro ao buscar rotas");
      }
    };
    fetchEventos();
    fetchRotas();
  }, [groupId]);

  const openModal = () => {
    setForm({
      title: "",
      description: "",
      startDate: new Date(dataSelecionada).toISOString().slice(0, 16),
      endDate: "",
      location: "",
      tipo: "",
      rotaAssociada: "",
    });
    setAbrirModal(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForm(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/events`,
        {
          ...form,
          group: groupId,
          startDate: new Date(form.startDate),
          endDate: form.endDate ? new Date(form.endDate) : undefined,
          rotaAssociada: form.rotaAssociada === "none" ? undefined : form.rotaAssociada,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setAbrirModal(false);
      await fetchEventos();
    } catch {
      console.error("Erro ao criar evento");
    } finally {
      setLoadingForm(false);
    }
  };

  const handleExcluirEvento = async (eventoId: string) => {
    const confirmar = window.confirm("Tem certeza que deseja excluir este evento?");
    if (!confirmar) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/events/${eventoId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      await fetchEventos();
    } catch {
      alert("Erro ao excluir o evento.");
    }
  };

  const eventosDoDia = eventos.filter((ev) => {
    const d = new Date(ev.startDate);
    return d.toDateString() === dataSelecionada.toDateString();
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Calendário de eventos do grupo</h2>

      {souAdmin && (
        <Dialog open={abrirModal} onOpenChange={setAbrirModal}>
          <DialogTrigger asChild>
            <Button onClick={openModal}>Adicionar evento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Novo evento</DialogTitle>
            <form onSubmit={handleCreateEvent} className="flex flex-col gap-4 mt-2">

              <div>
                <Label>Tipo de evento</Label>
                <Select
                  value={form.tipo}
                  onValueChange={(value) => setForm((f) => ({ ...f, tipo: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="treino">Treino conjunto</SelectItem>
                    <SelectItem value="corrida">Corrida organizada</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Rota associada (opcional)</Label>
                <Select
                  value={form.rotaAssociada}
                  onValueChange={(value) => setForm((f) => ({ ...f, rotaAssociada: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar rota" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {rotasGrupo.map((rota) => (
                      <SelectItem key={rota._id} value={rota._id}>{rota.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Título</Label>
                <Input
                  name="title"
                  placeholder="Título"
                  value={form.title}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  name="description"
                  placeholder="Descrição"
                  value={form.description}
                  onChange={handleFormChange}
                />
              </div>

              <div>
                <Label>Início</Label>
                <Input
                  name="startDate"
                  type="datetime-local"
                  value={form.startDate}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div>
                <Label>Fim (opcional)</Label>
                <Input
                  name="endDate"
                  type="datetime-local"
                  value={form.endDate}
                  onChange={handleFormChange}
                />
              </div>

              <div>
                <Label>Local</Label>
                <Input
                  name="location"
                  placeholder="Local"
                  value={form.location}
                  onChange={handleFormChange}
                />
              </div>

              <Button type="submit" disabled={loadingForm}>
                {loadingForm ? "Criando..." : "Criar evento"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {loading ? (
        <div className="p-4">Carregando eventos...</div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-8">
            <Calendar
              locale="pt-BR"
              onChange={(date) => setDataSelecionada(date as Date)}
              value={dataSelecionada}
              tileClassName={({ date }) => {
                const temEvento = eventos.some(
                  (ev) => new Date(ev.startDate).toDateString() === date.toDateString()
                );
                return temEvento ? "bg-blue-100 text-blue-700 font-bold rounded" : undefined;
              }}
            />

            <div className="flex-1">
              <h3 className="text-base font-semibold mb-2">
                Eventos em {dataSelecionada.toLocaleDateString()}
              </h3>
              {eventosDoDia.length === 0 ? (
                <p className="text-gray-500">Nenhum evento cadastrado para este dia.</p>
              ) : (
                <ul className="space-y-4">
                  {eventosDoDia.map((ev) => (
                    <li
                      key={ev._id}
                      className="border p-4 rounded bg-white shadow cursor-pointer hover:bg-blue-50"
                      onClick={() => setEventoSelecionadoId(ev._id)}
                      tabIndex={0}
                    >
                      <p className="font-bold">{ev.title}</p>
                      <p className="text-sm text-gray-600">{ev.description}</p>
                      <p className="text-sm text-gray-500">
                        Início: {new Date(ev.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {ev.endDate && (
                          <>
                            {" • Fim: "}
                            {new Date(ev.endDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </>
                        )}
                      </p>
                      {ev.location && (
                        <p className="text-sm text-gray-400">Local: {ev.location}</p>
                      )}

                      {souAdmin && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExcluirEvento(ev._id);
                          }}
                        >
                          Excluir evento
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* ModalEventoDetalhe - Fora do map, controlado por eventoSelecionadoId */}
          {eventoSelecionadoId && (
            <ModalEventoDetalhe
              eventoId={eventoSelecionadoId}
              aberto={true}
              onClose={() => setEventoSelecionadoId(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
