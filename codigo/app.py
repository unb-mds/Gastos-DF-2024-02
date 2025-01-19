from flask import Flask, render_template, Response, request, send_file, jsonify
import json
import os
from datetime import datetime
from fpdf import FPDF
import reportlab
from io import BytesIO
import matplotlib.pyplot as plt
import base64
from reportlab.lib.pagesizes import letter, landscape, A4
from reportlab.platypus import SimpleDocTemplate, Image, Spacer, Paragraph, Table, TableStyle, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors

app = Flask(__name__)

DATA_DIR = "../actions/json"

def carregar_dados_compras():
    json_path = os.path.join(DATA_DIR, "compras.json")
    if os.path.exists(json_path):
        with open(json_path, "r", encoding="utf-8") as file:
            return json.load(file)
    return {}

def processar_dados_compras():
    traducao_meses = {
        'January': 'Janeiro',
        'February': 'Fevereiro',
        'March': 'Março',
        'April': 'Abril',
        'May': 'Maio',
        'June': 'Junho',
        'July': 'Julho',
        'August': 'Agosto',
        'September': 'Setembro',
        'October': 'Outubro',
        'November': 'Novembro',
        'December': 'Dezembro'
    }

    dados_compras = carregar_dados_compras()
    gastos_mensais = {}

    for data, itens in dados_compras.items():
        mes = datetime.strptime(data, "%Y-%m-%d").strftime("%B/%Y")
        mes_traduzido = f"{traducao_meses[mes.split('/')[0]]}/{mes.split('/')[1]}"

        total_pago = sum(
            float(item["Valor"].replace("R$", "").replace(".", "").replace(",", ".")) for item in itens
        )

        if total_pago > 0:
            gastos_mensais[mes_traduzido] = gastos_mensais.get(mes_traduzido, 0) + total_pago

    meses_ordenados = sorted(gastos_mensais.keys(), key=lambda x: datetime.strptime(x.replace('Janeiro', 'January')
                                                                                    .replace('Fevereiro', 'February')
                                                                                    .replace('Março', 'March')
                                                                                    .replace('Abril', 'April')
                                                                                    .replace('Maio', 'May')
                                                                                    .replace('Junho', 'June')
                                                                                    .replace('Julho', 'July')
                                                                                    .replace('Agosto', 'August')
                                                                                    .replace('Setembro', 'September')
                                                                                    .replace('Outubro', 'October')
                                                                                    .replace('Novembro', 'November')
                                                                                    .replace('Dezembro', 'December'), "%B/%Y"))

    pago = [gastos_mensais[mes] for mes in meses_ordenados]

    return {
        "labels": meses_ordenados,
        "pago": pago
    }

def processar_dados_tabela_compras():
    dados_compras = carregar_dados_compras()
    compras_detalhadas = []

    for data, itens in dados_compras.items():
        for item in itens:
            compras_detalhadas.append({
                "empresa": item["Empresa"],
                "cnpj": item["CNPJ"],
                "objeto": item["Objeto"],
                "valor": float(item["Valor"].replace("R$", "").replace(".", "").replace(",", ".")),
                "data": datetime.strptime(data, "%Y-%m-%d").strftime("%d/%m/%Y")
            })
    return compras_detalhadas

def listar_arquivos_despesas():
    return [
        f for f in os.listdir(DATA_DIR)
        if f.startswith("despesas_") and f.endswith(".json")
    ]

def processar_dados_despesas():
    despesas_por_orgao = {}
    arquivos = listar_arquivos_despesas()
    limite_minimo_percentual = 0.005

    for arquivo in arquivos:
        orgao = arquivo.replace("despesas_", "").replace(".json", "").replace("_", " ")
        json_path = os.path.join(DATA_DIR, arquivo)
        if os.path.exists(json_path):
            with open(json_path, "r", encoding="utf-8") as file:
                dados = json.load(file)

            anos = sorted({item["ano"] for item in dados})
            empenhado = []
            liquidado = []
            pago = []

            empenhado_media = sum(float(item["empenhado"].replace(".", "").replace(",", "."))
                                for item in dados) / len(anos)
            liquidado_media = sum(float(item["liquidado"].replace(".", "").replace(",", "."))
                                for item in dados) / len(anos)
            pago_media = sum(float(item["pago"].replace(".", "").replace(",", "."))
                           for item in dados) / len(anos)

            anos_validos = []

            for ano in anos:

                empenhado_val = sum(float(item["empenhado"].replace(".", "").replace(",", "."))
                                  for item in dados if item["ano"] == ano)
                liquidado_val = sum(float(item["liquidado"].replace(".", "").replace(",", "."))
                                  for item in dados if item["ano"] == ano)
                pago_val = sum(float(item["pago"].replace(".", "").replace(",", "."))
                             for item in dados if item["ano"] == ano)

                if (empenhado_val >= empenhado_media * limite_minimo_percentual):
                    empenhado.append(empenhado_val)

                if( liquidado_val >= liquidado_media * limite_minimo_percentual):
                    liquidado.append(liquidado_val)

                if(pago_val >= pago_media * limite_minimo_percentual):
                    pago.append(pago_val)

                anos_validos.append(str(ano))


            despesas_por_orgao[orgao] = {
                "labels": anos_validos,
                "empenhado": empenhado,
                "liquidado": liquidado,
                "pago": pago
            }

    return despesas_por_orgao

def carregar_todas_despesas():
    arquivos = listar_arquivos_despesas()
    despesas_por_orgao = {}

    for arquivo in arquivos:
        nome_orgao = arquivo.replace("despesas_", "").replace(".json", "").replace("_", " ")
        despesas_detalhadas = processar_dados_tabela_despesas(arquivo)
        if despesas_detalhadas:
            despesas_por_orgao[nome_orgao] = despesas_detalhadas

    return despesas_por_orgao or {}

def processar_dados_tabela_despesas(filename):
    json_path = os.path.join(DATA_DIR, filename)
    if os.path.exists(json_path):
        with open(json_path, "r", encoding="utf-8") as file:
            dados = json.load(file)
    else:
        return []

    despesas_detalhadas = []
    for item in dados:
        despesas_detalhadas.append({
            "ano": item["ano"],
            "orgao": item["orgao"],
            "codigoOrgao": item["codigoOrgao"],
            "empenhado": float(item["empenhado"].replace(".", "").replace(",", ".")),
            "liquidado": float(item["liquidado"].replace(".", "").replace(",", ".")),
            "pago": float(item["pago"].replace(".", "").replace(",", "."))
        })
    return despesas_detalhadas

@app.before_request
def adicionar_ano_contexto():

    from flask import g
    g.current_year = datetime.now().year

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/charts')
def charts():
    compras = processar_dados_compras()
    despesas_por_orgao = processar_dados_despesas()
    return render_template('charts.html',
                           compras=compras,
                           despesas_por_orgao=despesas_por_orgao)

@app.route('/tables')
def tables():
    compras = processar_dados_tabela_compras()
    despesas_por_orgao = carregar_todas_despesas()
    return render_template('tables.html', compras=compras, despesas_por_orgao=despesas_por_orgao)

@app.route('/download-graficos', methods=['POST'])
def download_graficos():
    try:
        data = request.get_json()
        graficos = data.get('graficos', [])

        buffer = BytesIO()

        doc = SimpleDocTemplate(
            buffer,
            pagesize=landscape(letter),
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )

        elements = []

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=30,
            alignment=1
        )

        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=20,
            alignment=1
        )

        for grafico in graficos:
            titulo = Paragraph(grafico['titulo'], subtitle_style)

            img_data = grafico['imagem'].split(',')[1]

            img_bytes = base64.b64decode(img_data)
            img_buffer = BytesIO(img_bytes)

            img = Image(img_buffer, width=9*inch, height=5*inch)

            elementos_grafico = [
                titulo,
                img,
                Spacer(1, 30)
            ]

            elements.append(KeepTogether(elementos_grafico))

        doc.build(elements)

        buffer.seek(0)

        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='graficos_gastos_df.pdf'
        )
    except Exception as e:
        return {"error": "Erro ao gerar PDF"}, 500

@app.route('/download-tabelas', methods=['POST'])
def download_tabelas():
    try:
        data = request.get_json()
        tabelas = data.get('tabelas', [])

        buffer = BytesIO()

        doc = SimpleDocTemplate(buffer, pagesize=landscape(A4))
        elements = []

        styles = getSampleStyleSheet()
        title_style = styles['Title']
        normal_style = styles['BodyText']

        elements.append(Paragraph("Monitoramento de Gastos Públicos - Tabelas", title_style))
        elements.append(Spacer(1, 12))

        page_width, _ = landscape(A4)
        usable_width = page_width - doc.leftMargin - doc.rightMargin

        for tabela in tabelas:
            headers = tabela['headers']
            rows = tabela['rows']

            elements.append(Paragraph("Tabela de Dados", normal_style))
            elements.append(Spacer(1, 12))

            num_columns = len(headers)
            col_width = usable_width / num_columns
            col_widths = [col_width] * num_columns

            data = [[Paragraph(str(cell), normal_style) for cell in row] for row in ([headers] + rows)]

            table = Table(data, colWidths=col_widths, repeatRows=1)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('WORDWRAP', (0, 0), (-1, -1), 'LTR'),
            ]))
            elements.append(table)
            elements.append(Spacer(1, 24))

        doc.build(elements)
        buffer.seek(0)

        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='tabelas_gastos_publicos.pdf'
        )
    except Exception as e:
        return {"error": "Erro ao gerar PDF"}, 500

if __name__ == '__main__':
    app.run(debug=True)
