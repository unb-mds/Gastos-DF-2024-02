from flask import Flask, render_template
import json
import os
from datetime import datetime

app = Flask(__name__)

# Caminho para os dados JSON
DATA_DIR = "../actions/json"

# Função para carregar os dados de compras
def carregar_dados_compras():
    json_path = os.path.join(DATA_DIR, "compras.json")
    if os.path.exists(json_path):
        with open(json_path, "r", encoding="utf-8") as file:
            return json.load(file)
    return {}

# Processar dados de compras para gráficos
def processar_dados_compras():
    dados_compras = carregar_dados_compras()
    gastos_mensais = {}
    liquidado_mensais = {}
    pago_mensais = {}

    for data, itens in dados_compras.items():
        mes = datetime.strptime(data, "%Y-%m-%d").strftime("%B/%Y")  # Exemplo: Janeiro/2024
        total_empenhado = sum(
            float(item["Valor"].replace("R$", "").replace(".", "").replace(",", ".")) for item in itens
        )
        total_liquidado = total_empenhado * 0.9  # Supondo 90% do empenhado
        total_pago = total_empenhado * 0.8  # Supondo 80% do empenhado

        gastos_mensais[mes] = gastos_mensais.get(mes, 0) + total_empenhado
        liquidado_mensais[mes] = liquidado_mensais.get(mes, 0) + total_liquidado
        pago_mensais[mes] = pago_mensais.get(mes, 0) + total_pago

    meses_ordenados = sorted(gastos_mensais.keys(), key=lambda x: datetime.strptime(x, "%B/%Y"))
    empenhado = [gastos_mensais[mes] for mes in meses_ordenados]
    liquidado = [liquidado_mensais[mes] for mes in meses_ordenados]
    pago = [pago_mensais[mes] for mes in meses_ordenados]

    return {
        "labels": meses_ordenados,
        "empenhado": empenhado,
        "liquidado": liquidado,
        "pago": pago
    }

# Processar dados de compras para tabelas
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

# Listar arquivos de despesas
def listar_arquivos_despesas():
    return [
        f for f in os.listdir(DATA_DIR)
        if f.startswith("despesas_") and f.endswith(".json")
    ]

# Processar dados de despesas por órgão para gráficos
def processar_dados_despesas():
    despesas_por_orgao = {}
    arquivos = listar_arquivos_despesas()

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

            for ano in anos:
                empenhado_val = sum(float(item["empenhado"].replace(".", "").replace(",", ".")) for item in dados if item["ano"] == ano)
                liquidado_val = sum(float(item["liquidado"].replace(".", "").replace(",", ".")) for item in dados if item["ano"] == ano)
                pago_val = sum(float(item["pago"].replace(".", "").replace(",", ".")) for item in dados if item["ano"] == ano)

                empenhado.append(empenhado_val)
                liquidado.append(liquidado_val)
                pago.append(pago_val)

            despesas_por_orgao[orgao] = {
                "labels": [str(ano) for ano in anos],
                "empenhado": empenhado,
                "liquidado": liquidado,
                "pago": pago
            }

    return despesas_por_orgao

# Carregar todas as despesas para tabelas
def carregar_todas_despesas():
    arquivos = listar_arquivos_despesas()
    despesas_por_orgao = {}

    for arquivo in arquivos:
        nome_orgao = arquivo.replace("despesas_", "").replace(".json", "").replace("_", " ")
        despesas_detalhadas = processar_dados_tabela_despesas(arquivo)
        if despesas_detalhadas:
            despesas_por_orgao[nome_orgao] = despesas_detalhadas

    return despesas_por_orgao or {}

# Processar dados de despesas por órgão para tabelas
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

# Rota inicial
@app.route('/')
def index():
    return render_template('index.html')

# Rota para a página de gráficos
@app.route('/charts')
def charts():
    compras = processar_dados_compras()  # Processa os dados de compras para gráficos
    despesas_por_orgao = processar_dados_despesas()  # Processa os dados de despesas para gráficos
    return render_template('charts.html', 
                           compras=compras, 
                           despesas_por_orgao=despesas_por_orgao)

# Rota para a página de tabelas
@app.route('/tables')
def tables():
    compras = processar_dados_tabela_compras()
    despesas_por_orgao = carregar_todas_despesas()
    return render_template('tables.html', compras=compras, despesas_por_orgao=despesas_por_orgao)

if __name__ == '__main__':
    app.run(debug=True)
