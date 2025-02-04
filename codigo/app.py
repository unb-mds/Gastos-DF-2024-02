import base64
from datetime import datetime
from io import BytesIO

from flask import Flask, g, render_template, request, send_file
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape, letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Image,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from utils.carregador_dados import CarregadorDados
from utils.processador_dados import ProcessadorDados

app = Flask(__name__)

carregador = CarregadorDados()
processador = ProcessadorDados(carregador)


@app.before_request
def adicionar_ano_contexto():
    g.current_year = datetime.now().year


@app.route("/")
def pagina_inicial():
    return render_template("index.html")


@app.route("/graficos")
def pagina_graficos():
    compras = processador.processar_dados_compras()
    despesas_por_orgao = processador.processar_dados_despesas()
    return render_template(
        "graficos.html", compras=compras, despesas_por_orgao=despesas_por_orgao
    )


@app.route("/tabelas")
def pagina_tabelas():
    compras = processador.processar_dados_tabela_compras()
    dados_despesas, anos_unicos = processador.processar_dados_tabela_despesas()

    return render_template(
        "tabelas.html",
        compras=compras,
        despesas_por_orgao=dados_despesas,
        anos_unicos=anos_unicos,
    )


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/baixar-graficos", methods=["POST"])
def baixar_graficos():
    try:
        dados = request.get_json()
        graficos = dados.get("graficos", [])

        buffer = BytesIO()

        doc = SimpleDocTemplate(
            buffer,
            pagesize=landscape(letter),
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72,
        )

        elementos = []

        estilos = getSampleStyleSheet()
        estilo_subtitulo = ParagraphStyle(
            "EstiloSubtitulo",
            parent=estilos["Heading2"],
            fontSize=14,
            spaceAfter=20,
            alignment=1,
        )

        for grafico in graficos:
            titulo = Paragraph(grafico["titulo"], estilo_subtitulo)

            dados_img = grafico["imagem"].split(",")[1]
            bytes_img = base64.b64decode(dados_img)
            buffer_img = BytesIO(bytes_img)

            img = Image(buffer_img, width=9 * inch, height=5 * inch)

            elementos_grafico = [titulo, img, Spacer(1, 30)]

            elementos.append(KeepTogether(elementos_grafico))

        doc.build(elementos)

        buffer.seek(0)

        return send_file(
            buffer,
            mimetype="application/pdf",
            as_attachment=True,
            download_name="graficos_gastos_df.pdf",
        )
    except Exception as e:
        return {"erro": f"Erro ao gerar PDF: {str(e)}"}, 500


@app.route("/baixar-tabelas", methods=["POST"])
def baixarTabelas():
    try:
        dados = request.get_json()
        if not dados or "tabelas" not in dados:
            return {"erro": "Nenhuma tabela fornecida"}, 400

        tabelas = dados["tabelas"]

        # Título dinâmico recebido do frontend
        titulo_dinamico = tabelas[0].get(
            "titulo", "Monitoramento de Gastos Públicos"
        )

        buffer = BytesIO()

        doc = SimpleDocTemplate(
            buffer,
            pagesize=landscape(A4),
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36,
        )

        elementos = []

        estilos = getSampleStyleSheet()
        estilo_titulo = estilos["Title"]
        estilo_normal = estilos["BodyText"]

        # Adiciona o título dinâmico no topo do PDF
        elementos.append(Paragraph(titulo_dinamico, estilo_titulo))
        elementos.append(Spacer(1, 12))

        largura_pagina, _ = landscape(A4)
        largura_utilizavel = largura_pagina - doc.leftMargin - doc.rightMargin

        for indice, tabela in enumerate(tabelas, 1):
            if not all(chave in tabela for chave in ["cabecalhos", "linhas"]):
                continue

            cabecalhos = tabela["cabecalhos"]
            linhas = tabela["linhas"]

            # Adiciona uma subtabela indicando qual tabela está sendo gerada
            elementos.append(Paragraph(f"Tabela {indice}", estilo_normal))
            elementos.append(Spacer(1, 6))

            num_colunas = len(cabecalhos)
            largura_coluna = largura_utilizavel / num_colunas
            larguras_colunas = [largura_coluna] * num_colunas

            dados = [
                [Paragraph(str(celula), estilo_normal) for celula in linha]
                for linha in ([cabecalhos] + linhas)
            ]

            tabela_pdf = Table(dados, colWidths=larguras_colunas, repeatRows=1)
            tabela_pdf.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("FONTSIZE", (0, 0), (-1, -1), 8),
                        ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                        ("GRID", (0, 0), (-1, -1), 1, colors.black),
                        ("LEFTPADDING", (0, 0), (-1, -1), 6),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                        ("TOPPADDING", (0, 0), (-1, -1), 6),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                        ("WORDWRAP", (0, 0), (-1, -1), "LTR"),
                    ]
                )
            )

            elementos.append(tabela_pdf)
            elementos.append(Spacer(1, 24))

        doc.build(elementos)
        buffer.seek(0)

        # Define o nome do arquivo usando o título dinâmico
        nome_arquivo = f"{titulo_dinamico.replace(' ', '_')}.pdf"

        return send_file(
            buffer,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=nome_arquivo,
        )

    except Exception as e:
        print(f"Erro ao gerar PDF: {str(e)}")
        return {"erro": f"Erro ao gerar PDF: {str(e)}"}, 500


if __name__ == "__main__":
    app.run(debug=True)
