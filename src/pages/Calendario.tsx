import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Endpoints } from '../utils/endpoints';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface Corrida {
  id: string;
  nome: string;
  data: string;
  local: string;
  link: string;
}

export default function Calendario() {
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const [corridas, setCorridas] = useState<Corrida[]>([]);

  useEffect(() => {
    fetch(Endpoints.CORRIDAS_PUBLICAS)
      .then((res) => res.json())
      .then((data) => setCorridas(data));
  }, []);

  const corridasDoDia = corridas.filter((c) => {
    const [year, month, day] = c.data.split('-').map(Number);
    const corridaData = new Date(year, month - 1, day);
    return corridaData.toDateString() === dataSelecionada.toDateString();
  });

  return (
    <div className="min-h-screen bg-black text-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-gray-900">Calendário de Corridas</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              onChange={(date) => setDataSelecionada(date as Date)}
              value={dataSelecionada}
              tileClassName={({ date }) => {
                const temCorrida = corridas.some((c) => {
                  const [year, month, day] = c.data.split('-').map(Number);
                  const corridaData = new Date(year, month - 1, day);
                  return corridaData.toDateString() === date.toDateString();
                });

                return temCorrida ? 'has-corrida' : undefined;
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">
              Corridas em {dataSelecionada.toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {corridasDoDia.length === 0 ? (
              <p className="text-gray-500">Nenhuma corrida cadastrada para este dia.</p>
            ) : (
              <ul className="space-y-4">
                {corridasDoDia.map((c) => (
                  <li key={c.id} className="border p-4 rounded bg-white text-gray-900 shadow">
                    <p className="font-bold text-lg">{c.nome}</p>
                    <p className="text-sm text-muted-foreground">{c.local}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">Evento Oficial</Badge>
                      <a
                        href={c.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-sm"
                      >
                        Link de inscrição
                      </a>
                    </div>
                    <Separator className="mt-4" />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
