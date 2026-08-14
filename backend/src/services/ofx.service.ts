import type { Movimento } from "./extrato.service";

export function gerarOFX(
    movimentos: Movimento[],
    agencia: string,
    conta: string
): string {
    const transacoes = movimentos
        .map((movimento) => {
            return `
        <STMTTRN>
            <TRNTYPE>${movimento.valor < 0 ? "DEBIT" : "CREDIT"}</TRNTYPE>
            <DTPOSTED>${formatarData(movimento.data)}</DTPOSTED>
            <TRNAMT>${movimento.valor.toFixed(2)}</TRNAMT>
            <MEMO>${escaparXML(movimento.descricao)}</MEMO>
        </STMTTRN>`;
        })
        .join("");

    return `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
    <SIGNONMSGSRSV1>
        <SONRS>
            <STATUS>
                <CODE>0</CODE>
                <SEVERITY>INFO</SEVERITY>
            </STATUS>
            <DTSERVER>${formatarDataServidor()}</DTSERVER>
            <LANGUAGE>POR</LANGUAGE>
        </SONRS>
    </SIGNONMSGSRSV1>

    <BANKMSGSRSV1>
        <STMTTRNRS>
            <TRNUID>1</TRNUID>

            <STMTRS>
                <CURDEF>BRL</CURDEF>

               <BANKACCTFROM>
                <BANKID>341</BANKID>
                <BRANCHID>${agencia}</BRANCHID>
                <ACCTID>${conta}</ACCTID>
                <ACCTTYPE>CHECKING</ACCTTYPE>
                 </BANKACCTFROM>

                <BANKTRANLIST>
                    ${transacoes}
                </BANKTRANLIST>

            </STMTRS>
        </STMTTRNRS>
    </BANKMSGSRSV1>
</OFX>`;
}

function formatarData(data: string): string {
    const [dia, mes] = data.split("/");

    return `2026${mes}${dia}120000`;
}

function formatarDataServidor(): string {
    const agora = new Date();

    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");

    return `${ano}${mes}${dia}120000`;
}

function escaparXML(texto: string): string {
    return texto
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}