import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { ptBR } from "date-fns/locale";
import { parse, startOfWeek, format, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "pt-BR": ptBR };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const events = [
  {
    id: 1,
    title: "Evento Teste",
    start: new Date(),
    end: new Date(),
  }
];

export default function SoBigCalendar() {
  return (
    <div style={{ height: 600, background: "#fff", padding: 24 }}>
      <h1>Teste react-big-calendar</h1>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500, background: "#fff", borderRadius: 12, padding: 10 }}
        messages={{
          today: "Hoje",
          previous: "Anterior",
          next: "Próximo",
          month: "Mês",
          week: "Semana",
          day: "Dia",
          agenda: "Agenda",
          showMore: (total: number) => `+${total} mais`,
        }}
      />
    </div>
  );
}
