let secaoAtual = "compras";
let despesasAtuais = [];

const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const obterBarraDePesquisa = () => document.getElementById("search-input");

const obterFiltroSelect = () => document.getElementById("filter-select");
const obterTipoDeFiltro = () => document.getElementById("filter-type");

const obterValorPadraoDoFiltro = () =>
  document.getElementById("valor-padrao");

function exibirQuantidadeResultados(dados, quantidadeDeResultados) {
  if (dados.length === 0) {
    quantidadeDeResultados.textContent = "Nenhum resultado encontrado.";
    return;
  }
  quantidadeDeResultados.textContent = `Exibindo ${dados.length} resultado(s).`;
}

function renderizarTabela(dados) {
  const tbody = document.querySelector("#table-container");
  const quantidadeDeResultados = document.querySelector("#result-count");
  tbody.innerHTML = "";

  exibirQuantidadeResultados(dados, quantidadeDeResultados);

  if (dados.length === 0) return;

  const tabelaHtml = `
  <table class="data-table">
    <thead>
      ${
        secaoAtual === "compras"
          ? `
        <tr>
          <th>Empresa</th>
          <th>CNPJ</th>
          <th>Objeto</th>
          <th>Valor</th>
          <th>Data</th>
        </tr>`
          : secaoAtual === "despesas"
            ? `
        <tr>
          <th>Ano</th>
          <th>Órgão</th>
          <th>Código do Órgão</th>
          <th>Empenhado</th>
          <th>Liquidado</th>
          <th>Pago</th>
        </tr>`
            : secaoAtual === "bolsaFamilia"
              ? `
        <tr>
          <th>Data de Referência</th>
          <th>Tipo</th>
          <th>Valor</th>
          <th>Quantidade de Beneficiados</th>
        </tr>`
              : `
        <tr>
          <th>Ano</th>
          <th>Valor Renunciado</th>
          <th>Tipo de Renúncia</th>
          <th>CNPJ</th>
          <th>Razão Social</th>
          <th>UF</th>
          <th>Município</th>
        </tr>`
      }
    </thead>
    <tbody>
      ${
        secaoAtual === "compras"
          ? dados
              .map(
                (item) => `<tr>
              <td>${item.empresa}</td>
              <td>${item.cnpj}</td>
              <td>${item.objeto}</td>
              <td>R$ ${item.valor.toFixed(2)}</td>
              <td>${item.data}</td>
            </tr>`,
              )
              .join("")
          : secaoAtual === "despesas"
            ? dados
                .map(
                  (item) => `<tr>
              <td>${item.ano}</td>
              <td>${item.orgao}</td>
              <td>${item.codigoOrgao}</td>
              <td>R$ ${item.empenhado.toFixed(2)}</td>
              <td>R$ ${item.liquidado.toFixed(2)}</td>
              <td>R$ ${item.pago.toFixed(2)}</td>
            </tr>`,
                )
                .join("")
            : secaoAtual === "bolsaFamilia"
              ? dados
                  .map((item) => {
                    const dataReferencia = new Date(item.dataReferencia);
                    const dia = dataReferencia
                      .getDate()
                      .toString()
                      .padStart(2, "0"); // Adiciona o zero à esquerda se necessário
                    const mes = (dataReferencia.getMonth() + 1)
                      .toString()
                      .padStart(2, "0"); // Mes é 0-11, então somamos 1
                    const ano = dataReferencia.getFullYear();
                    return `<tr>
              <td>${dia}/${mes}/${ano}</td>
              <td>${item.tipo}</td>
              <td>${item.valor}</td>
              <td>${item.quantidadeBeneficiados}</td>
            </tr>`;
                  })
                  .join("")
              : dados
                  .map(
                    (item) => `<tr>
              <td>${item.ano}</td>
              <td>R$ ${item.valorRenunciado.toFixed(2)}</td>
              <td>${item.tipoRenuncia}</td>
              <td>${item.cnpj}</td>
              <td>${item.razaoSocial}</td>
              <td>${item.uf}</td>
              <td>${item.municipio}</td>
            </tr>`,
                  )
                  .join("")
      }
    </tbody>
  </table>
`;

  tbody.innerHTML = tabelaHtml;
}

function montarValorPadraoDoFiltro(valor) {
  const valorPadrao = obterValorPadraoDoFiltro();
  valorPadrao.textContent = `Todos os ${valor}`;
}

function montarOpcoesFiltro(opcoes, filtroSelect) {
  opcoes.forEach((opcao, index) => {
    const mesNumero = index < 10 ? `0${index + 1}` : index + 1;

    const opcaoElement = document.createElement("option");
    opcaoElement.value = secaoAtual === "compras" ? mesNumero : opcao;
    opcaoElement.textContent = opcao;
    filtroSelect.appendChild(opcaoElement);
  });
}

function montarOpcoesFiltroMes(filtroSelect) {
  montarValorPadraoDoFiltro("Meses");
  const tipoDeFiltro = obterTipoDeFiltro();

  if (tipoDeFiltro) tipoDeFiltro.textContent = "Meses";

  if (secaoAtual === "bolsaFamilia") {
    // Cria um Set para armazenar meses que têm dados

    const mesesComDados = new Set();
    bolsaFamilia.forEach((item) => {
      const data = new Date(item.dataReferencia);
      const mesNumero = data.getMonth(); // 0-11
      mesesComDados.add(mesNumero);
    });

    // Cria opções para todos os meses
    meses.forEach((mes, index) => {
      const mesNumero = (index + 1).toString().padStart(2, "0");
      const opcaoElement = document.createElement("option");
      opcaoElement.value = mesNumero;
      opcaoElement.textContent = mes;

      // Se o mês não tem dados, adiciona um indicador visual
      if (!mesesComDados.has(index)) {
        opcaoElement.textContent += " (Sem dados)";
        opcaoElement.style.color = "#999";
      }

      filtroSelect.appendChild(opcaoElement);
    });
  } else {
    // Mantém a lógica original para outros tipos de dados
    montarOpcoesFiltro(meses, filtroSelect);
  }
}

function montarOpcoesFiltroAno(filtroSelect) {
  montarValorPadraoDoFiltro("Anos");
  const tipoDeFiltro = obterTipoDeFiltro();
  tipoDeFiltro.textContent = "Anos";

  montarOpcoesFiltro(anos, filtroSelect);
}

function desmontarOpcoesFiltro(filtroSelect) {
  const valorPadrao = document.getElementById("valor-padrao");
  const valorPadraoTexto = valorPadrao ? valorPadrao.textContent : "";

  // Limpa todas as opções, exceto a de valor-padrao
  filtroSelect.innerHTML = "";

  if (valorPadrao) {
    const opcaoPadrao = document.createElement("option");
    opcaoPadrao.id = "valor-padrao";
    opcaoPadrao.textContent = valorPadraoTexto;
    opcaoPadrao.value = "";
    filtroSelect.appendChild(opcaoPadrao);
  }
}

function mostrarTabela() {
  const filtroSelecionado = obterFiltroSelect();

  const containerPesquisa = obterBarraDePesquisa();
  const secaoTitulo = document.getElementById("secao-selecionada");

  containerPesquisa.value = "";

  if (secaoAtual === "compras") {
    desmontarOpcoesFiltro(filtroSelecionado);
    montarOpcoesFiltroMes(filtroSelecionado);
    secaoTitulo.textContent = "Compras";

    renderizarTabela(gastosCompras);
  } else if (secaoAtual === "despesas") {
    desmontarOpcoesFiltro(filtroSelecionado);
    montarOpcoesFiltroAno(filtroSelecionado);

    secaoTitulo.textContent = "Despesas";
    renderizarTabela(despesasAtuais);
  } else if (secaoAtual === "bolsaFamilia") {
    desmontarOpcoesFiltro(filtroSelecionado);
    montarOpcoesFiltroAno(filtroSelecionado);
    secaoTitulo.textContent = "Bolsa Família";
    renderizarTabela(bolsaFamilia);
  }
}

function mostrarDespesasPorOrgao(orgao) {
  const nomeOrgao = orgao.split(" ").slice(1).join(" ");
  document.getElementById("secao-selecionada").textContent = nomeOrgao;
  despesasAtuais = despesasPorOrgao[orgao];
  mostrarTabela();
}

function PesquisarTabelaCompras() {
  const pesquisa = obterBarraDePesquisa().value.toLowerCase().trim();
  const mesSelecionado = obterFiltroSelect().value;

  const dadosFiltrados = gastosCompras.filter((item) => {
    const mesDaData = item.data.split("/")[1];

    const correspondeAPesquisa =
      pesquisa === "" ||
      item.empresa.toLowerCase().includes(pesquisa) ||
      item.cnpj.toLowerCase().includes(pesquisa) ||
      item.objeto.toLowerCase().includes(pesquisa) ||
      item.data.includes(pesquisa) ||
      item.valor.toString().includes(pesquisa);

    if (!mesSelecionado) return correspondeAPesquisa;

    const correspondeAoMes = mesDaData === mesSelecionado;

    return correspondeAoMes && correspondeAPesquisa;
  });

  renderizarTabela(dadosFiltrados);
}

function PesquisarTabelaBolsaFamilia() {
  const pesquisa = obterBarraDePesquisa().value.toLowerCase().trim();
  const mesSelecionado = obterFiltroSelect().value;

  const dadosFiltrados = bolsaFamilia.filter((item) => {
    const dataReferencia = new Date(item.dataReferencia);
    const mesNumero = (dataReferencia.getMonth() + 1)
      .toString()
      .padStart(2, "0");

    const correspondeAPesquisa =
      pesquisa === "" ||
      item.tipo.descricao.toLowerCase().includes(pesquisa) ||
      item.dataReferencia.includes(pesquisa) ||
      item.valor.toString().includes(pesquisa) ||
      item.quantidadeBeneficiados.toString().includes(pesquisa);

    if (!mesSelecionado) return correspondeAPesquisa;

    const correspondeAoMes = mesNumero === mesSelecionado;
    return correspondeAoMes && correspondeAPesquisa;
  });

  renderizarTabela(dadosFiltrados);
}

function mostrarTabelaBolsaFamilia() {
  secaoAtual = "bolsaFamilia";
  const filtroSelecionado = obterFiltroSelect();
  const containerPesquisa = obterBarraDePesquisa();
  const secaoTitulo = document.getElementById("secao-selecionada");

  containerPesquisa.value = "";
  secaoTitulo.textContent = "Bolsa Família";

  desmontarOpcoesFiltro(filtroSelecionado);
  montarOpcoesFiltroMes(filtroSelecionado);

  renderizarTabela(bolsaFamilia);
}

function PesquisarTabelaDespesas() {
  const pesquisa = obterBarraDePesquisa().value.toLowerCase().trim();
  const anoSelecionado = obterFiltroSelect().value;

  const dadosFiltrados = despesasAtuais.filter((item) => {
    const correspondeAPesquisa =
      pesquisa === "" ||
      item.ano.toString().includes(pesquisa) ||
      item.orgao.toLowerCase().includes(pesquisa) ||
      item.codigoOrgao.toString().includes(pesquisa) ||
      item.empenhado.toString().includes(pesquisa) ||
      item.liquidado.toString().includes(pesquisa) ||
      item.pago.toString().includes(pesquisa);

    if (!anoSelecionado) return correspondeAPesquisa;

    const correspondeAoAno = item.ano.toString() === anoSelecionado;

    return correspondeAoAno && correspondeAPesquisa;
  });
  renderizarTabela(dadosFiltrados);
}

function PesquisarTabelaRenuncias() {
  const pesquisa = obterBarraDePesquisa().value.toLowerCase().trim();
  const anoSelecionado = obterFiltroSelect().value;

  const dadosFiltrados = renunciasAtuais.filter((item) => {
    const correspondeAPesquisa =
      pesquisa === "" ||
      item.ano.toString().includes(pesquisa) ||
      item.valorRenunciado.toString().includes(pesquisa) ||
      item.tipoRenuncia.toLowerCase().includes(pesquisa) ||
      item.cnpj.toLowerCase().includes(pesquisa) ||
      item.razaoSocial.toLowerCase().includes(pesquisa) ||
      item.uf.toLowerCase().includes(pesquisa) ||
      item.municipio.toLowerCase().includes(pesquisa);

    if (!anoSelecionado) return correspondeAPesquisa;

    const correspondeAoAno = item.ano.toString() === anoSelecionado;

    return correspondeAoAno && correspondeAPesquisa;
  });
  renderizarTabela(dadosFiltrados);
}

function AtivarDropdown() {
  document.getElementById("dropdownContent").classList.toggle("show");
}

// Fecha o dropdown se o usuário clicar fora dele
window.onclick = function (event) {
  if (!event.target.matches("#dropdownButton")) {
    const dropdowns = document.getElementsByClassName("dropdown-content");
    for (let i = 0; i < dropdowns.length; i++) {
      const abrirDropdown = dropdowns[i];
      if (abrirDropdown.classList.contains("show")) {
        abrirDropdown.classList.remove("show");
      }
    }
  }
};

function inicializarEventListeners() {
  document
    .getElementById("dropdownButton")
    ?.addEventListener("click", function (event) {
      event.stopPropagation();
      AtivarDropdown();
    });

  obterFiltroSelect().addEventListener("change", function () {
    if (secaoAtual === "compras") PesquisarTabelaCompras();
    else if (secaoAtual === "despesas") PesquisarTabelaDespesas();
    else if (secaoAtual === "bolsaFamilia") PesquisarTabelaBolsaFamilia();
    else if (secaoAtual.startsWith("renuncia_")) PesquisarTabelaRenuncias();
  });

  document
    .getElementById("botao-pesquisar")
    .addEventListener("click", function () {
      if (secaoAtual === "despesas") PesquisarTabelaDespesas();
      else if (secaoAtual === "compras") PesquisarTabelaCompras();
      else if (secaoAtual === "bolsaFamilia") PesquisarTabelaBolsaFamilia();
      else if (secaoAtual.startsWith("renuncia_")) PesquisarTabelaRenuncias();
    });
}

// Remover as chamadas diretas dos event listeners
// e substituir por uma verificação se estamos em ambiente de teste
if (typeof process === "undefined") {
  // Estamos no navegador
  inicializarEventListeners();
  mostrarTabela();
}

function baixarTabelas() {
  const tabelaAtiva = document.querySelector("#table-container table");

  if (!tabelaAtiva) {
    alert("Nenhuma tabela disponível para download.");
    return;
  }

  // Obtém o título dinâmico com base na seção ou no contexto atual
  const secaoTitulo = document
    .getElementById("secao-selecionada")
    .textContent.trim();
  const tituloPDF = `Gastos - ${secaoTitulo}`;

  // Extrai os dados da tabela
  const cabecalhos = Array.from(tabelaAtiva.querySelectorAll("thead th")).map(
    (th) => th.innerText.trim(),
  );
  const linhas = Array.from(tabelaAtiva.querySelectorAll("tbody tr")).map(
    (tr) => {
      return Array.from(tr.querySelectorAll("td")).map((td) =>
        td.innerText.trim(),
      );
    },
  );

  // Prepara os dados da tabela e o título para envio ao backend
  const tabelaData = { cabecalhos, linhas, titulo: tituloPDF };

  fetch("/baixar-tabelas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tabelas: [tabelaData] }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao gerar o PDF");
      }
      return response.blob();
    })
    .then((blob) => {
      // Usa o título dinâmico no nome do arquivo baixado
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tituloPDF}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    })
    .catch((error) => {
      console.error(error);
      alert("Erro ao fazer o download da tabela.");
    });
}

module.exports = {
  exibirQuantidadeResultados,
  renderizarTabela,
  montarValorPadraoDoFiltro,
  montarOpcoesFiltro,
  desmontarOpcoesFiltro,
  mostrarTabela,
  mostrarDespesasPorOrgao,
  PesquisarTabelaCompras,
  PesquisarTabelaDespesas,
  AtivarDropdown,
  baixarTabelas,
  inicializarEventListeners,
};
