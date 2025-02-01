import pytest
from utils.carregador_dados import CarregadorDados
import json
import tempfile
import os
from pathlib import Path

@pytest.fixture
def carregador_teste():
    with tempfile.TemporaryDirectory() as temp_dir:
        yield CarregadorDados(temp_dir)

def test_carregar_json_arquivo_inexistente(carregador_teste):
    resultado = carregador_teste.carregar_json("arquivo_inexistente.json")
    assert resultado == []

def test_listar_arquivos_despesas(carregador_teste):
    # Criar arquivos temporários de teste
    Path(carregador_teste.diretorio_dados).mkdir(exist_ok=True)
    arquivos_teste = ["despesas_orgao1.json", "despesas_orgao2.json"]
    
    for arquivo in arquivos_teste:
        caminho = Path(carregador_teste.diretorio_dados) / arquivo
        with open(caminho, 'w') as f:
            json.dump([], f)
    
    resultado = carregador_teste.listar_arquivos_despesas()
    assert len(resultado) == 2
    assert all(arquivo in resultado for arquivo in arquivos_teste)
