const {
  obterMostrarAnomaliasAtivo,
  toggleAnomalia,
  renderizarGrafico,
  montarLayoutDoGrafico,
  estruturarDadosDoGrafico,
  calcularMedias,
  atualizarECelular,
  fonte,
  fonteLegenda,
  obterECelular,
} = require("../../static/scripts/graficos");
global.Plotly = require("plotly.js-dist");

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
    blob: () => Promise.resolve(new Blob()),
  }),
);

jest.mock("plotly.js-dist", () => ({
  newPlot: jest.fn(),
  react: jest.fn(),
  toImage: jest.fn(() => Promise.resolve("imageData")),
}));

global.document.getElementById = jest.fn(() => ({
  clientWidth: 800,
  querySelector: jest.fn().mockReturnValue(null),
  insertBefore: jest.fn(),
  closest: jest.fn(() => ({
    querySelector: jest.fn(),
  })),
}));

beforeAll(() => {
  window.innerWidth = 800;
});

describe("atualizarECelular", () => {
  it("deve atualizar o valor de eCelular baseado na largura da janela", () => {
    window.innerWidth = 800;
    atualizarECelular();
    expect(obterECelular()).toBe(false);

    window.innerWidth = 500;

    atualizarECelular();
    expect(obterECelular()).toBe(true);
  });
});

describe("fonte", () => {
  it("deve retornar o tamanho correto da fonte baseado no valor de eCelular", () => {
    window.innerWidth = 800;
    atualizarECelular();
    expect(fonte().size).toBe(15);

    window.innerWidth = 500;
    atualizarECelular();
    expect(fonte().size).toBe(10);
  });
});

describe("fonteLegenda", () => {
  it("deve retornar o tamanho correto da fonte baseado no valor de eCelular", () => {
    global.innerWidth = 800;
    atualizarECelular();
    expect(fonteLegenda().size).toBe(12);

    global.innerWidth = 500;
    atualizarECelular();
    expect(fonteLegenda().size).toBe(8);
  });
});

describe("calcularMedias", () => {
  it("deve retornar a média e alertas corretamente para dados de compras", () => {
    const dados = {
      pago: [100, 150, 200, 250, 300],
      labels: ["2019", "2020", "2021", "2022", "2023"],
    };

    const resultado = calcularMedias(dados);

    expect(resultado.media).toBeCloseTo(200, 0); // média de [100, 150, 200, 250, 300] é 200

    expect(resultado.alertas).toHaveLength(1); // apenas um alerta deve ser gerado (250 > 200 * 1.4)
    expect(resultado.alertas[0].ano).toBe("2023");
    expect(resultado.alertas[0].valor).toBe(300);
    expect(resultado.alertas[0].variacao).toBeCloseTo(50, 0); // (250 - 200) / 200 * 100 = 25%
  });

  it("deve retornar null se os valores estiverem vazios", () => {
    const dados = {
      pago: [],
      labels: [],
    };

    const resultado = calcularMedias(dados);

    expect(resultado).toBeNull();
  });

  it("deve retornar null se não houver valores pagos ou empenhados", () => {
    const dados = {
      labels: ["2019", "2020"],
    };

    const resultado = calcularMedias(dados);

    expect(resultado).toBeNull();
  });

  it("deve retornar a média e alertas corretamente para dados de empenho", () => {
    const dados = {
      empenhado: [120, 160, 220, 240, 800],
      labels: ["2019", "2020", "2021", "2022", "2023"],
    };

    const resultado = calcularMedias(dados);

    expect(resultado.media).toBeCloseTo(308, 0); // média de [120, 160, 220, 240, 280] é 204

    expect(resultado.alertas).toHaveLength(1); // apenas um alerta deve ser gerado (240 > 204 * 1.4)
    expect(resultado.alertas[0].ano).toBe("2023");
    expect(resultado.alertas[0].valor).toBe(800);
    expect(resultado.alertas[0].variacao).toBeCloseTo(159.74, 2); // (240 - 204) / 204 * 100 = 17.65%
  });
});

describe("estruturarDadosDoGrafico", () => {
  it("deve estruturar os dados corretamente para o gráfico de compras", () => {
    const dados = { labels: ["2021", "2022"], pago: [100, 200] };
    const resultado = estruturarDadosDoGrafico(
      "grafico-compras",
      dados,
      false,
    );
    expect(resultado[0].name).toBe("Compras");
    expect(resultado[0].y).toEqual([100, 200]);
  });

  it("deve adicionar a linha de média quando mostrarAnomalias for true", () => {
    const dados = { labels: ["2021", "2022"], pago: [100, 200] };
    const resultado = estruturarDadosDoGrafico(
      "grafico-compras",
      dados,
      true,
    );
    expect(resultado[1].name).toBe("Média");
  });

  it("deve adicionar os dados de liquidado e pago corretamente", () => {
    const dados = {
      labels: [2021, 2022],
      empenhado: [50, 150],
      liquidado: [30, 130],
      pago: [100, 200],
    };
    const resultado = estruturarDadosDoGrafico("grafico-outro", dados, false);
    expect(resultado[1].name).toBe("Liquidado");
    expect(resultado[2].name).toBe("Pago");
  });
});

describe("montarLayoutDoGrafico", () => {
  it("deve configurar corretamente o layout do gráfico", () => {
    const dados = { labels: ["2021", "2022"], pago: [100, 200] };
    const layout = montarLayoutDoGrafico("grafico-compras", dados, false);
    expect(layout.xaxis.title.text).toBe("Meses (Totais)");
    expect(layout.yaxis.title.text).toBe("Valor (R$)");
  });

  it("deve adicionar anotações se houver alertas de anomalias", () => {
    const dados = { labels: ["2021", "2022"], pago: [100, 300] };
    const layout = montarLayoutDoGrafico("grafico-compras", dados, true);
    expect(layout.annotations).toHaveLength(1);
  });
});

describe("toggleAnomalia", () => {
  let tagId;
  let dados;

  beforeEach(() => {
    tagId = "grafico-compras";
    dados = {
      labels: ["2020", "2021", "2022"],
      pago: [100, 200, 300],
      empenhado: [90, 180, 270],
    };
  });

  it("deve alternar o estado de mostrarAnomaliasAtivo", () => {
    expect(obterMostrarAnomaliasAtivo(tagId)).toBe(undefined);

    toggleAnomalia(tagId, dados);

    expect(obterMostrarAnomaliasAtivo(tagId)).toBe(true);

    // Chama novamente para verificar a alternância
    toggleAnomalia(tagId, dados);

    // Após a segunda chamada, o valor de mostrarAnomaliasAtivo deve ser false novamente
    expect(obterMostrarAnomaliasAtivo(tagId)).toBe(false);
  });
});

describe("renderizarGrafico", () => {
  let dadosGastosCompras;
  let dadosDespesasPorOrgao;

  beforeEach(() => {
    dadosGastosCompras = {
      labels: ["2019", "2020", "2021"],
      pago: [100, 150, 120],
      empenhado: [80, 140, 110],
    };
    dadosDespesasPorOrgao = {
      labels: ["2019", "2020", "2021"],
      empenhado: [90, 130, 100],
      pago: [70, 110, 80],
      liquidado: [60, 100, 70],
    };
  });

  test("deve renderizar gráfico de compras corretamente", () => {
    renderizarGrafico("grafico-compras", dadosGastosCompras);

    expect(Plotly.newPlot).toHaveBeenCalledWith(
      "grafico-compras",
      expect.arrayContaining([
        expect.objectContaining({
          x: expect.arrayContaining(["2020", "2021", "2022"]),
          y: expect.arrayContaining([100, 200, 300]),
          name: "Compras",
        }),
      ]),
      expect.objectContaining({
        xaxis: expect.objectContaining({
          title: expect.objectContaining({
            text: "Meses (Totais)",
          }),
        }),
        yaxis: expect.objectContaining({
          title: expect.objectContaining({
            text: "Valor (R$)",
          }),
        }),
      }),
      { displayModeBar: false },
    );
  });

  test("deve exibir uma mensagem quando não houver dados para o gráfico", async () => {
    const dadosVazios = {};

    const graficoTemDados = renderizarGrafico(
      "grafico-compras",
      dadosVazios,
      true,
    );

    expect(graficoTemDados).toBe("Não há dados para exibir no momento.");
  });

  test("deve renderizar gráfico de despesas por órgão corretamente", () => {
    renderizarGrafico("grafico-órgao", dadosDespesasPorOrgao);

    expect(Plotly.newPlot).toHaveBeenCalledWith(
      "grafico-órgao",
      expect.arrayContaining([
        expect.objectContaining({
          x: expect.arrayContaining(["2019", "2020", "2021"]),
          y: expect.arrayContaining([90, 130, 100]),
          name: "Empenhado",
        }),
        expect.objectContaining({
          x: expect.arrayContaining(["2019", "2020", "2021"]),
          y: expect.arrayContaining([70, 110, 80]),
          name: "Pago",
        }),
        expect.objectContaining({
          x: expect.arrayContaining(["2019", "2020", "2021"]),
          y: expect.arrayContaining([60, 100, 70]),
          name: "Liquidado",
        }),
      ]),
      expect.objectContaining({
        xaxis: expect.objectContaining({
          title: expect.objectContaining({
            text: "Ano",
          }),
        }),
        yaxis: expect.objectContaining({
          title: expect.objectContaining({
            text: "Valor (R$)",
          }),
        }),
      }),
      { displayModeBar: false },
    );
  });
});
