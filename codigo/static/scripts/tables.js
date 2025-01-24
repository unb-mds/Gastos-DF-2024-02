let secaoAtual = "compras";
let despesasAtuais = [];

const obterBarraDePesquisa = () => document.getElementById("search-input");

const obterMesSelecionado = () => document.getElementById("month-filter");

const obterAnoSelecionado = () => document.getElementById("year-filter");

function exibirQuantidadeResultados(data, resultCount) {
  if (data.length === 0) {
    resultCount.textContent = "Nenhum resultado encontrado.";
    return;
  }
  resultCount.textContent = `Exibindo ${data.length} resultado(s).`;
}

function renderizarTabelaCompras(data) {
  const tbody = document.querySelector("#table-body");
  const resultCount = document.querySelector("#result-count");
  tbody.innerHTML = "";
  secaoAtual = "compras";

  exibirQuantidadeResultados(data, resultCount);
  if (data.length === 0) return;

  data.forEach((item) => {
    const row = `<tr>
        <td>${item.empresa}</td>
        <td>${item.cnpj}</td>
        <td>${item.objeto}</td>
        <td>R$ ${item.valor.toFixed(2)}</td>
        <td>${item.data}</td>
      </tr>`;
    tbody.innerHTML += row;
  });
}

function renderizarTabelaDespesas(data) {
  const tabelaContainer = document.querySelector("#despesas-tabela-container");
  const resultCount = document.querySelector("#result-count");
  tabelaContainer.innerHTML = "";
  secaoAtual = "despesas";

  exibirQuantidadeResultados(data, resultCount);

  const tabelaHtml = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Ano</th>
            <th>Órgão</th>
            <th>Código do Órgão</th>
            <th>Empenhado</th>
            <th>Liquidado</th>
            <th>Pago</th>
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (item) => `
                <tr>
                  <td>${item.ano}</td>
                  <td>${item.orgao}</td>
                  <td>${item.codigoOrgao}</td>
                  <td>R$ ${item.empenhado.toFixed(2)}</td>
                  <td>R$ ${item.liquidado.toFixed(2)}</td>
                  <td>R$ ${item.pago.toFixed(2)}</td>
                </tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;

  tabelaContainer.innerHTML = tabelaHtml;
}

function mostrarTabela() {
  const comprasContainer = document.getElementById("compras-container");
  const despesasContainer = document.getElementById("despesas-container");
  const filtroPorMesContainer = document.getElementById(
    "month-filter-container"
  );
  const filtroPorMes = obterMesSelecionado();
  const filtroPorAnoContainer = document.getElementById(
    "year-filter-container"
  );

  const filtroPorAno = obterAnoSelecionado();
  const containerPesquisa = obterBarraDePesquisa();
  const secaoTitulo = document.getElementById("secao-selecionada");

  containerPesquisa.value = "";

  if (secaoAtual === "compras") {
    comprasContainer.style.display = "block";
    despesasContainer.style.display = "none";
    filtroPorMesContainer.style.display = "block";

    filtroPorAnoContainer.style.display = "none";
    filtroPorAno.value = "";

    secaoTitulo.textContent = "Compras";

    renderizarTabelaCompras(gastosCompras);
  } else if (secaoAtual === "despesas") {
    comprasContainer.style.display = "none";
    despesasContainer.style.display = "block";

    filtroPorMesContainer.style.display = "none";
    filtroPorMes.value = "";

    filtroPorAnoContainer.style.display = "block";
    renderizarTabelaDespesas(despesasAtuais);
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
  const mesSelecionado = obterMesSelecionado().value;

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

  renderizarTabelaCompras(dadosFiltrados);
}

function PesquisarTabelaDespesas() {
  const pesquisa = obterBarraDePesquisa().value.toLowerCase().trim();
  const anoSelecionado = obterAnoSelecionado().value;

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
  renderizarTabelaDespesas(dadosFiltrados);
}

function AtivarDropdown() {
  document.getElementById("dropdownContent").classList.toggle("show");
}

// Fecha o dropdown se o usuário clicar fora dele
window.onclick = function (event) {
  if (!event.target.matches("#dropdownButton")) {
    const dropdowns = document.getElementsByClassName("dropdown-content");
    for (let i = 0; i < dropdowns.length; i++) {
      const openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};

document
  .getElementById("dropdownButton")
  .addEventListener("click", function (event) {
    event.stopPropagation();
    AtivarDropdown();
  });

document.getElementById("month-filter").addEventListener("change", function () {
  PesquisarTabelaCompras();
});

document.getElementById("year-filter").addEventListener("change", function () {
  PesquisarTabelaDespesas();
});

document
  .getElementById("botao-pesquisar")
  .addEventListener("click", function () {
    if (secaoAtual === "despesas") PesquisarTabelaDespesas();
    else PesquisarTabelaCompras();
  });

mostrarTabela();

function downloadTabelas() {
  const tabelaAtiva = secaoAtual === "compras" 
    ? document.querySelector("#compras-container table") 
    : document.querySelector("#despesas-container table");

  if (!tabelaAtiva) {
    alert("Nenhuma tabela disponível para download.");
    return;
  }

  const headers = Array.from(tabelaAtiva.querySelectorAll('thead th')).map(th => th.innerText.trim());
  const rows = Array.from(tabelaAtiva.querySelectorAll('tbody tr')).map(tr => {
    return Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
  });

  const tabelaData = { headers, rows };

  fetch('/baixar-tabelas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tabelas: [tabelaData] }) 
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Erro ao gerar o PDF');
    }
    return response.blob();
  })
  .then(blob => {
    // Cria o link de download do PDF
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${secaoAtual}_filtrada.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  })
  .catch(error => {
    console.error(error);
    alert('Erro ao fazer o download da tabela.');
  });
}
