from datetime import datetime
import requests
import json
import os
API_KEY = os.getenv('API_KEY')
API_COOKIE = os.getenv('API_COOKIE')
def fetch_data(mes_ano):
    url = f"https://api.portaldatransparencia.gov.br/api-de-dados/novo-bolsa-familia-por-municipio?mesAno={mes_ano}&codigoIbge=5300108"
    headers = {
        'chave-api-dados': API_KEY,
        'Cookie': API_COOKIE
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException:
        return None
def excluir_municipio(data):
    for item in data:
        if 'municipio' in item:
            del item['municipio']
    return data
def salvar_dados():
    jsons_dir = os.path.join(os.path.dirname(__file__), 'json')
    if not os.path.exists(jsons_dir):
        os.makedirs(jsons_dir)
    output_file = os.path.join(jsons_dir, 'bolsafamilia.json')
    mes_ano = datetime.now().strftime("%Y%m")
    all_data = []
    seen = set()
    if os.path.exists(output_file):
        with open(output_file, "r", encoding="utf-8") as file:
            try:
                all_data = json.load(file)
                print(f"Dados carregados de {output_file}")
                for item in all_data:
                    if 'codigoIBGE' in item:
                        seen.add(item['codigoIBGE'])
            except json.JSONDecodeError:
                print(f"Erro ao ler o arquivo {output_file}, iniciando com dados vazios.")
    data = fetch_data(mes_ano)
    if not data:
        print(f"Sem dados no mês/ano {mes_ano}.")
    else:
        data = excluir_municipio(data)
        for item in data:
            if 'codigoIBGE' in item and item['codigoIBGE'] not in seen:
                all_data.append(item)
    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(all_data, file, ensure_ascii=False, indent=4)
    print(f"Dados atualizados com sucesso em {output_file}")
if __name__ == "__main__":
    salvar_dados()