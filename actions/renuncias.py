import requests
import json
import re
from collections import defaultdict
import os
API_KEY = os.getenv("API_KEY")
API_COOKIE = os.getenv("API_COOKIE")
script_dir = os.path.dirname(os.path.abspath(__file__))
base_url = "https://api.portaldatransparencia.gov.br/api-de-dados/renuncias-valor?codigoIbge=5300108&pagina="
headers = {"chave-api-dados": API_KEY, "Cookie": API_COOKIE}
def capturar_data(pagina):
    url = base_url + str(pagina)
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        return None
def sanitize_filename(nome):
    return re.sub(r'[^a-zA-Z0-9_-]', '_', nome)
# Função para ler o número da última página processada (do arquivo de controle)
def capturar_ultima_pagina():
    caminho_do_arquivo_pagina = os.path.join(script_dir, 'pagina_atual.txt')  # Caminho absoluto para o arquivo de controle
    if os.path.exists(caminho_do_arquivo_pagina):
        with open(caminho_do_arquivo_pagina, 'r') as f:
            return int(f.read().strip())
    return 1  # Se não encontrar o arquivo, começa da página 1 (ou última válida que você determinar)
# Função para atualizar o arquivo com a última página processada
def atualizar_ultima_pagina(pagina):
    page_file_path = os.path.join(script_dir, 'pagina_atual.txt')  # Caminho absoluto para o arquivo de controle
    with open(page_file_path, 'w') as f:
        f.write(str(pagina))
# Função para carregar os dados já existentes no arquivo JSON
def carregar_dados_existentes(file_name):
    if os.path.exists(file_name):
        with open(file_name, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []  # Retorna uma lista vazia se o arquivo não existir
# Função para verificar se um item já existe no arquivo (usando todos os campos)
def duplicacao(dado_existente, novo_item):
    # Verifica se algum item existente é exatamente igual ao novo item
    return any(
        item == novo_item for item in dado_existente
    )
# Garantir que a pasta json exista dentro da pasta do script
json_dir = os.path.join(script_dir, 'json')
os.makedirs(json_dir, exist_ok=True)
# Iniciar a captura de dados a partir da última página registrada
pagina = capturar_ultima_pagina()
while True:
    data = capturar_data(pagina)
    if data:  # Se dados foram encontrados
        for item in data:
            descricao_beneficio = item.get('descricaoBeneficioFiscal')
            if descricao_beneficio:
                tipo_do_dado = sanitize_filename(descricao_beneficio)
                nome_do_arquivo = os.path.join(json_dir, f"renuncias_{tipo_do_dado}.json")  # Caminho correto para o arquivo JSON
                # Carregar os dados existentes
                dados_existentes = carregar_dados_existentes(nome_do_arquivo)
                # Se o item não for duplicado, adiciona
                if not duplicacao(dados_existentes, item):
                    dados_existentes.append(item)
                    # Salvar os dados no arquivo JSON
                    with open(nome_do_arquivo, 'w', encoding='utf-8') as f:
                        json.dump(dados_existentes, f, ensure_ascii=False, indent=4)
        # Atualizar a página para a próxima e salvar a última página com dados
        atualizar_ultima_pagina(pagina)  # Salvar a última página lida com dados
        pagina += 1
    else:
        break