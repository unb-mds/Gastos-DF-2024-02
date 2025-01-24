from flask import Flask, render_template, Response, request, send_file, jsonify, g
from datetime import datetime
from io import BytesIO
import base64
import json

from utils.carregador_dados import CarregadorDados
from utils.processador_dados import ProcessadorDados
from utils.conversores import converter_valor_monetario, formatar_data

from reportlab.lib.pagesizes import letter, landscape, A4
from reportlab.platypus import (
    SimpleDocTemplate, Image, Spacer, 
    Paragraph, Table, TableStyle, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors

app = Flask(__name__)


carregador = CarregadorDados()
processador = ProcessadorDados(carregador)

@app.before_request
def adicionar_ano_contexto():
    g.current_year = datetime.now().year

@app.route('/')
def pagina_inicial():
    return render_template('index.html')

@app.route('/graficos')
def pagina_graficos():
    compras = processador.processar_dados_compras()
    despesas_por_orgao = processador.processar_dados_despesas()
    return render_template('graficos.html',
                           compras=compras,
                           despesas_por_orgao=despesas_por_orgao)

@app.route('/tabelas')
def pagina_tabelas():
    compras = processador.processar_dados_tabela_compras()
    despesas_por_orgao = {}
    arquivos = carregador.listar_arquivos_despesas()
    
    for arquivo in arquivos:
        nome_orgao = arquivo.replace("despesas_", "").replace(".json", "").replace("_", " ")
        dados = carregador.carregar_dados_despesas(arquivo)
        
        despesas_detalhadas = []
        for item in dados:
            despesas_detalhadas.append({
                "ano": item["ano"],
                "orgao": item.get("orgao", nome_orgao),
                "codigoOrgao": item.get("codigoOrgao", ""),
                "empenhado": converter_valor_monetario(item["empenhado"]),
                "liquidado": converter_valor_monetario(item["liquidado"]),
                "pago": converter_valor_monetario(item["pago"])
            })
        
        despesas_por_orgao[nome_orgao] = despesas_detalhadas
    
    return render_template('tabelas.html', 
                           compras=compras, 
                           despesas_por_orgao=despesas_por_orgao)

@app.route('/baixar-graficos', methods=['POST'])
def baixar_graficos():
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

        elementos = []

        estilos = getSampleStyleSheet()
        estilo_subtitulo = ParagraphStyle(
            'EstiloSubtitulo',
            parent=estilos['Heading2'],
            fontSize=14,
            spaceAfter=20,
            alignment=1
        )

        for grafico in graficos:
            titulo = Paragraph(grafico['titulo'], estilo_subtitulo)

            # Decodificar imagem base64
            img_data = grafico['imagem'].split(',')[1]
            img_bytes = base64.b64decode(img_data)
            img_buffer = BytesIO(img_bytes)

            img = Image(img_buffer, width=9*inch, height=5*inch)

            elementos_grafico = [
                titulo,
                img,
                Spacer(1, 30)
            ]

            elementos.append(KeepTogether(elementos_grafico))

        doc.build(elementos)

        buffer.seek(0)

        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='graficos_gastos_df.pdf'
        )
    except Exception as e:
        return {"error": f"Erro ao gerar PDF: {str(e)}"}, 500

@app.route('/baixar-tabelas', methods=['POST'])
def baixar_Tabelas():  
    try:
        data = request.get_json()
        if not data or 'tabelas' not in data:
            return {"error": "Nenhuma tabela fornecida"}, 400
        
        tabelas = data['tabelas']
        buffer = BytesIO()

        doc = SimpleDocTemplate(
            buffer, 
            pagesize=landscape(A4),
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        elementos = []

        estilos = getSampleStyleSheet()
        estilo_titulo = estilos['Title']
        estilo_normal = estilos['BodyText']
        elementos.append(Paragraph("Monitoramento de Gastos Públicos - Tabelas", estilo_titulo))
        elementos.append(Spacer(1, 12))
        page_width, _ = landscape(A4)
        usable_width = page_width - doc.leftMargin - doc.rightMargin

        for index, tabela in enumerate(tabelas, 1):
            if not all(key in tabela for key in ['headers', 'rows']):
                continue

            headers = tabela['headers']
            rows = tabela['rows']
            elementos.append(Paragraph(f"Tabela {index}", estilo_normal))
            elementos.append(Spacer(1, 6))
            num_columns = len(headers)
            col_width = usable_width / num_columns
            col_widths = [col_width] * num_columns
            dados = [
                [Paragraph(str(cell), estilo_normal) for cell in row] 
                for row in ([headers] + rows)
            ]

            tabela_pdf = Table(dados, colWidths=col_widths, repeatRows=1)
            tabela_pdf.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('WORDWRAP', (0, 0), (-1, -1), 'LTR'),
            ]))
            
            elementos.append(tabela_pdf)
            elementos.append(Spacer(1, 24))

        doc.build(elementos)
        buffer.seek(0)

        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='tabelas_gastos_publicos.pdf'
        )
    
    except Exception as e:
        print(f"Erro ao gerar PDF: {str(e)}")
        return {"error": f"Erro ao gerar PDF: {str(e)}"}, 500

if __name__ == '__main__':
    app.run(debug=True)