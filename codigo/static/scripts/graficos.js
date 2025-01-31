let eCelular = window.innerWidth <= 768;
let mostrarAnomaliasAtivo = false;

//função usada para testes unitários
function obterECelular() {
  return eCelular;
}
//função usada para testes unitários
function obterMostrarAnomaliasAtivo() {
  return mostrarAnomaliasAtivo;
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
  const valores = eGraficoCompras ? dados.pago : dados.empenhado;

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
  const mediasEAlertas = calcularMedias(dados);

  const dadosBase = [
    {
      x: dados.labels,
      y: eGraficoCompras ? dados.pago : dados.empenhado,
      type: "bar",
      name: eGraficoCompras ? "Compras" : "Empenhado",
      marker: {
        color: "#1f77b4", // Sempre azul para o gráfico base
      },
      hovertemplate:
        `<b>Valor ${eGraficoCompras ? "Pago" : "Empenhado"}</b><br>` +
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
  const eGraficoCompras = tagId === "grafico-compras";
  if (
    !dados ||
    Object.keys(dados).length === 0 ||
    !dados.labels ||
    (eGraficoCompras ? !dados.pago : !dados.empenhado) ||
    dados.labels.length === 0
  ) {
    const texto = "Não há dados para exibir no momento.";
    document.getElementById(tagId).innerHTML =
      `<p style="text-align: center; color: #555;">${texto}</p>`;
    if (eTesteUnitario) return texto;
    return;
  }

  const dadosDoGrafico = estruturarDadosDoGrafico(
    tagId,
    dados,
    mostrarAnomaliasAtivo,
  );
  const layout = montarLayoutDoGrafico(tagId, dados, mostrarAnomaliasAtivo);

  Plotly.newPlot(tagId, dadosDoGrafico, layout, { displayModeBar: false });

  // Adiciona botão para mostrar/ocultar anomalias
  const container = document.getElementById(`${tagId}-container`);
  let botaoAnomalia = container.querySelector(".botao-anomalia");
  if (!botaoAnomalia) {
    botaoAnomalia = document.createElement("button");
    botaoAnomalia.className = "botao-anomalia";
    container.insertBefore(botaoAnomalia, container.firstChild);
  }
  botaoAnomalia.innerText = mostrarAnomaliasAtivo
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
    const updatedLayout = montarLayoutDoGrafico(
      tagId,
      dados,
      mostrarAnomaliasAtivo,
    );
    Plotly.react(tagId, dadosDoGrafico, updatedLayout);
  });
}

function toggleAnomalia(tagId, dados) {
  mostrarAnomaliasAtivo = !mostrarAnomaliasAtivo;
  renderizarGrafico(tagId, dados);
}
// Graficos.js
if (typeof dadosGastosCompras !== "undefined")
  renderizarGrafico("grafico-compras", dadosGastosCompras);

if (typeof despesasPorOrgao !== "undefined")
  Object.entries(despesasPorOrgao).forEach(([orgao, dados]) => {
    const divId = `grafico-${orgao.replace(/\s/g, "_")}`;
    renderizarGrafico(divId, dados);
  });

function downloadGraficos() {
  const graficos = document.querySelectorAll(
    '[id^="grafico-"]:not([id$="-container"])',
  );
  const promises = [];
  const graficosParaBaixar = [];

  graficos.forEach((grafico) => {
    if (!grafico.getElementsByClassName("main-svg").length) return;

    const container = grafico.closest(".chart-container");
    const titulo = container.querySelector("h3").textContent;
    const graficoId = grafico.id;

    // Recuperar os dados corretos do gráfico
    let dadosGrafico;
    if (graficoId === "grafico-compras") {
      dadosGrafico = dadosGastosCompras;
    } else {
      // Para gráficos de despesas por órgão
      const orgao = graficoId.replace("grafico-", "").replace(/_/g, " ");
      dadosGrafico = despesasPorOrgao[orgao];
    }

    // Renderizar com anomalias
    mostrarAnomaliasAtivo = true;
    renderizarGrafico(graficoId, dadosGrafico);
    const promiseImagemComAnomalias = Plotly.toImage(grafico, {
      format: "png",
      width: 800,
      height: 450,
    });

    // Renderizar sem anomalias
    mostrarAnomaliasAtivo = false;
    renderizarGrafico(graficoId, dadosGrafico);
    const promiseImagemSemAnomalias = Plotly.toImage(grafico, {
      format: "png",
      width: 800,
      height: 450,
    });

    // Restaurar estado original
    const estadoOriginalAnomalias = mostrarAnomaliasAtivo;
    mostrarAnomaliasAtivo = estadoOriginalAnomalias;
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
  if (graficoId === "grafico-compras") {
    dadosGrafico = dadosGastosCompras;
  } else {
    // Para gráficos de despesas por órgão
    const orgao = graficoId.replace("grafico-", "").replace(/_/g, " ");
    dadosGrafico = despesasPorOrgao[orgao];
  }

  // Renderizar com anomalias
  mostrarAnomaliasAtivo = true;
  renderizarGrafico(graficoId, dadosGrafico);
  const promiseImagemComAnomalias = Plotly.toImage(grafico, {
    format: "png",
    width: 800,
    height: 450,
  });

  // Renderizar sem anomalias
  mostrarAnomaliasAtivo = false;
  renderizarGrafico(graficoId, dadosGrafico);
  const promiseImagemSemAnomalias = Plotly.toImage(grafico, {
    format: "png",
    width: 800,
    height: 450,
  });

  // Restaurar estado original
  const estadoOriginalAnomalias = mostrarAnomaliasAtivo;
  mostrarAnomaliasAtivo = estadoOriginalAnomalias;
  renderizarGrafico(graficoId, dadosGrafico);

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
  downloadGraficos,
  downloadGraficoIndividual,
};
