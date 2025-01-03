from datetime import datetime
import requests
import json
import os

API_KEY = os.getenv('API_KEY')
API_COOKIE = os.getenv('API_COOKIE')

#Dicionario com os códigos dos órgãos superiores
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
#Função para buscar os dados da API do Portal da Transparência
def fetch_data(pagina, orgao_superior, ano):
    url = f"https://api.portaldatransparencia.gov.br/api-de-dados/despesas/por-orgao?ano={ano}&orgaoSuperior={orgao_superior}&pagina={pagina}"
    #Definindo o cabeçalho com a chave da API e o cookie secretos
    headers = {
        'chave-api-dados': API_KEY,
        'Cookie': API_COOKIE
    }
    try:
        #Requisição GET à API
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json() 
    except requests.RequestException:
        print(f"Erro ao acessar a API para a página {pagina}.")
        return None
#Função principal que chama a API para diferentes órgãos e páginas
def fetch_and_save_data(ano):
    jsons_dir = os.path.join(os.path.dirname(__file__), 'json')
    #Cria a pasta 'json' caso não exista
    if not os.path.exists(jsons_dir):
        os.makedirs(jsons_dir)
    for orgao, codigo in ORGAOS_SUPERIORES.items():
        print(f"Buscando dados para o órgão: {orgao} (Código: {codigo})")
        pagina = 1  #Começa pela primeira página
        all_data = []  #Lista para armazenar os dados de todas as páginas de um órgão
        seen = set()  #Conjunto para garantir dados únicos
        #Verifica se já existe um arquivo com dados para o órgão
        output_file = os.path.join(jsons_dir, f"despesas_{codigo}_{orgao.replace(' ', '_')}.json")
        #Se o arquivo já existir, carrega os dados existentes
        if os.path.exists(output_file):
            with open(output_file, "r", encoding="utf-8") as file:
                try:
                    all_data = json.load(file)
                    print(f"Dados carregados de {output_file}")
                    #Preenche o conjunto seen com os dados já presentes no arquivo
                    for item in all_data:
                        seen.add(json.dumps(item, ensure_ascii=False))  #Serializa para string, para comparação
                except json.JSONDecodeError:
                    print(f"Erro ao ler o arquivo {output_file}, iniciando com dados vazios.")
        while True:
            print(f"Buscando dados da página {pagina}...") 
            data = fetch_data(pagina, codigo, ano)
            if not data:
                print(f"Página {pagina} está em branco. Finalizando a busca para o órgão {orgao}.")
                break  #Interrompe a busca quando a página está vazia
            #Adiciona os dados da página ao conjunto geral de dados, evitando duplicação
            for item in data:
                item_serialized = json.dumps(item, ensure_ascii=False)
                if item_serialized not in seen:
                    all_data.append(item)
                    seen.add(item_serialized)
            #Avança para a próxima página
            pagina += 1
        #Se houver dados, salva no arquivo JSON (acumulando com os dados existentes)
        if all_data:
            with open(output_file, "w", encoding="utf-8") as file:
                json.dump(all_data, file, ensure_ascii=False, indent=4)
            print(f"Dados atualizados com sucesso em {output_file}")
        else:
            print(f"Nenhum dado encontrado para o órgão {orgao}. Arquivo não alterado.")
if __name__ == "__main__":
    ano =  datetime.now().strftime("%Y")
    fetch_and_save_data(ano)