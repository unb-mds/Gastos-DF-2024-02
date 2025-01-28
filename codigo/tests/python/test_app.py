def test_soma():
    resultado = 1 + 1
    if resultado != 2:
        raise ValueError(f"Esperado 2, mas obteve {resultado}")
