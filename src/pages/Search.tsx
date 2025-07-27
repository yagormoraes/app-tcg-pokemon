// src/pages/Search.tsx
import { useEffect, useState, useRef } from 'react';
import { Card } from '../types/Card';
import Spinner from '../components/Spinner';

export default function Search() {
  const pageSize = 12;
  const [cards, setCards] = useState<Card[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [types, setTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [sets, setSets] = useState<{ id: string; name: string }[]>([]);
  const [selectedSet, setSelectedSet] = useState('');

  const cacheRef = useRef<Record<number, Card[]>>({});
  const totalPages = Math.ceil(totalCount / pageSize);
  const headers = { 'X-Api-Key': process.env.REACT_APP_POKEMON_TCG_API_KEY! };
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [typesRes, setsRes] = await Promise.all([
          fetch('https://api.pokemontcg.io/v2/types', { headers }),
          fetch('https://api.pokemontcg.io/v2/sets?pageSize=1000', { headers }),
        ]);
        const typesJson = await typesRes.json();
        setTypes(typesJson.data);
        const setsJson = await setsRes.json();
        setSets(setsJson.data);
      } catch (err) {
        console.error('Erro ao buscar filtros:', err);
      }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    const fetchCards = async (pg: number) => {
      if (cacheRef.current[pg]) {
        setCards(cacheRef.current[pg]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.pokemontcg.io/v2/cards?page=${pg}&pageSize=${pageSize}`,
          { headers: { 'X-Api-Key': process.env.REACT_APP_POKEMON_TCG_API_KEY! } }
        );
        const json = await res.json();
        cacheRef.current[pg] = json.data;
        setCards(json.data);
        setTotalCount(json.totalCount);
        const next = pg + 1;
        if (next <= totalPages && !cacheRef.current[next]) {
          fetchCards(next);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCards(page);
  }, [page, totalPages]);

  useEffect(() => {
    cacheRef.current = {};
    setPage(1);
  }, [searchTerm, selectedType, selectedSet]);

  useEffect(() => {
    const fetchCards = async (pg: number) => {
      const filterQueries: string[] = [];
      if (searchTerm) filterQueries.push(`name:${searchTerm}`);
      if (selectedType) filterQueries.push(`types:${selectedType}`);
      if (selectedSet) filterQueries.push(`set.id:${selectedSet}`);
      const qParam = filterQueries.length ? `&q=${filterQueries.join(' ')}` : '';

      const cacheKey = Number(`${pg}-${searchTerm}-${selectedType}-${selectedSet}`)
      if (cacheRef.current[cacheKey]) {
        setCards(cacheRef.current[cacheKey]);
        return;
      }

      setLoading(true);
      try {
        const url = `https://api.pokemontcg.io/v2/cards?page=${pg}&pageSize=${pageSize}${qParam}`;
        const res = await fetch(url, { headers });
        const json = await res.json();
        cacheRef.current[cacheKey] = json.data;
        setCards(json.data);
        setTotalCount(json.totalCount);
      } catch (err) {
        console.error('Erro ao buscar cards:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCards(page);
  }, [page, pageSize, searchTerm, selectedType, selectedSet]);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Procurar Itens</h1>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar por nome"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 border p-2 rounded"
        />
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Todos os tipos</option>
          {types.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={selectedSet}
          onChange={e => setSelectedSet(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Todos os conjuntos</option>
          {sets.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      {selectedCard && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="bg-white rounded-lg w-[40vw] p-6 relative overflow-auto max-h-[80vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Botão de fechar */}
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            {/* Flex container: imagem à esquerda, texto à direita */}
            <div className="flex items-start">
              {/* Imagem */}
              <img
                src={selectedCard.images.large}
                alt={selectedCard.name}
                className="w-32 h-32 object-contain flex-shrink-0"
              />

              {/* Conteúdo textual */}
              <div className="ml-6 flex-1 overflow-auto">
                <h2 className="text-2xl font-bold mb-2">{selectedCard.name}</h2>

                {selectedCard.supertype && (
                  <p className="mb-1"><strong>Tipo:</strong> {selectedCard.supertype}</p>
                )}
                {selectedCard.subtypes && (
                  <p className="mb-1">
                    <strong>Subtipos:</strong> {selectedCard.subtypes.join(', ')}
                  </p>
                )}
                {selectedCard.types && (
                  <p className="mb-1">
                    <strong>Elementos:</strong> {selectedCard.types.join(', ')}
                  </p>
                )}
                {selectedCard.hp && (
                  <p className="mb-1"><strong>HP:</strong> {selectedCard.hp}</p>
                )}

                {selectedCard.attacks && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Ataques:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedCard.attacks.map((atk, i) => (
                        <li key={i}>
                          <strong>{atk.name}</strong> ({atk.damage})
                          {atk.text && <><br /><small className="text-gray-600">{atk.text}</small></>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedCard.set && (
                  <p className="mt-4">
                    <strong>Coleção:</strong> {selectedCard.set.name} ({selectedCard.set.releaseDate})
                  </p>
                )}

                {selectedCard.tcgplayer?.prices && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Preços</h3>
                    {Object.entries(selectedCard.tcgplayer.prices).map(
                      ([variant, priceObj]) =>
                        priceObj && (
                          <div key={variant} className="mb-3">
                            <h4 className="font-medium capitalize">{variant}</h4>
                            <ul className="list-disc list-inside text-sm ml-4">
                              {Object.entries(priceObj).map(([tier, value]) =>
                                typeof value === 'number' ? (
                                  <li key={tier}>
                                    {tier.charAt(0).toUpperCase() + tier.slice(1)}: ${value.toFixed(2)}
                                  </li>
                                ) : null
                              )}
                            </ul>
                          </div>
                        )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Spinner ou grid */}
      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cards.map(card => (
            <div
              key={card.id}
              onClick={() => !loading && setSelectedCard(card)}
              className="cursor-pointer bg-white rounded-lg shadow p-2 flex flex-col items-center hover:shadow-lg transition"
            >
              <img src={card.images.small} alt={card.name} className="mb-2 w-20 h-20 object-contain" />
              <span className="text-center text-sm">{card.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      <div className="flex justify-center items-center space-x-4 mt-6">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <span>Página {page} de {totalPages || 1}</span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || loading}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
