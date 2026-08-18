import { Router } from "express";
import multer from "multer";
import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import { processarExtrato } from "../services/extrato.service";

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 4 * 1024 * 1024
    }
});

router.post("/upload", upload.single("arquivo"), async (req, res) => {
    try {
        console.log("1 - Arquivo recebido:", req.file);

        if (!req.file) {
            return res.status(400).json({
                mensagem: "Nenhum arquivo foi enviado."
            });
        }

        console.log("2 - Lendo arquivo...");

        const buffer = req.file.buffer;

        console.log("3 - Arquivo lido. Tamanho:", buffer.length);

        const parser = new PDFParse({
            data: buffer
        });

        console.log("4 - Parser criado.");

        const pdf = await parser.getText();

        console.log("Quantidade de caracteres:", pdf.text.length);

        console.log("5 - PDF processado!");

 console.log("========== TEXTO DO PDF ==========");
console.log(pdf.text.substring(0, 2000));
console.log("===================================");

await parser.destroy();

console.log("6 - Parser destruído.");

const resultado = processarExtrato(pdf.text);

const movimentos = resultado.movimentos;
const ofx = resultado.ofx;

console.log("========== MOVIMENTOS ==========");

movimentos.forEach((movimento, index) => {
    console.log(
        index + 1,
        "|",
        movimento.data,
        "|",
        movimento.descricao,
        "|",
        movimento.valor,
        "|",
        movimento.tipo
    );
});

console.log("================================");

console.log("Quantidade de movimentos:", movimentos.length);

res.json({
    mensagem: "Extrato processado com sucesso!",
    arquivo: req.file.originalname,
    caracteresExtraidos: pdf.text.length,
    quantidadeMovimentos: movimentos.length,
    movimentacoes: movimentos,
    ofx
});

    } catch (error) {
        console.error("ERRO AO PROCESSAR PDF:", error);

        res.status(500).json({
            mensagem: "Erro ao processar o PDF."
        });
    }
});


export default router;