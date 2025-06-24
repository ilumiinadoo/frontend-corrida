import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import MapaRota from "./components/MapaRota";
import { Endpoints } from '../utils/endpoints';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const formatarPace = (paceMinPerKm: number) => {
  if (!paceMinPerKm || isNaN(paceMinPerKm) || paceMinPerKm === Infinity) {
    return 'Inválido';
  }
  const minutos = Math.floor(paceMinPerKm);
  const segundos = Math.round((paceMinPerKm - minutos) * 60);
  return `${minutos}'${segundos.toString().padStart(2, '0')}" /km`;
};

const Estrelas = ({ value, onChange }: { value: number, onChange: (v: number) => void }) => (
  <div className="flex gap-1 text-2xl cursor-pointer">
    {[1, 2, 3, 4, 5].map((i) => (
      <span
        key={i}
        onClick={() => onChange(i)}
        className={i <= value ? "text-yellow-400 hover:text-yellow-500" : "text-gray-300 hover:text-gray-400"}
      >
        ★
      </span>
    ))}
  </div>
);

export default function VerRota() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { rotaId } = useParams();
  const [usuariosMap, setUsuariosMap] = useState<Record<string, { nome: string }>>({});
  const [rotaData, setRotaData] = useState<any>(null);
  const [accomplishments, setAccomplishments] = useState<any[]>([]);
  const [data, setData] = useState('');
  const [horas, setHoras] = useState<string>('');
  const [minutos, setMinutos] = useState<string>('');
  const [segundos, setSegundos] = useState<string>('');
  const [avaliacao, setAvaliacao] = useState(0);
  const [comentario, setComentario] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const fetchAccomplishments = async () => {
    try {
      const res = await fetch(Endpoints.REALIZACOES_DA_ROTA(rotaId!), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao buscar realizações");
      const data = await res.json();
      setAccomplishments(data);
    } catch (err) {
      console.error("Erro ao buscar realizações:", err);
    }
  };

  const handleVoltar = () => {
    if (rotaData?.groupId) {
      navigate(`/grupos/${rotaData.groupId}`);
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    const fetchRota = async () => {
      try {
        const res = await fetch(Endpoints.ROTA_POR_ID(rotaId!), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao buscar rota");
        const data = await res.json();
        setRotaData(data);
        await fetchUsuarios(data.groupId);
        await fetchAccomplishments();
      } catch (err) {
        console.error("Erro ao carregar rota:", err);
      }
    };
    

    fetchRota();
  }, [rotaId, token]);

  const fetchUsuarios = async (groupId: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/grupo/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, { nome: string }> = {};
        data.forEach((user: any) => {
          map[user._id] = { nome: user.nome };
        });
        setUsuariosMap(map);
      }
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
    }
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    try {
      const res = await fetch(Endpoints.CRIAR_REALIZACAO, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rotaId,
          data,
          horas: Number(horas) || 0,
          minutos: Number(minutos) || 0,
          segundos: Number(segundos) || 0,
          avaliacao,
          comentario,
        }),
      });

      if (!res.ok) throw new Error("Erro ao registrar realização");

      toast({
        title: "Sucesso!",
        description: "Realização registrada com sucesso.",
      });

      setData('');
      setAvaliacao(0);
      setComentario('');
      await fetchAccomplishments();
    } catch (err) {
      setErro("Erro ao registrar realização");
    } finally {
      setCarregando(false);
    }
  };

  if (!rotaData) return <p className="text-white p-4">Carregando rota...</p>;

  const { nome, descricao, distanciaKm, pontoInicio, pontoFim, coordenadas } = rotaData;

  const rotaFormatada = {
    features: [
      {
        geometry: {
          coordinates: coordenadas.map(({ lat, lng }: any) => [lng, lat]),
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 p-6 space-y-8">
      <Button variant="outline" onClick={handleVoltar} className="text-gray-300 hover:text-green-500">
        ← Voltar para o grupo
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white text-black flex flex-col h-full">
          <CardHeader>
            <CardTitle>{nome}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 overflow-y-auto">
            {distanciaKm && <p>Distância: {distanciaKm.toFixed(2)} km</p>}
            {pontoInicio && <p><strong>Início:</strong> {pontoInicio}</p>}
            {pontoFim && <p><strong>Fim:</strong> {pontoFim}</p>}
            {descricao && <p>{descricao}</p>}

            <Separator />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Data:</Label>
                <Input type="date" value={data} onChange={e => setData(e.target.value)} required />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <Label>Horas:</Label>
                  <Input
                    type="number"
                    placeholder="Horas"
                    value={horas}
                    onChange={(e) => setHoras(e.target.value)}
                    min={0}
                  />
                </div>
                <div className="flex-1">
                  <Label>Minutos:</Label>
                  <Input
                    type="number"
                    placeholder="Minutos"
                    value={minutos}
                    onChange={(e) => setMinutos(e.target.value)}
                    min={0}
                    max={59}
                  />
                </div>
                <div className="flex-1">
                  <Label>Segundos:</Label>
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

              <div>
                <Label>Avaliação:</Label>
                <Estrelas value={avaliacao} onChange={setAvaliacao} />
              </div>

              <div>
                <Label>Comentário:</Label>
                <Textarea value={comentario} onChange={e => setComentario(e.target.value)} required rows={4} />
              </div>

              {erro && (
                <p className="text-red-500">{erro}</p>
              )}

              <Button type="submit" disabled={carregando} className="w-full bg-green-600 hover:bg-green-700 text-white">
                {carregando ? "Registrando..." : "Registrar realização"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="h-[500px]">
          <MapaRota rota={rotaFormatada} />
        </div>
      </div>

      {accomplishments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🏅 Realizações Registradas pelos Membros do Grupo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {accomplishments.map((acc, idx) => (
              <Card key={idx} className="border shadow-sm">
                <CardContent className="space-y-2 p-4">
                  <p>
                    <strong>👤 Usuário:</strong>{" "}
                    {usuariosMap[acc.usuarioId]?.nome || acc.usuarioId}
                  </p>
                  <p>
                    <strong>📅 Data:</strong>{" "}
                    {new Date(acc.data).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>⏱️ Tempo:</strong>{" "}
                    {`${acc.tempo.horas}h ${acc.tempo.minutos}m ${acc.tempo.segundos}s`}
                  </p>
                  <p>
                    <strong>🏃 Ritmo médio:</strong>{" "}
                    {acc.ritmoMedio ? formatarPace(acc.ritmoMedio) : "Não calculado"}
                  </p>
                  <p className="flex items-center">
                    <strong>⭐ Avaliação:</strong>{" "}
                    <span className="ml-1 text-yellow-500">
                      {"★".repeat(acc.avaliacao)}
                      {"☆".repeat(5 - acc.avaliacao)}
                    </span>
                  </p>
                  <p>
                    <strong>💬 Comentário:</strong> {acc.comentario}
                  </p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
