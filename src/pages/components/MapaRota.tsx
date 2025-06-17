import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Corrige o ícone padrão que não aparece corretamente em alguns ambientes
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Props {
  rota: any;
}

export default function MapaRota({ rota }: Props) {

  // Converte coordenadas [lng, lat] para [lat, lng]
  const pontos: [number, number][] = rota
    ? rota.features[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]])
    : [];

  const inicio = pontos[0];
  const fim = pontos[pontos.length - 1];
  

  return (
    <MapContainer
      center={inicio || [0, 0]}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pontos.length > 0 && (
        <>
          <Polyline positions={pontos} color="blue" />
          <Marker position={inicio}>
            <Popup>Início</Popup>
          </Marker>
          <Marker position={fim}>
            <Popup>Fim</Popup>
          </Marker>
        </>
      )}
    </MapContainer>
  );
}
