import { useAuth } from '../context/AuthContext';
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AutocompleteInput from "./components/AutocompleteInput";
import MapaRota from "./components/MapaRota";
import { Endpoints } from '../utils/endpoints';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function NovaRota() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { id: grupoId } = useParams();

  const [partida, setPartida] = useState<[number, number] | null>(null);
  const [chegada, setChegada] = useState<[number, number] | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [rota, setRota] = useState<any>(null);
  const [distancia, setDistancia] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const calcularRota = async () => {
    if (!partida || !chegada) return;
    try {
      setLoading(true);
      const res = await fetch("https://api.openrouteservice.org/v2/directions/foot-walking/geojson", {
        method: "POST",
        headers: {
          "Authorization": "5b3ce3597851110001cf624801f8288f2e4a4754a0a717d539980f65",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates: [partida, chegada],
        }),
      });

      if (!res.ok) {
        console.error("Erro na API OpenRouteService:", res.status);
        return;
      }

      const data = await res.json();
      if (!data.features || !Array.isArray(data.features)) {
        console.error("Resposta inesperada da API:", data);
        return;
      }

      setRota(data);
      setDistancia(data.features[0].properties.summary.distance / 1000);
    } catch (err) {
      console.error("Erro ao calcular rota:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCriarRota = async () => {
    if (!rota || !nome || !partida || !chegada || !grupoId) return;

    const coordenadasConvertidas = rota.features[0].geometry.coordinates.map(
      ([lng, lat]: [number, number]) => ({ lat, lng })
    );

    const instrucoes = rota.features[0].properties.segments?.[0]?.steps || [];
    const pontoInicio = instrucoes[0]?.instruction || "Início da rota";
    const pontoFim = instrucoes.at(-1)?.instruction || "Fim da rota";

    try {
      const res = await fetch(Endpoints.CRIAR_ROTA, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome,
          descricao,
          groupId: grupoId,
          pontoInicio,
          pontoFim,
          distanciaKm: distancia,
          coordenadas: coordenadasConvertidas,
        }),
      });

      if (!res.ok) throw new Error("Erro ao criar rota");

      toast({
        title: "Sucesso!",
        description: "Rota criada com sucesso.",
      });

      navigate(`/grupos/${grupoId}`);
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro",
        description: "Falha ao criar a rota. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleVoltar = () => {
    navigate(`/grupos/${grupoId}`);
  };

  if (!grupoId) return <p className="text-white">Grupo não encontrado.</p>;

  return (
  <div className="min-h-screen bg-black text-gray-100 p-6">
    <div className="grid md:grid-cols-2 gap-6 h-[500px]">
      
      {/* Formulário */}
      <Card className="bg-white text-black flex flex-col h-full">
        <Button
            variant="outline"
            size="sm"
            onClick={handleVoltar}
            className="mb-2 text-gray-700 hover:text-green-600"
          >
            ← Voltar para o grupo
          </Button>
        <CardHeader>
          <CardTitle>Nova Rota</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 overflow-y-auto">

          <div>
            <Label>Ponto de partida</Label>
            <AutocompleteInput
              label=""
              onSelect={(coord) => {
                setPartida(coord);
                calcularRota();
              }}
            />
          </div>

          <div>
            <Label>Ponto de chegada</Label>
            <AutocompleteInput
              label=""
              onSelect={(coord) => {
                setChegada(coord);
                calcularRota();
              }}
            />
          </div>

          {distancia && (
            <p className="text-sm text-gray-600">
              Distância: {distancia.toFixed(2)} km
            </p>
          )}

          <div>
            <Label>Nome da rota</Label>
            <Input
              placeholder="Digite o nome da rota"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              placeholder="Descrição opcional..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <Button
            onClick={handleCriarRota}
            disabled={!rota || !nome}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Criar Rota
          </Button>
        </CardContent>
      </Card>

      {/* Mapa */}
      <div className="h-full">
        {loading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <MapaRota rota={rota} />
        )}
      </div>
    </div>
  </div>
);

}
