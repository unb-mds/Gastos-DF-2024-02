let eCelular = window.innerWidth <= 768;
let mostrarAnomaliasAtivo = {};

//função usada para testes unitários
function obterECelular() {
  return eCelular;
}
//função usada para testes unitários
function obterMostrarAnomaliasAtivo(tagId) {
  return mostrarAnomaliasAtivo[tagId];
}
const atualizarECelular = () => {
  eCelular = window.innerWidth <= 768;
};

const fonte = () => ({
  family: "Arial, sans-serif",
  size: eCelular ? 10 : 15,
  color: "#333",
});

const fonteLegenda = () => ({
  family: "Arial, sans-serif",
  size: eCelular ? 8 : 12,
});

const calcularMedias = (dados) => {
  const eGraficoCompras = dados.pago !== undefined;
  const eGraficoRenuncia = dados.valor_renunciado !== undefined;
  const valores = eGraficoCompras
    ? dados.pago
    : eGraficoRenuncia
      ? dados.valor_renunciado
      : dados.empenhado;

  if (!valores || valores.length === 0) return null;

  const media = valores.reduce((a, b) => a + b, 0) / valores.length;
  const limiteSuperior = media * 1.4; // 40% acima da média

  const alertas = valores
    .map((valor, index) => {
      return valor > limiteSuperior
        ? {
            ano: dados.labels[index],
            valor,
            variacao: ((valor - media) / media) * 100,
          }
        : null;
    })
    .filter((a) => a);

  return { media, alertas };
};

const estruturarDadosDoGrafico = (tagId, dados, mostrarAnomalias) => {
  const eGraficoCompras = tagId === "grafico-compras";
  const eGraficoRenuncia = tagId.startsWith("grafico-renuncia-");
  const mediasEAlertas = calcularMedias(dados);

  const dadosBase = [
    {
      x: dados.labels,
      y: eGraficoCompras
        ? dados.pago
        : eGraficoRenuncia
          ? dados.valor_renunciado
          : dados.empenhado,
      type: "bar",
      name: eGraficoCompras
        ? "Compras"
        : eGraficoRenuncia
          ? "Renúncia"
          : "Empenhado",
      marker: {
        color: "#1f77b4", // Sempre azul para o gráfico base
      },
      hovertemplate:
        `<b>Valor ${eGraficoCompras ? "Pago" : eGraficoRenuncia ? "Renunciado" : "Empenhado"}</b><br>` +
        "Ano: %{x}<br>" +
        "Valor: R$ %{y:,.2f}<br>" +
        `<i>${
          eGraficoCompras
            ? "Representa o pagamento efetivo realizado ao credor pelo serviço/produto"
            : "Representa o primeiro estágio da despesa, quando há reserva do valor para um fim específico"
        }</i><extra></extra>`,
    },
  ];

  // Adiciona linha de média apenas se mostrarAnomalias for true
  if (mostrarAnomalias && mediasEAlertas) {
    dadosBase.push({
      x: dados.labels,
      y: Array(dados.labels.length).fill(mediasEAlertas.media),
      type: "scatter",
      mode: "lines",
      name: "Média",
      line: {
        color: "rgba(255, 0, 0, 0.5)",
        width: 2,
        dash: "dot",
      },
      hoverinfo: "skip",
    });
  }

  // Adiciona dados de liquidado e pago para gráficos que não são de compras
  if (!eGraficoCompras) {
    if (dados.liquidado) {
      dadosBase.push({
        x: dados.labels,
        y: dados.liquidado,
        type: "bar",
        name: "Liquidado",
        marker: {
          color: "#ff7f0e", // Sempre laranja
        },
        hovertemplate:
          "<b>Valor Liquidado</b><br>" +
          "Ano: %{x}<br>" +
          "Valor: R$ %{y:,.2f}<br>" +
          "<i>Indica que o serviço/produto foi entregue e verificado</i><extra></extra>",
      });
    }
    if (dados.pago) {
      dadosBase.push({
        x: dados.labels,
        y: dados.pago,
        type: "bar",
        name: "Pago",
        marker: {
          color: "#2ca02c", // Sempre verde
        },
        hovertemplate:
          "<b>Valor Pago</b><br>" +
          "Ano: %{x}<br>" +
          "Valor: R$ %{y:,.2f}<br>" +
          "<i>Representa o pagamento efetivo realizado</i><extra></extra>",
      });
    }
  }

  return dadosBase;
};

const montarLayoutDoGrafico = (tagId, dados, mostrarAnomalias) => {
  const graficoContainer = `${tagId}-container`;
  const mediasEAlertas = calcularMedias(dados);

  const annotations = [];
  if (
    mostrarAnomalias &&
    mediasEAlertas &&
    mediasEAlertas.alertas.length > 0
  ) {
    mediasEAlertas.alertas.forEach((alerta) => {
      annotations.push({
        x: alerta.ano,
        y: alerta.valor,
        text: `⚠️ +${alerta.variacao.toFixed(1)}%`,
        showarrow: true,
        arrowhead: 2,
        arrowsize: 1,
        arrowwidth: 2,
        arrowcolor: "#ff4444",
        font: {
          size: eCelular ? 10 : 12,
          color: "#ff4444",
        },
        ay: -40,
      });
    });
  }

  return {
    xaxis: {
      title: {
        text: "Ano",
        standoff: 20,
        font: fonte(),
      },
      automargin: true,
      tickfont: fonteLegenda(),
      // ALTEREI AQUI PQ OS ANOS ESTAVAM VINDO COM VALOR DECIMAL "2020,5"
      tickmode: "array",
      tickvals: dados.labels.map((label) => Math.round(label)),
    },
    yaxis: {
      title: {
        text: "Valor (R$)",
        font: fonte(),
      },
      tickfont: fonteLegenda(),
    },
    barmode: "group",
    hovermode: "closest",
    autosize: true,
    width: document.getElementById(graficoContainer).clientWidth - 20,
    height: 400,
    plot_bgcolor: "#f3f7fa",
    paper_bgcolor: "#f3f7fa",
    legend: {
      font: fonteLegenda(),
      orientation: eCelular ? "h" : "v",
      x: eCelular ? 0.5 : 1.1,
      xanchor: "center",
      y: eCelular ? -0.3 : 1,
    },
    margin: {
      t: 40,
      l: 50,
      r: 50,
      b: eCelular ? 80 : 60,
    },
    annotations: annotations,
  };
};

function renderizarGrafico(tagId, dados, eTesteUnitario) {
  const graficoDiv = document.getElementById(tagId);
  const container = document.getElementById(`${tagId}-container`);
  const anomaliaAtiva = mostrarAnomaliasAtivo[tagId];

  // Verifica se os dados são válidos
  const dadosValidos =
    dados &&
    dados.labels &&
    dados.labels.length > 0 &&
    ((dados.pago && dados.pago.length > 0) ||
      (dados.valor_pago && dados.valor_pago.length > 0) ||
      (dados.empenhado && dados.empenhado.length > 0) ||
      (dados.labels && dados.valor_renunciado.length > 0));

  if (!dadosValidos) {
    // Remove o botão de anomalia e texto explicativo existentes
    const botaoExistente = container.querySelector(".botao-anomalia");
    const textoExistente = container.querySelector(".texto-explicativo");
    if (botaoExistente) botaoExistente.remove();
    if (textoExistente) textoExistente.remove();
    const texto = "Não há dados para exibir no momento.";

    graficoDiv.innerHTML = `<p style="text-align: center; color: #555; padding: 20px;">Não há dados para exibir no momento.</p>`;
    if (eTesteUnitario) return texto;
    return;
  }

  let dadosGrafico;
  if (tagId === "grafico-bolsaFamilia") {
    dadosGrafico = estruturarDadosDoGrafico(
      tagId,
      {
        labels: dados.labels,
        empenhado: dados.valor_pago, // Usando valor_pago apenas como empenhado
      },
      anomaliaAtiva,
    );
  } else {
    dadosGrafico = estruturarDadosDoGrafico(tagId, dados, anomaliaAtiva);
  }

  const layout = montarLayoutDoGrafico(tagId, dados, anomaliaAtiva);

  Plotly.newPlot(tagId, dadosGrafico, layout, { displayModeBar: false });

  // Adiciona botão para mostrar/ocultar anomalias
  let botaoAnomalia = container.querySelector(".botao-anomalia");
  if (!botaoAnomalia) {
    botaoAnomalia = document.createElement("button");
    botaoAnomalia.className = "botao-anomalia";
    container.insertBefore(botaoAnomalia, container.firstChild);
  }
  botaoAnomalia.innerText = anomaliaAtiva
    ? "Ocultar Anomalias"
    : "Mostrar Anomalias";
  botaoAnomalia.onclick = () => toggleAnomalia(tagId, dados);

  // Adiciona texto explicativo para todos os gráficos
  let textoExplicativo = container.querySelector(".texto-explicativo");
  if (!textoExplicativo) {
    textoExplicativo = document.createElement("p");
    textoExplicativo.className = "texto-explicativo";
    container.insertBefore(textoExplicativo, container.firstChild);
  }
  textoExplicativo.innerHTML =
    'Clique em "Mostrar Anomalias" para destacar gastos que excedem 40% da média do período.';

  window.addEventListener("resize", () => {
    atualizarECelular();
    const updatedLayout = montarLayoutDoGrafico(tagId, dados, anomaliaAtiva);
    Plotly.react(tagId, dadosGrafico, updatedLayout);
  });
}

function toggleAnomalia(tagId, dados) {
  mostrarAnomaliasAtivo[tagId] = !mostrarAnomaliasAtivo[tagId];
  renderizarGrafico(tagId, dados);
}

if (typeof process === "undefined") {
  renderizarGrafico("grafico-compras", dadosGastosCompras);
  renderizarGrafico("grafico-bolsaFamilia", bolsaFamilia);

  Object.entries(despesasPorOrgao).forEach(([orgao, dados]) => {
    const divId = `grafico-${orgao.replace(/\s/g, "_")}`;
    renderizarGrafico(divId, dados);
  });

  Object.entries(renunciasPorTipo).forEach(([tipo, dados]) => {
    const divId = `grafico-renuncia-${tipo.replace(/\s/g, "_")}`;
    renderizarGrafico(divId, dados);
  });
}

function downloadGraficos() {
  const graficos = document.querySelectorAll(
    '[id^="grafico-"]:not([id$="-container"])',
  );
  const promises = [];
  const graficosParaBaixar = [];
  const estadoOriginalAnomalias = { ...mostrarAnomaliasAtivo };

  graficos.forEach((grafico) => {
    if (!grafico.getElementsByClassName("main-svg").length) return;

    const container = grafico.closest(".chart-container");
    const titulo = container.querySelector("h3").textContent;
    const graficoId = grafico.id;

    // Recuperar os dados corretos do gráfico
    let dadosGrafico;
    if (graficoId === "grafico-compras") {
      dadosGrafico = dadosGastosCompras;
    } else if (graficoId === "grafico-bolsaFamilia") {
      dadosGrafico = bolsaFamilia;
    } else if (graficoId.includes("grafico-renuncia-")) {
      const tipoRenuncia = graficoId
        .replace("grafico-renuncia-", "")
        .replace("-container", "")
        .replace(/_/g, " ");
      dadosGrafico = renunciasPorTipo[tipoRenuncia];
    } else {
      // Para gráficos de despesas por órgão
      const orgao = graficoId.replace("grafico-", "").replace(/_/g, " ");
      dadosGrafico = despesasPorOrgao[orgao];
    }

    // Renderizar com anomalias
    mostrarAnomaliasAtivo[graficoId] = true;
    renderizarGrafico(graficoId, dadosGrafico);
    const promiseImagemComAnomalias = Plotly.toImage(grafico, {
      format: "png",
      width: 800,
      height: 450,
    });

    // Renderizar sem anomalias
    mostrarAnomaliasAtivo[graficoId] = false;
    renderizarGrafico(graficoId, dadosGrafico);
    const promiseImagemSemAnomalias = Plotly.toImage(grafico, {
      format: "png",
      width: 800,
      height: 450,
    });

    // Restaurar estado original
    mostrarAnomaliasAtivo[graficoId] = estadoOriginalAnomalias[graficoId];
    renderizarGrafico(graficoId, dadosGrafico);

    promises.push(promiseImagemComAnomalias, promiseImagemSemAnomalias);
    graficosParaBaixar.push(
      { titulo: `${titulo} (Com Anomalias)` },
      { titulo: `${titulo} (Sem Anomalias)` },
    );
  });

  Promise.all(promises)
    .then((imagens) => {
      imagens.forEach((imagem, index) => {
        graficosParaBaixar[index].imagem = imagem;
      });

      return fetch("/baixar-graficos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ graficos: graficosParaBaixar }),
      });
    })
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "graficos_gastos_df.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    })
    .catch((error) => {
      console.error("Erro no download dos gráficos:", error);
      alert("Erro ao baixar os gráficos. Por favor, tente novamente.");
    });
}

function downloadGraficoIndividual(graficoId) {
  const grafico = document.getElementById(graficoId);
  const estadoOriginalAnomalias = { ...mostrarAnomaliasAtivo };
  if (
    !grafico ||
    !(grafico instanceof HTMLElement) ||
    !grafico.getElementsByClassName("main-svg").length
  ) {
    console.error("Gráfico não encontrado ou inválido");
    return;
  }

  const container = grafico.closest(".chart-container");
  const titulo = container.querySelector("h3").textContent;

  // Recuperar os dados corretos do gráfico
  let dadosGrafico;

  if (graficoId === "grafico-compras") dadosGrafico = dadosGastosCompras;
  else if (graficoId === "grafico-bolsaFamilia") dadosGrafico = bolsaFamilia;
  else if (graficoId.includes("grafico-renuncia")) {
    const tipoRenuncia = graficoId
      .replace("grafico-renuncia-", "")
      .replace("-container", "")
      .replace(/_/g, " ");
    dadosGrafico = renunciasPorTipo[tipoRenuncia];
  } else {
    // Para gráficos de despesas por órgão
    const orgao = graficoId.replace("grafico-", "").replace(/_/g, " ");
    console.log(`dados orgãos`);
    dadosGrafico = despesasPorOrgao[orgao];
  }

  // Renderizar com anomalias
  mostrarAnomaliasAtivo[graficoId] = true;
  renderizarGrafico(graficoId, dadosGrafico);
  const promiseImagemComAnomalias = Plotly.toImage(grafico, {
    format: "png",
    width: 800,
    height: 450,
  });

  // Renderizar sem anomalias
  mostrarAnomaliasAtivo[graficoId] = false;
  renderizarGrafico(graficoId, dadosGrafico);
  const promiseImagemSemAnomalias = Plotly.toImage(grafico, {
    format: "png",
    width: 800,
    height: 450,
  });

  // Restaurar estado original
  mostrarAnomaliasAtivo[graficoId] = estadoOriginalAnomalias[graficoId];
  renderizarGrafico(graficoId, dadosGrafico);

  console.log(`dados grafico: `, dadosGrafico);

  Promise.all([promiseImagemComAnomalias, promiseImagemSemAnomalias])
    .then(([imagemComAnomalias, imagemSemAnomalias]) => {
      return fetch("/baixar-graficos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          graficos: [
            {
              titulo: `${titulo} (Com Anomalias)`,
              imagem: imagemComAnomalias,
            },
            {
              titulo: `${titulo} (Sem Anomalias)`,
              imagem: imagemSemAnomalias,
            },
          ],
        }),
      });
    })
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `grafico_${graficoId.toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    })
    .catch((error) => {
      console.error("Erro no download do gráfico:", error);
      alert("Erro ao baixar o gráfico. Por favor, tente novamente.");
    });
}

//exports para execução de testes
module.exports = {
  calcularMedias,
  estruturarDadosDoGrafico,
  montarLayoutDoGrafico,
  toggleAnomalia,
  renderizarGrafico,
  downloadGraficos,
  obterMostrarAnomaliasAtivo,
  atualizarECelular,
  fonte,
  fonteLegenda,
  obterECelular,
  downloadGraficoIndividual,
};
