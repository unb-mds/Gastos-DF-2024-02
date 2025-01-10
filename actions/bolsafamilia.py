from datetime import datetime
import requests
import json
import os
API_KEY = os.getenv('API_KEY')
API_COOKIE = os.getenv('API_COOKIE')
def fetch_data(codigo_ibge, mes_ano):
    url = f"https://api.portaldatransparencia.gov.br/api-de-dados/novo-bolsa-familia-por-municipio?mesAno={mes_ano}&codigoIbge={codigo_ibge}"
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
def salvar_dados():
    jsons_dir = os.path.join(os.path.dirname(__file__), 'json')
    if not os.path.exists(jsons_dir):
        os.makedirs(jsons_dir)
    output_file = os.path.join(jsons_dir, 'bolsafamilia.json')

    mes_ano = datetime.now().strftime("%Y%m")
    MUNICIPIOS_IBGE = [
        5300108,
    ]
    all_data = []
    seen = set()
    if os.path.exists(output_file):
        with open(output_file, "r", encoding="utf-8") as file:
            try:
                all_data = json.load(file)
                print(f"Dados carregados de {output_file}")
                for item in all_data:
                    seen.add(json.dumps(item, ensure_ascii=False))
            except json.JSONDecodeError:
                print(f"Erro ao ler o arquivo {output_file}, iniciando com dados vazios.")
    for codigo_ibge in MUNICIPIOS_IBGE:
        data = fetch_data(codigo_ibge, mes_ano)
        if not data:
            print(f"Sem dados para o município {codigo_ibge} no mês/ano {mes_ano}.")
        else:
            for item in data:
                item_serialized = json.dumps(item, ensure_ascii=False)
                if item_serialized not in seen:
                    all_data.append(item)
                    seen.add(item_serialized)
    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(all_data, file, ensure_ascii=False, indent=4)
    print(f"Dados atualizados com sucesso em {output_file}")
if __name__ == "__main__":
    salvar_dados()