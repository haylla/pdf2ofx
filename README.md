# PDF → OFX

Conversor de extratos bancários em PDF para arquivos OFX.

O projeto foi desenvolvido para facilitar a conversão de extratos bancários em PDF para um formato estruturado que possa ser utilizado em sistemas financeiros e contábeis.

## Funcionalidades

- Upload de extrato bancário em PDF
- Extração de texto do PDF
- Identificação de datas e valores
- Processamento das movimentações bancárias
- Classificação das movimentações:
  - Movimentação
  - Aplicação
  - Resgate
  - Poupança
- Cálculo de:
  - Quantidade de movimentações
  - Total de entradas
  - Total de saídas
- Visualização das movimentações em tabela
- Geração de arquivo OFX
- Download do arquivo `.ofx`

## Interface

O sistema possui uma interface web para seleção e processamento do extrato.

Fluxo principal:

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

