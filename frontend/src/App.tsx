import { useState } from "react";
import "./App.css";
import api from "./services/api";

interface Movimento {
  data: string;
  descricao: string;
  valor: number;
  tipo: "MOVIMENTACAO" | "APLICACAO" | "RESGATE" | "POUPANCA";
}

function App() {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [movimentacoes, setMovimentacoes] = useState<Movimento[]>([]);
  const [ofx, setOfx] = useState("");
 const totalEntradas = movimentacoes
  .filter(
    (movimento) =>
      movimento.tipo === "MOVIMENTACAO" &&
      movimento.valor > 0
  )
  .reduce((total, movimento) => total + movimento.valor, 0);

const totalSaidas = movimentacoes
 .filter(
    (movimento) =>
        (movimento.tipo === "MOVIMENTACAO" ||
         movimento.tipo === "POUPANCA") &&
        movimento.valor < 0
)
  .reduce((total, movimento) => total + Math.abs(movimento.valor), 0);

const quantidadeMovimentos = movimentacoes.length;

const formatarMoeda = (valor: number) => {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};
  const [processando, setProcessando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  function selecionarArquivo(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setArquivo(file);
  }
  async function processarExtrato() {
    if (!arquivo) {
        return;
    }

    try {
        setProcessando(true);
        setMensagem("");

        const formData = new FormData();

        formData.append("arquivo", arquivo);

        const response = await api.post(
            "/api/extrato/upload",
            formData
        );

        console.log("Resposta do backend:", response.data);

        setMensagem(response.data.mensagem);

        setMovimentacoes(response.data.movimentacoes);

        setOfx(response.data.ofx);

    } catch (error) {
        console.error("Erro ao processar extrato:", error);

        setMensagem("Erro ao processar o extrato.");
    } finally {
        setProcessando(false);
    }
}
function baixarOFX() {
  if (!ofx) {
    return;
  }

  const blob = new Blob([ofx], {
    type: "application/x-ofx",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = "extrato.ofx";

  link.click();

  URL.revokeObjectURL(url);
}
  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>PDF → OFX</h1>
          <p>Conversor de extratos bancários</p>
        </div>
      </header>

      <main className="container">
        <section className="upload-card">
          <div className="icon">📄</div>

          <h2>Envie seu extrato</h2>

          <p>
            Selecione um arquivo PDF para transformar seu extrato
            em um arquivo OFX.
          </p>

          <label className="upload-button">
            Selecionar PDF
            <input
              type="file"
              accept=".pdf"
              onChange={selecionarArquivo}
            />
          </label>

          {arquivo && (
            <div className="file-selected">
              <strong>Arquivo selecionado:</strong>
              <span>{arquivo.name}</span>
            </div>
          )}

          <button
            className="process-button"
            disabled={!arquivo || processando}
            onClick={processarExtrato}
        >
            {processando ? "Processando..." : "Processar extrato"}
        </button>
                {mensagem && (
            <div className="message">
                {mensagem}
            </div>
        )}
        </section>
        <section className="result-card">
        <button
            className="download-button"
            disabled={!ofx}
            onClick={baixarOFX}
          >
          Baixar OFX
        </button>
</section>
        <div className="resumo">
  <div className="card-resumo">
    <span>Movimentações</span>
    <strong>{quantidadeMovimentos}</strong>
  </div>

  <div className="card-resumo">
    <span>Entradas</span>
    <strong>{formatarMoeda(totalEntradas)}</strong>
  </div>

  <div className="card-resumo">
    <span>Saídas</span>
    <strong>{formatarMoeda(totalSaidas)}</strong>
  </div>
</div>
        {movimentacoes.length > 0 && (
  <div className="table-container">
    <h3>Movimentações</h3>

    <table>
      <thead>
        <tr>
        <th>Data</th>
        <th>Descrição</th>
        <th>Tipo</th>
        <th>Valor</th>
      </tr>
      </thead>

      <tbody>
        {movimentacoes.map((movimento, index) => (
          <tr key={index}>
            <td>{movimento.data}</td>
            <td>{movimento.descricao}</td>
            <td>{movimento.tipo}</td>
            <td>
              {movimento.valor.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
      </main>
    </div>
  );
}

export default App;