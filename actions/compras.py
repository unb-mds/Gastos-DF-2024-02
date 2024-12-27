import requests
import re
import json
from datetime import datetime
import os
from urllib.parse import urlencode
os.chdir(os.path.dirname(os.path.abspath(__file__)))
def capturar_e_filtrar(desde_o_dia):
    base_url = "https://queridodiario.ok.org.br/api/gazettes"
    params = {
        "territory_ids": "5300108",
        "published_since": desde_o_dia,
        "querystring": '"cujo objeto é a aquisição do item identificado pelo Código"',
        "excerpt_size": "3000",
        "number_of_excerpts": "10000","pre_tags": "","post_tags": "",
        "size": "10000",
        "sort_by": "ascending_date"}
    response = requests.get(f'{base_url}?{urlencode(params)}')
    if response.status_code != 200:
        print("Erro:", response.status_code)
        return None
    dados = response.json()
    dados_por_data = {}
    for gazette in dados['gazettes']:
        data = gazette['date']
        dados_por_data.setdefault(data, [])
        total_diario = 0
        excerto_relevante_encontrado = False
        for excerto in gazette['excerpts']:
            excerto = re.sub(r'(\w)-\n(\w)', r'\1\2', excerto).replace('\n', ' ').strip()
            empresa_match = re.search(r'empresa\s+([\w\s\-ÇçÉéÁáÍíÓóÚúÃãÕõâêîôûÂÊÎÔÛäëïöüÄËÏÖÜ]+)\s*-\s*CNPJ:\s*(\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2})', excerto, re.IGNORECASE)
            objeto_match = re.search(r'cujo\s+objeto\s+é\s+a\s+aquisição\s+do\s+item\s+identificado\s+pelo\s+Código\s+SES\s+\d+\s*-\s*([^\n,]+)', excerto, re.IGNORECASE)
            valor_match = re.search(r'valor\s+global\s+de\s+R\$\s*([\d.,]+)', excerto, re.IGNORECASE)
            if empresa_match and objeto_match and valor_match:
                excerto_relevante_encontrado = True
                empresa, cnpj = empresa_match.groups()
                objeto = re.sub(r',\s*para\s+atender\s+as\s+necessidades.*', '', objeto_match.group(1), flags=re.IGNORECASE)
                valor = valor_match.group(1).strip()
                valor_limpo = re.sub(r'[^\d,\.]', '', valor)
                if ',' in valor_limpo:
                    valor_limpo = valor_limpo.replace('.', '').replace(',', '.')
                try:
                    valor_float = float(valor_limpo)
                except ValueError:
                    print(f"Erro ao converter o valor: {valor_limpo}")
                    valor_float = 0
                total_diario += valor_float
                dados_por_data[data].append({
                    "Empresa": empresa.strip(),
                    "CNPJ": cnpj.strip(),
                    "Objeto": objeto.strip(),
                    "Valor": f"R${valor_float:.2f}"})
        if excerto_relevante_encontrado:
            print(f'Data: {data}, Dívidas totais = R${total_diario:.2f}')
        else:
            dados_por_data.pop(data, None)
    return dados_por_data
def salvar_dados():
    json_folder, json_path = "json", os.path.join("json", "compras.json")
    os.makedirs(json_folder, exist_ok=True)
    desde_o_dia = datetime.now().strftime("%Y-%m-%d") if os.path.exists(json_path) else "2024-01-01"
    new_data = capturar_e_filtrar(desde_o_dia)
    if not new_data:
        print("Nenhum dado novo para adicionar.")
        return
    dados_existentes = {}
    if os.path.exists(json_path):
        with open(json_path, "r", encoding='utf-8') as file:
            dados_existentes = json.load(file)
    for data, itens in new_data.items():
        dados_existentes.setdefault(data, []).extend(itens)
    with open(json_path, "w", encoding='utf-8') as file:
        json.dump(dados_existentes, file, ensure_ascii=False, indent=4)
    print(f"Dados atualizados salvos em '{json_path}'")
salvar_dados() #INICIO