import { useState } from "react";
import { Endpoints } from "../utils/endpoints";
import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AutocompleteInput from "./components/AutocompleteInput";
import { useNavigate } from "react-router-dom";

export default function NovaAtividade() {
  const [modo, setModo] = useState<"manual" | "mapa">("manual");
  const [distancia, setDistancia] = useState("");
  const [horas, setHoras] = useState("");
  const [minutos, setMinutos] = useState("");
  const [segundos, setSegundos] = useState("");
  const [data, setData] = useState("");

  const [pontoInicio, setPontoInicio] = useState("");
  const [pontoFim, setPontoFim] = useState("");
  const [coordenadaInicio, setCoordenadaInicio] = useState<[number, number] | null>(null);
  const [coordenadaFim, setCoordenadaFim] = useState<[number, number] | null>(null);
  const [coordenadas, setCoordenadas] = useState<{ lat: number; lng: number }[]>([]);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const calcularRota = async () => {
    if (!coordenadaInicio || !coordenadaFim) {
      alert("Selecione início e fim antes de calcular a rota.");
      return;
    }

    const res = await fetch(Endpoints.CALCULAR_ROTA, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        inicio: { lat: coordenadaInicio[1], lng: coordenadaInicio[0] },
        fim: { lat: coordenadaFim[1], lng: coordenadaFim[0] },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setDistancia(data.distanciaKm);
      setCoordenadas(data.coordenadas);
    } else {
      alert("Erro ao calcular a rota.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tempoTotalMinutos =
    (Number(horas) * 60) + Number(minutos) + Number(segundos) / 60;

    const distanciaFinal = Number(distancia.replace(',', '.'));

    const payload: any = {
      distanciaKm: distanciaFinal,
      tempoMinutos: tempoTotalMinutos,
      data,
    };


    if (modo === "mapa") {
      payload.pontoInicio = pontoInicio;
      payload.pontoFim = pontoFim;
      payload.coordenadas = coordenadas;
    }

    const res = await fetch(Endpoints.CRIAR_ATIVIDADE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Atividade criada com sucesso!");
      navigate("/perfil");
    } else {
      alert("Erro ao criar atividade.");
    }
  };


  const renderCampoTempo = () => (
    <div>
      <Label>Tempo total</Label>
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Horas"
          value={horas}
          onChange={(e) => setHoras(e.target.value)}
          min={0}
        />
        <Input
          type="number"
          placeholder="Minutos"
          value={minutos}
          onChange={(e) => setMinutos(e.target.value)}
          min={0}
          max={59}
        />
        <Input
          type="number"
          placeholder="Segundos"
          value={segundos}
          onChange={(e) => setSegundos(e.target.value)}
          min={0}
          max={59}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white text-black rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Nova Atividade</h1>

        <div className="space-y-2 mb-4">
          <Label className="text-base">Como deseja registrar a atividade?</Label>
          <div className="flex gap-2">
            <Button
              variant={modo === "manual" ? "default" : "outline"}
              onClick={() => setModo("manual")}
            >
              Sem Mapa
            </Button>
            <Button
              variant={modo === "mapa" ? "default" : "outline"}
              onClick={() => setModo("mapa")}
            >
              Com Mapa
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {modo === "manual" && (
            <>
              <div>
                <Label>Distância (km)</Label>
                <Input
                  type="text"
                  placeholder="Ex: 7,5 ou 7.5"
                  value={distancia}
                  onChange={(e) => setDistancia(e.target.value)}
                  required
                />
              </div>

              {renderCampoTempo()}

              <div>
                <Label>Data da atividade</Label>
                <Input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {modo === "mapa" && (
            <>
              {renderCampoTempo()}

              <div>
                <Label>Data da atividade</Label>
                <Input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                />
              </div>

              <AutocompleteInput
                label="Endereço de Início"
                onSelect={(coord, label) => {
                  setPontoInicio(label);
                  setCoordenadaInicio(coord);
                }}
              />

              <AutocompleteInput
                label="Endereço de Fim"
                onSelect={(coord, label) => {
                  setPontoFim(label);
                  setCoordenadaFim(coord);
                }}
              />

              <Button
                variant="secondary"
                type="button"
                className="text-green-600 border-green-600 hover:bg-green-100"
                onClick={calcularRota}
              >
                Calcular Rota
              </Button>

              {coordenadas.length > 0 && (
                <div className="h-48 mt-4 rounded overflow-hidden border">
                  <MapContainer
                    center={coordenadas[0]}
                    zoom={13}
                    scrollWheelZoom={false}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Polyline
                      positions={coordenadas.map((p) => [p.lat, p.lng])}
                      color="green"
                    />
                    {coordenadas.length > 0 && (
                      <Marker position={[coordenadas[0].lat, coordenadas[0].lng]} />
                    )}
                    {coordenadas.length > 1 && (
                      <Marker
                        position={[
                          coordenadas[coordenadas.length - 1].lat,
                          coordenadas[coordenadas.length - 1].lng,
                        ]}
                      />
                    )}
                  </MapContainer>
                </div>
              )}
            </>
          )}

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Salvar Atividade
          </Button>
        </form>
      </div>
    </div>
  );
}
