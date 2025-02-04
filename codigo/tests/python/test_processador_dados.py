from unittest.mock import Mock

import pytest
from utils.carregador_dados import CarregadorDados
from utils.processador_dados import ProcessadorDados


@pytest.fixture
def mock_carregador():
    carregador = Mock(spec=CarregadorDados)
    return carregador


def test_processar_dados_compras_vazio(mock_carregador):
    mock_carregador.carregar_dados_compras.return_value = {}
    processador = ProcessadorDados(mock_carregador)
    resultado = processador.processar_dados_compras()
    assert resultado == {"labels": [], "pago": []}


def test_processar_dados_tabela_compras(mock_carregador):
    dados_mock = {
        "2024-02-01": [
            {
                "Empresa": "Empresa Teste",
                "CNPJ": "00.000.000/0001-00",
                "Objeto": "Teste",
                "Valor": "R$ 1.000,00",
            }
        ]
    }
    mock_carregador.carregar_dados_compras.return_value = dados_mock
    processador = ProcessadorDados(mock_carregador)
    resultado = processador.processar_dados_tabela_compras()

    assert len(resultado) == 1
    assert resultado[0]["empresa"] == "Empresa Teste"
    assert resultado[0]["valor"] == 1000.0
