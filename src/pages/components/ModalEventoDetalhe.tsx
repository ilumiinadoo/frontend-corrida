import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type EventoDetalhado = {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  tipo: "treino" | "corrida" | "outro";
  rotaAssociada?: {
    _id: string;
    nome: string;
    coordenadas: { lat: number; lng: number }[];
  };
  createdBy?: { nome: string };
  attendees?: {
    user: { _id: string; nome: string };
    status: "confirmed" | "maybe" | "declined";
  }[];
};

type Props = {
  eventoId: string;
  aberto: boolean;
  onClose: () => void;
};

export default function ModalEventoDetalhe({ eventoId, aberto, onClose }: Props) {
  const [evento, setEvento] = useState<EventoDetalhado | null>(null);
  const [loadingPresenca, setLoadingPresenca] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const meuId = localStorage.getItem("userId");
  const meuStatus = evento?.attendees?.find((a) => a.user._id === meuId)?.status;

  useEffect(() => {
    if (aberto) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/events/${eventoId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => setEvento(res.data))
        .catch(() => setEvento(null));
    }
  }, [eventoId, aberto]);

  const confirmarPresenca = async (status: "confirmed" | "maybe" | "declined") => {
    setLoadingPresenca(true);
    setMensagem(null);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/events/${eventoId}/attendance`,
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/events/${eventoId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setEvento(res.data);
      setMensagem("Presença registrada com sucesso!");
    } catch {
      setMensagem("Erro ao confirmar presença.");
    } finally {
      setLoadingPresenca(false);
    }
  };

  if (!evento) return null;

  return (
    <Dialog
      open={aberto}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogTitle>{evento.title}</DialogTitle>
        <div className="mt-2 space-y-2 text-sm text-muted-foreground">
          {evento.description && <p>{evento.description}</p>}
          <p><strong>Tipo:</strong> {evento.tipo}</p>
          <p>
            <strong>Início:</strong> {new Date(evento.startDate).toLocaleString()}
            {evento.endDate && (
              <>
                {" • "}
                <strong>Fim:</strong> {new Date(evento.endDate).toLocaleString()}
              </>
            )}
          </p>
          {evento.location && <p><strong>Local:</strong> {evento.location}</p>}
          {evento.createdBy && <p><strong>Criado por:</strong> {evento.createdBy.nome}</p>}

          {evento.attendees && (
            <div className="mt-4">
              <Separator className="my-2" />
              <strong>Participantes:</strong>
              <ul className="list-disc ml-5 mt-1">
                {evento.attendees.map((a, i) => (
                  <li key={i}>
                    {a.user.nome}
                    {a.user._id === meuId && " (você)"} –{" "}
                    {a.status === "confirmed"
                      ? "Vou"
                      : a.status === "maybe"
                      ? "Talvez"
                      : "Não vou"}
                  </li>
                ))}
              </ul>

              <div className="flex gap-2 mt-4">
                <Button
                  type="button"
                  onClick={() => confirmarPresenca("confirmed")}
                  disabled={loadingPresenca}
                  className={`text-white ${
                    meuStatus === "confirmed"
                      ? "bg-green-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  Vou
                </Button>

                <Button
                  type="button"
                  onClick={() => confirmarPresenca("maybe")}
                  disabled={loadingPresenca}
                  className={`text-white ${
                    meuStatus === "maybe"
                      ? "bg-yellow-600"
                      : "bg-yellow-500 hover:bg-yellow-600"
                  }`}
                >
                  Talvez
                </Button>

                <Button
                  type="button"
                  onClick={() => confirmarPresenca("declined")}
                  disabled={loadingPresenca}
                  className={`text-white ${
                    meuStatus === "declined"
                      ? "bg-red-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Não vou
                </Button>
              </div>

              {mensagem && <p className="text-sm mt-2">{mensagem}</p>}
            </div>
          )}

          {evento.rotaAssociada &&
            evento.rotaAssociada.coordenadas &&
            evento.rotaAssociada.coordenadas.length > 0 && (
              <MapContainer
                center={evento.rotaAssociada.coordenadas[0]}
                zoom={14}
                scrollWheelZoom={false}
                className="h-64 w-full rounded-lg shadow mt-4"
              >
                <TileLayer
                  attribution='Map data © OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Polyline positions={evento.rotaAssociada.coordenadas} />
                <Marker position={evento.rotaAssociada.coordenadas[0]}>
                  <Popup>Início</Popup>
                </Marker>
                <Marker position={evento.rotaAssociada.coordenadas.slice(-1)[0]}>
                  <Popup>Fim</Popup>
                </Marker>
              </MapContainer>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
