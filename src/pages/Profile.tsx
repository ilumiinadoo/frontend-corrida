import { useEffect, useState } from 'react';
import { Endpoints } from '../utils/endpoints';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";

interface Activity {
  _id: string;
  usuarioId: string;
  distanciaKm: number;
  tempoMinutos: number;
  data: string;
  ritmoMedio: number;
  calorias: number;
  elevacao?: number;
  coordenadas?: { lat: number; lng: number }[];
  pontoInicio?: string;
  pontoFim?: string;
}

function formatarPace(ritmo: number): string {
  const minutos = Math.floor(ritmo);
  const segundos = Math.round((ritmo - minutos) * 60);
  const segundosFormatados = segundos < 10 ? `0${segundos}` : segundos;
  return `${minutos}'${segundosFormatados}"/km`;
}

export default function Profile() {
  const [perfil, setPerfil] = useState<any>(null);
  const [atividades, setAtividades] = useState<Activity[]>([]);
  const token = localStorage.getItem('token');
  const { id } = useParams();
  const [meuId, setMeuId] = useState<string>("");
  const isMeuPerfil = perfil?._id === meuId;

  const handleExcluirAtividade = async (id: string) => {
    const confirmar = window.confirm("Tem certeza que deseja excluir esta atividade?");
    if (!confirmar) return;

    const res = await fetch(`${Endpoints.ATIVIDADES}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      alert("Atividade excluída com sucesso!");
      window.location.reload();
    } else {
      alert("Erro ao excluir a atividade.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const urlPerfil = id
          ? `${import.meta.env.VITE_API_URL}/users/${id}`
          : Endpoints.USUARIO_ATUAL;

        const resPerfil = await fetch(urlPerfil, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resPerfil.ok) {
          const perfilData = await resPerfil.json();
          setPerfil(perfilData);

          const urlAtividades = `${import.meta.env.VITE_API_URL}/activities/users/${perfilData._id}`;
          const resAtividades = await fetch(urlAtividades, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (resAtividades.ok) {
            setAtividades(await resAtividades.json());
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchMeuId = async () => {
      try {
        const res = await fetch(Endpoints.USUARIO_ATUAL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMeuId(data._id);
        }
      } catch (error) {
        console.error('Erro ao carregar meu próprio ID:', error);
      }
    };

    fetchMeuId();
  }, []);

  if (!perfil) return <p className="text-center mt-8 text-white">Carregando perfil...</p>;

  return (
    <div className="min-h-screen bg-black text-gray-100 p-6 w-full">
      <div className="max-w-5xl mx-auto">
        {/* Cabeçalho do Perfil */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={perfil.foto}
            alt="Foto de perfil"
            className="w-28 h-28 rounded-full object-cover mb-3 border-2 border-green-500"
          />
          <h1 className="text-2xl font-bold text-white">
            {perfil.nome} | {perfil.idade} anos
          </h1>
          <p className="text-gray-400 capitalize">
            Corredor {perfil.nivelExperiencia} | Estilo Preferencial: {perfil.estiloCorrida}
          </p>
        </div>

        {/* Botões de Ação */}
        {isMeuPerfil && (
          <div className="flex items-center justify-between mb-6">
            <Link to="/nova-atividade">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Registrar Nova Atividade
              </Button>
            </Link>
            <Link to="/editar-perfil">
              <Button variant="outline" className="text-black hover:text-gray-800">
                Editar Perfil
              </Button>
            </Link>
          </div>
        )}

        {/* Atividades */}
        {atividades.length === 0 ? (
          <p className="text-gray-400">Nenhuma atividade registrada.</p>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white text-center">Atividades Realizadas</h2>
            {atividades.map((atividade) => {
              const isMinhaAtividade = atividade.usuarioId === meuId;

              return (
                <div key={atividade._id} className="bg-white text-gray-800 rounded-lg shadow-md p-4">
                  <p className="text-sm text-gray-500">
                    {new Date(atividade.data).toLocaleDateString()}
                  </p>
                  <h3 className="text-lg font-bold mb-2">
                    {atividade.pontoInicio && atividade.pontoFim
                      ? `${atividade.pontoInicio} → ${atividade.pontoFim}`
                      : 'Atividade Livre'}
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3 text-sm">
                    <p><strong>Distância:</strong> {atividade.distanciaKm.toFixed(2)} km</p>
                    <p><strong>Tempo:</strong> {atividade.tempoMinutos} min</p>
                    <p><strong>Ritmo médio:</strong> {formatarPace(atividade.ritmoMedio)}</p>
                    <p><strong>Calorias:</strong> {atividade.calorias.toFixed(0)} kcal</p>
                  </div>

                  {atividade.coordenadas && atividade.coordenadas.length > 1 && (
                    <div className="h-48 mt-2 rounded overflow-hidden border border-gray-300">
                      <MapContainer
                        center={atividade.coordenadas[0]}
                        zoom={13}
                        scrollWheelZoom={false}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Polyline
                          positions={atividade.coordenadas.map((p) => [p.lat, p.lng])}
                          color="green"
                        />
                        <Marker position={[atividade.coordenadas[0].lat, atividade.coordenadas[0].lng]} />
                        <Marker position={[atividade.coordenadas[atividade.coordenadas.length - 1].lat, atividade.coordenadas[atividade.coordenadas.length - 1].lng]} />
                      </MapContainer>
                    </div>
                  )}

                  {isMinhaAtividade && (
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleExcluirAtividade(atividade._id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
