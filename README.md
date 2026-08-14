# PDF → OFX

Conversor de extratos bancários em PDF para arquivos OFX.

O projeto foi desenvolvido para facilitar a conversão de extratos bancários em PDF para um formato estruturado que possa ser utilizado em sistemas financeiros e contábeis.

## 🚀 Funcionalidades

- Upload de extrato bancário em PDF
- Extração de texto do PDF
- Identificação de datas e valores
- Processamento das movimentações bancárias
- Classificação das movimentações:
  - Movimentação
  - Aplicação
  - Resgate
  - Poupança
- Cálculo de quantidade de movimentações, entradas e saídas
- Visualização das movimentações em tabela
- Geração de arquivo OFX
- Download do arquivo `.ofx`

## 🖥️ Fluxo

```text
Selecionar PDF
      ↓
Processar extrato
      ↓
Extrair movimentações
      ↓
Classificar transações
      ↓
Gerar OFX
      ↓
Baixar arquivo .ofx
```

## 🛠️ Tecnologias

### Backend
- Node.js
- TypeScript
- Express
- Multer
- pdf-parse

### Frontend
- React
- TypeScript
- Vite
- Axios
- CSS

### Controle de versão
- Git
- GitHub

## 📁 Estrutura

```text
pdf2ofx/
├── backend/
│   └── src/
│       ├── routes/
│       │   └── extrato.routes.ts
│       ├── services/
│       │   ├── extrato.service.ts
│       │   └── ofx.service.ts
│       └── server.ts
│
├── frontend/
│   └── src/
│       ├── services/
│       │   └── api.ts
│       ├── App.tsx
│       ├── App.css
│       └── main.tsx
│
└── .gitignore
```

## ⚙️ Instalação

### Clone o repositório

```bash
git clone https://github.com/haylla/pdf2ofx.git
cd pdf2ofx
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O Vite exibirá no terminal o endereço local para acessar a aplicação.

## 📄 Exemplo

O sistema transforma movimentações extraídas do PDF em dados estruturados:

```text
Data    Descrição                    Valor        Tipo
01/06   BOLETO PAGO GOOGLE BRASI     -1000.00     MOVIMENTACAO
01/06   Sispag BUSINESS VILLAGE      10000.00     MOVIMENTACAO
01/06   Apl Aplic Aut Mais            -6515.09    APLICACAO
02/06   Res Aplic Aut Mais             501.55     RESGATE
```

## 🔄 Geração do OFX

O arquivo gerado utiliza a estrutura OFX 1.02 e contém informações como banco, agência, conta, moeda, data, tipo, valor e descrição das transações.

Exemplo:

```xml
<STMTTRN>
    <TRNTYPE>DEBIT</TRNTYPE>
    <DTPOSTED>20260601120000</DTPOSTED>
    <TRNAMT>-1000.00</TRNAMT>
    <MEMO>BOLETO PAGO GOOGLE BRASI</MEMO>
</STMTTRN>
```

## ⚠️ Status

**Em desenvolvimento.**

A conversão de PDF para OFX e o download do arquivo já estão implementados.

A próxima etapa é validar a importação do OFX gerado em sistemas financeiros/contábeis reais e realizar eventuais ajustes de compatibilidade.

## 🔒 Segurança

Arquivos enviados para processamento são utilizados como arquivos temporários.

PDFs, arquivos OFX gerados, uploads, `node_modules` e variáveis de ambiente não devem ser versionados no Git.

## 📌 Próximos passos

- [ ] Validar importação do OFX em sistema financeiro real
- [ ] Ajustar compatibilidade do OFX conforme necessidade
- [ ] Adicionar identificador único das transações (`FITID`)
- [ ] Melhorar tratamento de diferentes layouts de extratos
- [ ] Adicionar validações de arquivo
- [ ] Melhorar mensagens de erro
- [ ] Testar diferentes bancos e formatos de extrato
- [ ] Deploy da aplicação

## 👩‍💻 Projeto

Desenvolvido por **Haila Laranjeira**.

Projeto criado com foco em automação de uma tarefa manual de conversão e tratamento de dados financeiros.
