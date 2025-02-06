from datetime import datetime
from typing import Dict, List

from .carregador_dados import CarregadorDados
from .conversores import (
    converter_valor_monetario,
    formatar_data,
    ordenar_meses_cronologicamente,
    traduzir_meses,
)


class ProcessadorDados:
    def __init__(self, carregador: CarregadorDados = None):
        self.carregador = carregador or CarregadorDados()

    def processar_dados_bolsa_familia(self) -> Dict[str, List]:
        dados_bolsa_familia = self.carregador.carregar_dados_bolsa_familia()
        pagamentos_mensais = {}
        traducao_meses = traduzir_meses()

        for item in dados_bolsa_familia:
            mes_ano = datetime.strptime(item["dataReferencia"], "%Y-%m-%d")
            mes_traduzido = f"{traducao_meses[mes_ano.strftime('%B')]}"
            total_pago = item["valor"]
            if total_pago > 0:
                if mes_traduzido in pagamentos_mensais:
                    pagamentos_mensais[mes_traduzido] += total_pago
                else:
                    pagamentos_mensais[mes_traduzido] = total_pago
        meses_ordenados = sorted(
            pagamentos_mensais.keys(),
            key=lambda x: list(traducao_meses.values()).index(x),
        )
        pagos = [pagamentos_mensais[mes] for mes in meses_ordenados]

        return {"labels": meses_ordenados, "valor_pago": pagos}

    def processar_dados_beneficiados(self) -> Dict[str, List]:
        dados_bolsa_familia = self.carregador.carregar_dados_bolsa_familia()
        beneficiados_mensais = {}
        traducao_meses = traduzir_meses()

        for item in dados_bolsa_familia:
            mes_ano = datetime.strptime(
                item["dataReferencia"], "%Y-%m-%d"
            ).strftime("%B/%Y")
            mes_traduzido = f"{traducao_meses[mes_ano.split('/')[0]]}/{mes_ano.split('/')[1]}"

            quantidade_beneficiados = item["quantidadeBeneficiados"]

            if quantidade_beneficiados > 0:
                beneficiados_mensais[mes_traduzido] = (
                    beneficiados_mensais.get(mes_traduzido, 0)
                    + quantidade_beneficiados
                )

        meses_ordenados = ordenar_meses_cronologicamente(
            list(beneficiados_mensais.keys())
        )
        beneficiados = [beneficiados_mensais[mes] for mes in meses_ordenados]

        return {"labels": meses_ordenados, "beneficiados": beneficiados}

    def processar_tabela_bolsa_familia(self) -> List[Dict]:
        dados_bolsa_familia = self.carregador.carregar_dados_bolsa_familia()
        tabela_bolsa_familia = []

        for item in dados_bolsa_familia:
            data_referencia = datetime.strptime(
                item["dataReferencia"], "%Y-%m-%d"
            )
            data_formatada = data_referencia.strftime("%m/%d/%Y")

            tabela_bolsa_familia.append(
                {
                    "id": item["id"],
                    "dataReferencia": data_formatada,
                    "tipo": item["tipo"]["descricao"],
                    "valor": f"R$ {item['valor']:,.2f}",
                    "quantidadeBeneficiados": f"{item['quantidadeBeneficiados']:,}",
                }
            )

        return sorted(
            tabela_bolsa_familia,
            key=lambda x: datetime.strptime(x["dataReferencia"], "%m/%d/%Y"),
            reverse=True,
        )

    def processar_dados_renuncias(self) -> Dict[str, List]:
        dados_renuncia = self.carregador.carregar_dados_renuncia()
        renuncias_anuais = {}

        for item in dados_renuncia:
            ano = item["ano"]
            valor_renunciado = item["valorRenunciado"]
            renuncias_anuais[ano] = (
                renuncias_anuais.get(ano, 0) + valor_renunciado
            )

        anos_ordenados = sorted(renuncias_anuais.keys())
        renuncias_formatadas = {
            "labels": [str(ano) for ano in anos_ordenados],
            "valor_renunciado": [
                renuncias_anuais[ano] for ano in anos_ordenados
            ],
        }

        return renuncias_formatadas

    def processar_tabela_renuncias(self) -> Dict[str, List[Dict]]:
        """
        Processa os dados de renúncias fiscais para exibição em tabela.
        Retorna um dicionário onde cada chave é um tipo de renúncia e o valor é uma lista de renúncias.
        """
        renuncias_por_tipo = {}
        arquivos = self.carregador.listar_arquivos_renuncias()

        for arquivo in arquivos:
            dados = self.carregador.carregar_dados_renuncia(arquivo)

            descricao_beneficio_fiscal = dados[0].get(
                "descricaoBeneficioFiscal", "Desconhecido"
            )
            renuncias_processadas = []
            for renuncia in dados:
                renuncia_processada = {
                    "ano": renuncia["ano"],
                    "valorRenunciado": renuncia["valorRenunciado"],
                    "tipoRenuncia": renuncia["tipoRenuncia"],
                    "cnpj": renuncia["cnpj"],
                    "razaoSocial": renuncia["razaoSocial"],
                    "uf": renuncia["uf"],
                    "municipio": renuncia["municipio"],
                }
                renuncias_processadas.append(renuncia_processada)

            renuncias_por_tipo[descricao_beneficio_fiscal] = (
                renuncias_processadas
            )

        return renuncias_por_tipo

    def processar_dados_renuncia(self) -> Dict[str, Dict[str, List]]:
        renuncia_por_tipo = {}
        arquivos = self.carregador.listar_arquivos_renuncias()

        for arquivo in arquivos:
            dados = self.carregador.carregar_dados_renuncia(arquivo)
            descricao_beneficio_fiscal = dados[0].get(
                "descricaoBeneficioFiscal", "Desconhecido"
            )

            renuncia_anuais = {}
            anos = sorted({item["ano"] for item in dados})

            for ano in anos:
                valor_renunciado = sum(
                    item["valorRenunciado"]
                    for item in dados
                    if item["ano"] == ano
                )
                renuncia_anuais[ano] = valor_renunciado

            renuncia_por_tipo[descricao_beneficio_fiscal] = {
                "labels": [str(ano) for ano in anos],
                "valor_renunciado": [renuncia_anuais[ano] for ano in anos],
            }

        return renuncia_por_tipo

    def processar_dados_compras(self) -> Dict[str, List]:
        dados_compras = self.carregador.carregar_dados_compras()
        gastos_mensais = {}
        traducao_meses = traduzir_meses()

        for data, itens in dados_compras.items():
            mes = datetime.strptime(data, "%Y-%m-%d").strftime("%B/%Y")
            mes_traduzido = (
                f"{traducao_meses[mes.split('/')[0]]}/{mes.split('/')[1]}"
            )

            total_pago = sum(
                converter_valor_monetario(item["Valor"]) for item in itens
            )

            if total_pago > 0:
                gastos_mensais[mes_traduzido] = (
                    gastos_mensais.get(mes_traduzido, 0) + total_pago
                )

        meses_ordenados = ordenar_meses_cronologicamente(
            list(gastos_mensais.keys())
        )
        pago = [gastos_mensais[mes] for mes in meses_ordenados]

        return {"labels": meses_ordenados, "pago": pago}

    def processar_dados_tabela_compras(self) -> List[Dict]:
        dados_compras = self.carregador.carregar_dados_compras()
        compras_detalhadas = []

        for data, itens in dados_compras.items():
            for item in itens:
                compras_detalhadas.append(
                    {
                        "empresa": item["Empresa"],
                        "cnpj": item["CNPJ"],
                        "objeto": item["Objeto"],
                        "valor": converter_valor_monetario(item["Valor"]),
                        "data": formatar_data(data),
                    }
                )
        return compras_detalhadas

    def processar_dados_tabela_despesas(self) -> List[Dict]:
        despesas_por_orgao = {}
        anos_unicos = set()  # Usando um conjunto para armazenar anos únicos
        arquivos = self.carregador.listar_arquivos_despesas()

        for arquivo in arquivos:
            nome_orgao = (
                arquivo.replace("despesas_", "")
                .replace(".json", "")
                .replace("_", " ")
            )
            dados = self.carregador.carregar_dados_despesas(arquivo)

            despesas_detalhadas = []
            for item in dados:
                ano = item["ano"]
                # Adiciona o ano ao conjunto de anos únicos
                anos_unicos.add(ano)

                despesas_detalhadas.append(
                    {
                        "ano": ano,
                        "orgao": item.get("orgao", nome_orgao),
                        "codigoOrgao": item.get("codigoOrgao", ""),
                        "empenhado": converter_valor_monetario(
                            item["empenhado"]
                        ),
                        "liquidado": converter_valor_monetario(
                            item["liquidado"]
                        ),
                        "pago": converter_valor_monetario(item["pago"]),
                    }
                )

            despesas_detalhadas.sort(key=lambda x: x["ano"], reverse=True)
            despesas_por_orgao[nome_orgao] = despesas_detalhadas

        # Ordena os anos de forma crescente
        anos_unicos = sorted(anos_unicos, reverse=True)
        return despesas_por_orgao, anos_unicos

    def processar_dados_despesas(self) -> Dict[str, Dict[str, List]]:
        despesas_por_orgao = {}
        arquivos = self.carregador.listar_arquivos_despesas()
        limite_minimo_percentual = 0.005

        for arquivo in arquivos:
            orgao = (
                arquivo.replace("despesas_", "")
                .replace(".json", "")
                .replace("_", " ")
            )
            dados = self.carregador.carregar_dados_despesas(arquivo)

            anos = sorted({item["ano"] for item in dados})
            empenhado, liquidado, pago = [], [], []

            # Calcular médias
            empenhado_media = sum(
                converter_valor_monetario(item["empenhado"]) for item in dados
            ) / len(anos)
            liquidado_media = sum(
                converter_valor_monetario(item["liquidado"]) for item in dados
            ) / len(anos)
            pago_media = sum(
                converter_valor_monetario(item["pago"]) for item in dados
            ) / len(anos)

            anos_validos = []

            for ano in anos:
                # Calcular valores por ano
                empenhado_val = sum(
                    converter_valor_monetario(item["empenhado"])
                    for item in dados
                    if item["ano"] == ano
                )
                liquidado_val = sum(
                    converter_valor_monetario(item["liquidado"])
                    for item in dados
                    if item["ano"] == ano
                )
                pago_val = sum(
                    converter_valor_monetario(item["pago"])
                    for item in dados
                    if item["ano"] == ano
                )

                # Filtrar valores significativos
                if empenhado_val >= empenhado_media * limite_minimo_percentual:
                    empenhado.append(empenhado_val)

                if liquidado_val >= liquidado_media * limite_minimo_percentual:
                    liquidado.append(liquidado_val)

                if pago_val >= pago_media * limite_minimo_percentual:
                    pago.append(pago_val)

                anos_validos.append(str(ano))

            despesas_por_orgao[orgao] = {
                "labels": anos_validos,
                "empenhado": empenhado,
                "liquidado": liquidado,
                "pago": pago,
            }

        return despesas_por_orgao
