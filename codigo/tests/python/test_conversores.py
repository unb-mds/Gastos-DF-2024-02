from utils.conversores import (
    converter_valor_monetario,
    formatar_data,
    ordenar_meses_cronologicamente,
    traduzir_meses,
)


def test_converter_valor_monetario():
    assert converter_valor_monetario("R$ 1.000,00") == 1000.0
    assert converter_valor_monetario("R$ 1.234.567,89") == 1234567.89
    assert converter_valor_monetario("") == 0.0


def test_formatar_data():
    assert formatar_data("2024-02-01") == "01/02/2024"
    assert formatar_data("2023-12-31") == "31/12/2023"


def test_ordenar_meses_cronologicamente():
    meses = ["Dezembro/2023", "Janeiro/2024", "Fevereiro/2024"]
    resultado = ordenar_meses_cronologicamente(meses)
    assert resultado == ["Dezembro/2023", "Janeiro/2024", "Fevereiro/2024"]


def test_traduzir_meses():
    traducoes = traduzir_meses()
    assert traducoes["January"] == "Janeiro"
    assert traducoes["December"] == "Dezembro"
