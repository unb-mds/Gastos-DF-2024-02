from datetime import datetime
from typing import Dict, List


def converter_valor_monetario(valor: str) -> float:
    return float(valor.replace("R$", "").replace(".", "").replace(",", "."))


def traduzir_meses() -> Dict[str, str]:
    return {
        "January": "Janeiro",
        "February": "Fevereiro",
        "March": "Março",
        "April": "Abril",
        "May": "Maio",
        "June": "Junho",
        "July": "Julho",
        "August": "Agosto",
        "September": "Setembro",
        "October": "Outubro",
        "November": "Novembro",
        "December": "Dezembro",
    }


def formatar_data(
    data: str,
    formato_entrada: str = "%Y-%m-%d",
    formato_saida: str = "%d/%m/%Y",
) -> str:
    return datetime.strptime(data, formato_entrada).strftime(formato_saida)


def ordenar_meses_cronologicamente(meses: List[str]) -> List[str]:
    traducao = traduzir_meses()

    # Inverter tradução para converter de português para inglês
    traducao_inversa = {v: k for k, v in traducao.items()}

    return sorted(
        meses,
        key=lambda x: datetime.strptime(
            x.split("/")[0].replace(
                x.split("/")[0],
                traducao_inversa.get(x.split("/")[0], x.split("/")[0]),
            )
            + "/"
            + x.split("/")[1],
            "%B/%Y",
        ),
    )
