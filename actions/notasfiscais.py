from datetime import datetime
import requests
import json
import os

API_KEY = os.getenv('API_KEY')
API_COOKIE = os.getenv('API_COOKIE')
# Dicionário com os códigos dos órgãos superiores
ORGAOS_SUPERIORES = {
    "Presidência da República": 20000,
    "Ministério das Relações Exteriores": 35000,
    "Ministério da Saúde": 36000,
    "Ministério da Justiça e Segurança Pública": 30000,
    "Ministério do Trabalho e Emprego": 40000,
    "Ministério da Educação": 30050,
    "Ministério da Ciência, Tecnologia e Inovação": 41500,
    "Ministério da Agricultura e Pecuária": 22000,
    "Ministério do Meio Ambiente": 50000,
    "Ministério do Turismo": 57000,
    "Ministério do Esporte": 51000,
    "Ministério da Defesa": 52000,
    "Ministério da Mulher, da Família e dos Direitos Humanos": 59000,
    "Ministério da Cultura": 51050,
    "Ministério da Fazenda": 23000,
    "Ministério da Casa Civil": 15000,
    "Ministério da Integração e do Desenvolvimento Regional": 53000,
    "Ministério das Comunicações": 60000,
    "Ministério da Segurança Pública": 29000,
    "Ministério da Saúde (SUS)": 36001,
}
# Função para buscar os dados da API do Portal da Transparência
def fetch_data(pagina, orgao_superior):
    url = f"https://api.portaldatransparencia.gov.br/api-de-dados/notas-fiscais?codigoOrgao={orgao_superior}&pagina={pagina}" 
    headers = {
        'chave-api-dados': API_KEY,
        'Cookie': API_COOKIE}
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException:
        print(f"Erro ao acessar a API para a página {pagina}.")
        return None
# Função para buscar as informações detalhadas de uma nota fiscal por chave
def fetch_detailed_data(chave):
    url = f"https://api.portaldatransparencia.gov.br/api-de-dados/notas-fiscais-por-chave?chaveUnicaNotaFiscal={chave}"
    headers = {
        'chave-api-dados': API_KEY,
        'Cookie': API_COOKIE}
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException:
        print(f"Erro ao acessar a API para a chave {chave}.")
        return None
# Função principal que chama a API para diferentes órgãos e páginas
def fetch_and_save_data():
    jsons_dir = os.path.join(os.path.dirname(__file__), 'json')
    if not os.path.exists(jsons_dir):
        os.makedirs(jsons_dir)
    
    for orgao, codigo in ORGAOS_SUPERIORES.items():
        print(f"Buscando dados para o órgão: {orgao} (Código: {codigo})")
        pagina = 1
        detailed_output_file = os.path.join(jsons_dir, f"notas_fiscais_{codigo}_{orgao.replace(' ', '_')}.json")
        
        if os.path.exists(detailed_output_file):
            with open(detailed_output_file, "r", encoding="utf-8") as file:
                try:
                    all_data = json.load(file)
                    print(f"Dados carregados de {detailed_output_file}")
                    ultima_pagina = all_data[-1].get("pagina", 1)
                    pagina = ultima_pagina + 1  # Continuar da última página processada
                except json.JSONDecodeError:
                    print(f"Erro ao ler o arquivo {detailed_output_file}, iniciando com dados vazios.")
                    all_data = []
        else:
            all_data = []

        seen = set()  # Para garantir que não haja duplicação de dados

        while True:
            print(f"Buscando dados da página {pagina}...")
            data = fetch_data(pagina, codigo)
            if not data or len(data) == 0:
                print(f"Página {pagina} está vazia ou sem dados. Finalizando a busca para o órgão {orgao}.")
                break  # Interrompe a busca quando a página não retornar dados
            
            # Verifica a data da última nota fiscal da página
            ultima_data_emissao = None
            for item in data:
                data_emissao = item.get("dataEmissao", "")
                try:
                    data_emissao_obj = datetime.strptime(data_emissao, "%d/%m/%Y")
                except ValueError:
                    data_emissao_obj = None
                
                if data_emissao_obj:
                    ultima_data_emissao = data_emissao_obj
            
            # Se a última data de emissão for anterior a 2024, pula a página
            if ultima_data_emissao and ultima_data_emissao.year < 2024:
                print(f"A última data de emissão da página {pagina} é anterior a 2024. Passando para a próxima página.")
                pagina += 1
                continue  # Pula a página atual, avançando para a próxima
            
            # Filtra e adiciona dados válidos à lista
            page_data_added = False  # Flag para verificar se algum dado foi adicionado na página
            for item in data:
                municipio = item.get("municipioFornecedor", "").upper()
                data_emissao = item.get("dataEmissao", "")
                try:
                    data_emissao_obj = datetime.strptime(data_emissao, "%d/%m/%Y")
                except ValueError:
                    data_emissao_obj = None
                
                # Se o município for "BRASILIA" ou se a data de emissão for anterior a 2024, ignora o item
                if municipio == "BRASILIA" or not data_emissao_obj or data_emissao_obj.year < 2024:
                    continue  # Descarta o item e passa para o próximo
                
                chave_nota_fiscal = item.get("chaveNotaFiscal")
                if chave_nota_fiscal and chave_nota_fiscal not in seen:
                    seen.add(chave_nota_fiscal)  # Marca a chave como vista
                    
                    # Agora, para cada item válido, capturamos a chaveNotaFiscal e fazemos a requisição detalhada
                    detailed_data = fetch_detailed_data(chave_nota_fiscal)
                    if detailed_data:
                        all_data.append(detailed_data)
                        page_data_added = True  # Marca que houve adição de dados

            # Se nenhum dado válido foi adicionado, significa que a página foi "pulada" devido ao filtro de data
            if not page_data_added:
                print(f"Página {pagina} não contém notas fiscais válidas para processar. Avançando para a próxima página.")
            
            # Avança para a próxima página
            pagina += 1
        
        # Se houver dados detalhados, salva no arquivo JSON
        if all_data:
            with open(detailed_output_file, "w", encoding="utf-8") as file:
                json.dump(all_data, file, ensure_ascii=False, indent=4)
            print(f"Dados detalhados das notas fiscais salvos em {detailed_output_file}")
if __name__ == "__main__":
    fetch_and_save_data()