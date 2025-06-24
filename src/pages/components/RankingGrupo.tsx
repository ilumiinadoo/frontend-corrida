import { useEffect, useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface UsuarioRanking {
  userId: string;
  nome: string;
  foto: string;
  mediaRitmo: number;
}

interface RankingResponse {
  iniciante: UsuarioRanking[];
  intermediario: UsuarioRanking[];
  avancado: UsuarioRanking[];
}

interface Props {
  groupId: string;
}

export function DialogRankingGrupo({ groupId }: Props) {
  const [rankings, setRankings] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!groupId) return;
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_API_URL}/groups/${groupId}/rankings`)
      .then((res) => setRankings(res.data))
      .finally(() => setLoading(false));
  }, [groupId]);

  const formatarPace = (paceMinPerKm: number) => {
    const minutos = Math.floor(paceMinPerKm);
    const segundos = Math.round((paceMinPerKm - minutos) * 60);
    return `${minutos}'${segundos.toString().padStart(2, "0")}" /km`;
  };

  const renderNivel = (titulo: string, lista: UsuarioRanking[]) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">{titulo}</h3>
      {lista.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum corredor neste nível ainda.</p>
      ) : (
        <ul className="space-y-2">
          {lista.map((user, idx) => {
            const posicao =
              idx === 0
                ? "🥇"
                : idx === 1
                ? "🥈"
                : idx === 2
                ? "🥉"
                : `${idx + 1}º`;

            return (
              <li
                key={user.userId}
                className="flex items-center justify-between bg-white text-black px-4 py-2 rounded shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold w-6 text-right">{posicao}</span>
                  <img
                    src={user.foto}
                    alt={user.nome}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span>{user.nome}</span>
                </div>

                <div
                  className={`px-3 py-1 text-sm rounded border font-mono flex items-center min-w-[80px] justify-center ${
                    titulo.includes("Iniciante")
                      ? "border-blue-500 text-blue-700"
                      : titulo.includes("Intermediário")
                      ? "border-yellow-500 text-yellow-700"
                      : "border-red-500 text-red-700"
                  }`}
                >
                  {formatarPace(user.mediaRitmo)}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="px-4 py-2 bg-primary text-white rounded">Ver Ranking</button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>🏅 Ranking por Nível</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="animate-spin" />
          </div>
        )}

        {rankings && (
          <div className="space-y-6">
            {renderNivel("Iniciantes", rankings.iniciante)}
            {renderNivel("Intermediários", rankings.intermediario)}
            {renderNivel("Avançados", rankings.avancado)}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
