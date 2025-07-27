export default function Search() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Procurar Itens</h1>
      {/* Aqui ficará seu componente de busca */}
      <input
        type="text"
        placeholder="Digite o nome do item..."
        className="w-full p-2 border rounded"
      />
    </div>
  );
}
