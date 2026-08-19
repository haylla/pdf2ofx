import { gerarOFX } from "./ofx.service";

export interface Movimento {
    data: string;
    descricao: string;
    valor: number;
    tipo: "MOVIMENTACAO" | "APLICACAO" | "RESGATE" | "POUPANCA";
}

function identificarData(linha: string): string | null {
    const regex = /^(\d{2}\/\d{2})(?:\/\d{4})?/;
    const resultado = linha.match(regex);

    return resultado ? resultado[1] : null;
}

function identificarDadosConta(texto: string): {
    agencia: string;
    conta: string;
} {
    const formatoNovo = texto.match(
        /Agência\s+(\d+)\s+Conta\s+([\d-]+)/
    );

    if (formatoNovo) {
        return {
            agencia: formatoNovo[1],
            conta: formatoNovo[2]
        };
    }

    const formatoAntigo = texto.match(
        /Minha conta\s+([\d-]+)\s+Minha agência\s+(\d+)/
    );

    if (formatoAntigo) {
        return {
            conta: formatoAntigo[1],
            agencia: formatoAntigo[2]
        };
    }

    throw new Error(
        "Não foi possível identificar agência e conta no extrato."
    );
}

function converterValor(texto: string): number {
    const negativo =
        texto.startsWith("-") || texto.endsWith("-");

    let limpando = texto
        .replace(/^-/, "")
        .replace(/-$/, "")
        .replace(/\./g, "")
        .replace(",", ".");

    const valor = parseFloat(limpando);

    return negativo ? -valor : valor;
}

function encontrarValores(linha: string): string[] {
    const regex = /-?(?:\d{1,3}(?:\.\d{3})*|\d+),\d{2}-?/g;

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
        const dataCompleta = linha.match(
            /^\d{2}\/\d{2}(?:\/\d{4})?/
        )?.[0];

        if (dataCompleta) {
            descricao = descricao
                .replace(dataCompleta, "")
                .trim();
        }
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

function agruparMovimentacoes(linhas: string[]): string[] {
    const grupos: string[] = [];
    let grupoAtual: string[] = [];

    for (const linha of linhas) {
        const linhaLimpa = linha.trim();

        if (!linhaLimpa) {
            continue;
        }

        const temData =
            /^\d{2}\/\d{2}(?:\/\d{4})?\b/.test(
                linhaLimpa
            );

        if (temData) {
            if (grupoAtual.length > 0) {
                grupos.push(
                    grupoAtual.join(" ")
                );
            }

            grupoAtual = [linhaLimpa];
        } else if (grupoAtual.length > 0) {
            grupoAtual.push(linhaLimpa);
        }
    }

    if (grupoAtual.length > 0) {
        grupos.push(
            grupoAtual.join(" ")
        );
    }

    return grupos;
}

function limparLinhaMovimentacao(
    linha: string
): string {
    return linha
        .replace(
            /^D = débito a compensar\s+/i,
            ""
        )
        .replace(
            /^G = aplicação programada\s+/i,
            ""
        )
        .replace(
            /^Para demais siglas.*?Sispag\s+/i,
            "Sispag "
        )
        .replace(
            /^Explicativas no final do extrato\s+/i,
            ""
        );
}

function ehModeloNovo(texto: string): boolean {
    return /Agência\s+\d+\s+Conta\s+[\d-]+/i.test(
        texto
    );
}

function processarExtrato(texto: string): {
    movimentos: Movimento[];
    ofx: string;
} {
    const { agencia, conta } =
        identificarDadosConta(texto);

    console.log("Agência:", agencia);
    console.log("Conta:", conta);

    const movimentos: Movimento[] = [];

    /*
     * MODELO NOVO
     *
     * Exemplo:
     * Agência 0274 Conta 0098751-0
     *
     * Nesse modelo as movimentações podem
     * ocupar várias linhas.
     */
    if (ehModeloNovo(texto)) {

        console.log(
            "MODELO NOVO DETECTADO"
        );

        const linhas = texto.split("\n");

        const grupos =
            agruparMovimentacoes(linhas);

        for (const grupo of grupos) {

            const linhaOriginal =
                grupo.trim();

            if (!linhaOriginal) {
                continue;
            }

            const linhaLimpa =
                limparLinhaMovimentacao(
                    linhaOriginal
                );

            /*
             * Ignora linhas de saldo.
             */
            if (
                /^(?:\d{2}\/\d{2}(?:\/\d{4})?\s+)?SALDO\b/i.test(
                    linhaLimpa
                )
            ) {
                console.log(
                    "IGNORANDO SALDO:",
                    linhaLimpa
                );

                continue;
            }

            const dataEncontrada =
                identificarData(
                    linhaLimpa
                );

            if (!dataEncontrada) {
                continue;
            }

            const movimento =
                parsearMovimentacao(
                    linhaLimpa,
                    dataEncontrada
                );

            if (movimento) {
                movimentos.push(
                    movimento
                );
            }
        }

    } else {

        /*
         * MODELO ANTIGO
         *
         * Mantemos o comportamento
         * que já funcionava antes
         * do agrupamento.
         */

        console.log(
            "MODELO ANTIGO DETECTADO"
        );

        const linhas =
            texto.split("\n");

        let dataAtual = "";

        for (const linha of linhas) {

            const linhaOriginal =
                linha.trim();

            if (!linhaOriginal) {
                continue;
            }

            if (
                linhaOriginal.includes(
                    "na conta corrente"
                )
            ) {
                console.log(
                    "FIM DA MOVIMENTAÇÃO:",
                    linhaOriginal
                );

                break;
            }

            const linhaLimpa =
                limparLinhaMovimentacao(
                    linhaOriginal
                );

            if (
                linhaOriginal
                    .toLowerCase()
                    .includes(
                        "poupança automática"
                    )
            ) {
                console.log(
                    "POUPANÇA ENCONTRADA:",
                    linhaOriginal
                );
            }

            /*
             * Ignora saldo.
             */
            if (
                /^(?:\d{2}\/\d{2}(?:\/\d{4})?\s+)?SALDO\b/i.test(
                    linhaLimpa
                )
            ) {
                console.log(
                    "IGNORANDO SALDO:",
                    linhaLimpa
                );

                continue;
            }

            const dataEncontrada =
                identificarData(
                    linhaLimpa
                );

            if (dataEncontrada) {
                dataAtual =
                    dataEncontrada;
            }

            if (!dataAtual) {
                continue;
            }

            const movimento =
                parsearMovimentacao(
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

                movimentos.push(
                    movimento
                );
            }
        }
    }

    console.log(
        "Quantidade de movimentos:",
        movimentos.length
    );

    const ofx = gerarOFX(
        movimentos,
        agencia,
        conta
    );

    console.log(
        "========== OFX GERADO =========="
    );

    console.log(ofx);

    console.log(
        "================================"
    );

    return {
        movimentos,
        ofx
    };
}

export {
    processarExtrato
};