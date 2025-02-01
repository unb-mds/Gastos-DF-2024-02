from app import app


def test_pagina_inicial():
    with app.test_client() as cliente:
        resposta = cliente.get("/")
        assert resposta.status_code == 200


def test_pagina_graficos():
    with app.test_client() as cliente:
        resposta = cliente.get("/graficos")
        assert resposta.status_code == 200


def test_pagina_tabelas():
    with app.test_client() as cliente:
        resposta = cliente.get("/tabelas")
        assert resposta.status_code == 200


def test_about():
    with app.test_client() as cliente:
        resposta = cliente.get("/about")
        assert resposta.status_code == 200
