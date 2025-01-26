let eCelular = window.innerWidth <= 768;

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
  const limiteSuperior = media * 1.2; // 20% acima da média
  
  const alertas = valores.map((valor, index) => {
    return valor > limiteSuperior ? {
      ano: dados.labels[index],
      valor,
      variacao: ((valor - media) / media) * 100
    } : null;
  }).filter(a => a);
  
  return { media, alertas };
};

const estruturarDadosDoGrafico = (tagId, dados) => {
  const eGraficoCompras = tagId === "grafico-compras";
  const mediasEAlertas = calcularMedias(dados);
  
  const dadosBase = [
    {
      x: dados.labels,
      y: eGraficoCompras ? dados.pago : dados.empenhado,
      type: "bar",
      name: eGraficoCompras ? "Compras" : "Empenhado",
      marker: { color: "#1f77b4" },
      hovertemplate:
        `<b>Valor ${eGraficoCompras ? "Pago" : "Empenhado"}</b><br>` +
        "Ano: %{x}<br>" +
        "Valor: R$ %{y:,.2f}<br>" +
        `<i>${
          eGraficoCompras
            ? "Representa o pagamento efetivo realizado ao credor pelo serviço/produto"
            : "Representa o primeiro estágio da despesa, quando há reserva do valor para um fim específico"
        }</i><extra></extra>`,
    }
  ];

  // Adiciona linha de média
  if (mediasEAlertas) {
    dadosBase.push({
      x: dados.labels,
      y: Array(dados.labels.length).fill(mediasEAlertas.media),
      type: 'scatter',
      mode: 'lines',
      name: 'Média',
      line: {
        color: 'red',
        dash: 'dash'
      },
      hovertemplate:
        "<b>Média do Período</b><br>" +
        "R$ %{y:,.2f}<br>" +
        "<i>Linha de referência para análise de variações</i><extra></extra>"
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
        marker: { color: "#ff7f0e" },
        hovertemplate:
          "<b>Valor Liquidado</b><br>" +
          "Ano: %{x}<br>" +
          "Valor: R$ %{y:,.2f}<br>" +
          "<i>Indica que o serviço/produto foi entregue e verificado</i><extra></extra>"
      });
    }
    if (dados.pago) {
      dadosBase.push({
        x: dados.labels,
        y: dados.pago,
        type: "bar",
        name: "Pago",
        marker: { color: "#2ca02c" },
        hovertemplate:
          "<b>Valor Pago</b><br>" +
          "Ano: %{x}<br>" +
          "Valor: R$ %{y:,.2f}<br>" +
          "<i>Representa o pagamento efetivo realizado</i><extra></extra>"
      });
    }
  }

  return dadosBase;
};

const montarLayoutDoGrafico = (tagId, dados) => {
  const graficoContainer = `${tagId}-container`;
  const mediasEAlertas = calcularMedias(dados);
  
  // Cria anotações para alertas
  const annotations = [];
  if (mediasEAlertas && mediasEAlertas.alertas.length > 0) {
    mediasEAlertas.alertas.forEach(alerta => {
      annotations.push({
        x: alerta.ano,
        y: alerta.valor,
        text: `⚠️ +${alerta.variacao.toFixed(1)}%`,
        showarrow: true,
        arrowhead: 2,
        arrowsize: 1,
        arrowwidth: 2,
        arrowcolor: '#ff4444',
        font: {
          size: eCelular ? 10 : 12,
          color: '#ff4444'
        },
        ay: -40
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
    annotations: annotations
  };
};

function renderizarGrafico(tagId, dados) {
  const eGraficoCompras = tagId === "grafico-compras";
  if (
    !dados ||
    !dados.labels ||
    (eGraficoCompras ? !dados.pago : !dados.empenhado) ||
    dados.labels.length === 0
  ) {
    document.getElementById(
      tagId
    ).innerHTML = `<p style="text-align: center; color: #555;">Não há dados para exibir no momento.</p>`;
    return;
  }

  const dadosDoGrafico = estruturarDadosDoGrafico(tagId, dados);

  const layout = montarLayoutDoGrafico(tagId, dados);

  Plotly.newPlot(tagId, dadosDoGrafico, layout, { displayModeBar: false });
  window.addEventListener("resize", () => {
    atualizarECelular();
    const updatedLayout = montarLayoutDoGrafico(tagId, dados);
    Plotly.react(tagId, dadosDoGrafico, updatedLayout);
  });
}

renderizarGrafico("grafico-compras", dadosGastosCompras);

Object.entries(despesasPorOrgao).forEach(([orgao, dados]) => {
  const divId = `grafico-${orgao.replace(/\s/g, "_")}`;
  renderizarGrafico(divId, dados);
});

function downloadGraficos() {
  const graficos = document.querySelectorAll('[id^="grafico-"]:not([id$="-container"])');
  const graficosDados = Array.from(graficos)
    .filter(grafico => grafico.getElementsByClassName('main-svg').length > 0) 
    .map(grafico => {
      const container = grafico.closest('.chart-container');
      const titulo = container.querySelector('h3').textContent;
      return {
        titulo: titulo,
        promiseImagem: Plotly.toImage(grafico, {format: 'png', width: 800, height: 450})
      };
    });

  Promise.all(graficosDados.map(dado => dado.promiseImagem))
    .then(imageUrls => {
      const dadosCompletos = imageUrls.map((url, index) => ({
        imagem: url,
        titulo: graficosDados[index].titulo
      }));

      fetch('/baixar-graficos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ graficos: dadosCompletos })
      })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'graficos_gastos_df.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      });
    });
}

function downloadGraficoIndividual(graficoId) {
  const grafico = document.getElementById(graficoId);
  if (!grafico || !grafico.getElementsByClassName('main-svg').length) {
    console.error('Gráfico não encontrado ou inválido');
    return;
  }

  const container = grafico.closest('.chart-container');
  const titulo = container.querySelector('h3').textContent;

  Plotly.toImage(grafico, {format: 'png', width: 800, height: 450})
    .then(imageUrl => {
      fetch('/baixar-graficos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          graficos: [{
            titulo: titulo,
            imagem: imageUrl
          }]
        })
      })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grafico_${graficoId.toLowerCase()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      });
    });
}