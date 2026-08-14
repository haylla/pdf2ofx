import { gerarOFX } from "./ofx.service";
export interface Movimento {
    data: string;
    descricao: string;
    valor: number;
    tipo: "MOVIMENTACAO" | "APLICACAO" | "RESGATE" | "POUPANCA";
}

function identificarData(linha: string): string | null {
    const regex = /^\d{2}\/\d{2}/;
    const resultado = linha.match(regex);

    return resultado ? resultado[0] : null;
}

function identificarDadosConta(texto: string): {
    agencia: string;
    conta: string;
} {
    const resultado = texto.match(
        /Minha conta\s+([\d-]+)\s+Minha agência\s+(\d+)/
    );

    if (!resultado) {
        throw new Error("Não foi possível identificar agência e conta.");
    }

    return {
        conta: resultado[1],
        agencia: resultado[2]
    };
}

function converterValor(texto: string): number {
    let limpando = texto.endsWith("-")
        ? "-" + texto.slice(0, -1)
        : texto;

    limpando = limpando
        .replace(/\./g, "")
        .replace(",", ".");

    return parseFloat(limpando);
}

function encontrarValores(linha: string): string[] {
    const regex = /\d{1,3}(?:\.\d{3})*,\d{2}-?|\d+,\d{2}-?/g;

    return linha.match(regex) ?? [];
}

function identificarTipo(descricao: string): Movimento["tipo"] {
    const descricaoNormalizada = descricao.toUpperCase();

    if (descricaoNormalizada.startsWith("APL APLIC AUT MAIS")) {
        return "APLICACAO";
    }

    if (descricaoNormalizada.startsWith("RES APLIC AUT MAIS")) {
        return "RESGATE";
    }
    if (descricaoNormalizada.includes("BUSINESS 4004-8428")) {
        return "POUPANCA";
    }

    return "MOVIMENTACAO";
}
function parsearMovimentacao(
    linha: string,
    dataAtual: string
): Movimento | null {

    const valores = encontrarValores(linha);

    if (valores.length === 0) {
        return null;
    }

    const textoValor =
        valores.length >= 2
            ? valores[valores.length - 2]
            : valores[0];

    const valor = converterValor(textoValor);

    if (Number.isNaN(valor)) {
    return null;
    }

    const dataEncontrada = identificarData(linha);

    const data = dataEncontrada ?? dataAtual;

    let descricao = linha;

    if (dataEncontrada) {
        descricao = descricao.replace(dataEncontrada, "").trim();
    }

    for (const valorEncontrado of valores) {
    descricao = descricao
        .replace(valorEncontrado, "")
        .trim();
}
if (!descricao) {
    return null;
}

  const tipo = identificarTipo(descricao);

return {
    data,
    descricao,
    valor,
    tipo
};
}
function processarExtrato(texto: string): {
    movimentos: Movimento[];
    ofx: string;
} {

    const { agencia, conta } = identificarDadosConta(texto);

        console.log("Agência:", agencia);
        console.log("Conta:", conta);

    const linhas = texto.split("\n");

    const movimentos: Movimento[] = [];

    let dataAtual = "";

    for (const linha of linhas) {
    const linhaOriginal = linha.trim();
        
    if (!linhaOriginal) {
        continue;
    }
    if (linhaOriginal.includes("na conta corrente")) {
        console.log(
            "FIM DA MOVIMENTAÇÃO:",
            linhaOriginal
        );

        break;
    }

    const linhaLimpa =
        limparLinhaMovimentacao(linhaOriginal);

if (linhaOriginal.toLowerCase().includes("poupança automática")) {
    console.log(
        "POUPANÇA ENCONTRADA:",
        linhaOriginal
    );
}

    if (/^(?:\d{2}\/\d{2}\s+)?SALDO\b/i.test(linhaLimpa)) {
        console.log(
            "IGNORANDO SALDO:",
            linhaLimpa
        );

        continue;    
    }

        const dataEncontrada = identificarData(linhaLimpa);

        if (dataEncontrada) {
            dataAtual = dataEncontrada;
        }

        if (!dataAtual) {
            continue;
        }

        function limparLinhaMovimentacao(linha: string): string {
         return linha
        .replace(/^D = débito a compensar\s+/i, "")
        .replace(/^G = aplicação programada\s+/i, "")
        /*.replace(/^P = poupança automática\s+Business 4004-8428\s+/i, "")*/
        .replace(/^Para demais siglas.*?Sispag\s+/i, "Sispag ")
        .replace(/^Explicativas no final do extrato\s+/i, "");
        }

        const movimento = parsearMovimentacao(
            linhaLimpa,
            dataAtual
        );

        if (movimento) {
            if (!movimento.descricao) {
                console.log(
                    "MOVIMENTO SEM DESCRIÇÃO:",
                    linhaLimpa
                );
                continue;
            }

            movimentos.push(movimento);
        }
    }

    const ofx = gerarOFX(
    movimentos,
    agencia,
    conta
);

    console.log("========== OFX GERADO ==========");
    console.log(ofx);
    console.log("================================");

    return {
    movimentos,
    ofx
};
    
}
export {
    processarExtrato
};
