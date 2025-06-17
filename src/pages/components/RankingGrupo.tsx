import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import axios from "axios"
import { Loader2 } from "lucide-react"

interface UsuarioRanking {
  userId: string
  nome: string
  foto: string
  mediaRitmo: number
}

interface RankingResponse {
  iniciante: UsuarioRanking[]
  intermediario: UsuarioRanking[]
  avancado: UsuarioRanking[]
}

interface Props {
  groupId: string
}

export function DialogRankingGrupo({ groupId }: Props) {
  const [rankings, setRankings] = useState<RankingResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!groupId) return
    setLoading(true)
    axios.get(`${import.meta.env.VITE_API_URL}/groups/${groupId}/rankings`)
      .then((res) => setRankings(res.data))
      .finally(() => setLoading(false))
  }, [groupId])

  const renderNivel = (titulo: string, lista: UsuarioRanking[]) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">{titulo}</h3>
      {lista.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum corredor neste nível ainda.</p>
      ) : (
        <ul className="space-y-2">
          {lista.map((user, idx) => (
            <li key={user.userId} className="flex items-center gap-3">
              <span className="font-bold w-6">{idx + 1}º</span>
              <img src={user.foto} alt={user.nome} className="w-8 h-8 rounded-full object-cover" />
              <span className="flex-1">{user.nome}</span>
              <Badge>{user.mediaRitmo.toFixed(2)} min/km</Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  )

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
          <div>
            {renderNivel('Iniciantes', rankings.iniciante)}
            {renderNivel('Intermediários', rankings.intermediario)}
            {renderNivel('Avançados', rankings.avancado)}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
