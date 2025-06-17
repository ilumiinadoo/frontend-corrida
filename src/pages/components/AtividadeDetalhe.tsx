import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Endpoints } from "../../utils/endpoints";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Atividade {
  _id: string;
  usuarioId: string;
  distanciaKm: number;
  tempoMinutos: number;
  data: string;
  ritmoMedio: number;
  calorias: number;
  pontoInicio?: string;
  pontoFim?: string;
  coordenadas?: { lat: number; lng: number }[];
}

interface Props {
  atividadeId: string;
  meuId: string;
  open: boolean;
  onClose: () => void;
}

function formatarPace(ritmo: number): string {
  const minutos = Math.floor(ritmo);
  const segundos = Math.round((ritmo - minutos) * 60);
  const segundosFormatados = segundos < 10 ? `0${segundos}` : segundos;
  return `${minutos}'${segundosFormatados}"/km`;
}

export default function AtividadeDetalhe({ atividadeId, meuId, open, onClose }: Props) {
  const [atividade, setAtividade] = useState<Atividade | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAtividade = async () => {
      const res = await fetch(`${Endpoints.ATIVIDADES}/${atividadeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAtividade(data);
      }
    };

    if (open) fetchAtividade();
  }, [atividadeId, open]);

  const handleExcluir = async () => {
    const confirmar = window.confirm("Tem certeza que deseja excluir esta atividade?");
    if (!confirmar) return;

    const res = await fetch(`${Endpoints.ATIVIDADES}/${atividadeId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      alert("Atividade excluída com sucesso!");
      onClose();
      window.location.reload();
    } else {
      alert("Erro ao excluir a atividade.");
    }
  };

  if (!atividade) return null;

  const isMeuPerfil = atividade.usuarioId === meuId;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Atividade</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <p><strong>Data:</strong> {new Date(atividade.data).toLocaleDateString()}</p>
          <p><strong>Distância:</strong> {atividade.distanciaKm.toFixed(2)} km</p>
          <p><strong>Tempo:</strong> {atividade.tempoMinutos} min</p>
          <p><strong>Ritmo médio:</strong> {formatarPace(atividade.ritmoMedio)}</p>
          <p><strong>Calorias:</strong> {atividade.calorias.toFixed(0)} kcal</p>

          {atividade.pontoInicio && atividade.pontoFim && (
            <p><strong>De:</strong> {atividade.pontoInicio} → {atividade.pontoFim}</p>
          )}

          {atividade.coordenadas && atividade.coordenadas.length > 1 && (
            <div className="h-64 mt-2 rounded overflow-hidden border">
              <MapContainer
                center={atividade.coordenadas[0]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Polyline
                  positions={atividade.coordenadas.map((p) => [p.lat, p.lng])}
                  color="blue"
                />
                <Marker position={[atividade.coordenadas[0].lat, atividade.coordenadas[0].lng]} />
                <Marker position={[atividade.coordenadas[atividade.coordenadas.length - 1].lat, atividade.coordenadas[atividade.coordenadas.length - 1].lng]} />
              </MapContainer>
            </div>
          )}

          {isMeuPerfil && (
            <div className="flex gap-2 mt-4">
              <Button variant="destructive" onClick={handleExcluir}>
                Excluir Atividade
              </Button>
              {/* Aqui no futuro você pode adicionar um botão de Editar */}
              {/* <Button onClick={abrirModalEdicao}>Editar Atividade</Button> */}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
