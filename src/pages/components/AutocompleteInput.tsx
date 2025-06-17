import { useState, useEffect, useRef } from "react";

interface Suggestion {
  label: string;
  coordinates: [number, number];
}

interface Props {
  label: string;
  onSelect: (coord: [number, number], label: string) => void;
}

export default function AutocompleteInput({ label, onSelect }: Props) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(
          `https://api.openrouteservice.org/geocode/autocomplete?api_key=5b3ce3597851110001cf624801f8288f2e4a4754a0a717d539980f65&text=${encodeURIComponent(
            input
          )}`
        );
        const data = await res.json();
        const results = data.features
          .filter(
            (feature: any) =>
              Array.isArray(feature.geometry.coordinates) &&
              feature.geometry.coordinates.length === 2 &&
              typeof feature.geometry.coordinates[0] === "number" &&
              typeof feature.geometry.coordinates[1] === "number"
          )
          .map((feature: any) => ({
            label: feature.properties.label,
            coordinates: feature.geometry.coordinates as [number, number],
          }));
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Erro ao buscar sugestões:", err);
      }
    };

    const delay = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(delay);
  }, [input]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mb-4 relative" ref={containerRef}>
      <label className="block mb-1">{label}</label>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setShowSuggestions(true);
        }}
        className="border rounded px-3 py-2 w-full"
        placeholder="Digite um endereço"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute w-full border mt-1 bg-white z-10 max-h-60 overflow-y-auto shadow-lg rounded">
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              onClick={() => {
                onSelect(s.coordinates, s.label);
                setInput(s.label);
                setSuggestions([]);
                setShowSuggestions(false);
              }}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
