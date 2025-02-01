const {
    exibirQuantidadeResultados,
    renderizarTabela,
    montarValorPadraoDoFiltro,
    montarOpcoesFiltro,
    desmontarOpcoesFiltro,
    mostrarTabela,
    PesquisarTabelaCompras,
    AtivarDropdown,
    baixarTabelas
  } = require('../../static/scripts/tabelas');
  
  document.body.innerHTML = `
    <input id="search-input" type="text" />
    <select id="filter-select">
      <option id="valor-padrao" value="">Todos</option>
    </select>
    <div id="table-container"></div>
    <div id="result-count"></div>
    <div id="secao-selecionada"></div>
    <div id="dropdownButton"></div>
    <div id="dropdownContent"></div>
    <div id="botao-pesquisar"></div>
  `;
  
  
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve([]),
      blob: () => Promise.resolve(new Blob()),
    })
  );
  
  describe('exibirQuantidadeResultados', () => {
    let quantidadeDeResultados;
  
    beforeEach(() => {
      quantidadeDeResultados = document.getElementById('result-count');
    });
    test('deve exibir mensagem quando não há resultados', () => {
      const dados = [];
      exibirQuantidadeResultados(dados, quantidadeDeResultados);
      expect(quantidadeDeResultados.textContent).toBe('Nenhum resultado encontrado.');
    });
    test('deve exibir quantidade correta de resultados', () => {
      const dados = [{ id: 1 }, { id: 2 }];
      exibirQuantidadeResultados(dados, quantidadeDeResultados);
      expect(quantidadeDeResultados.textContent).toBe('Exibindo 2 resultado(s).');
    });
  });
  
  describe('renderizarTabela', () => {
    let tableContainer;
  
  
    beforeEach(() => {
      tableContainer = document.getElementById('table-container');
      global.secaoAtual = 'compras';
    });
  
    test('deve renderizar tabela vazia quando não há dados', () => {
  
      const dados = [];
      renderizarTabela(dados);
      expect(tableContainer.innerHTML).toBe('');
  
    });
  
    test('deve renderizar tabela de compras corretamente', () => {
  
      const dados = [{
  
        empresa: 'Empresa Teste',
        cnpj: '12345678901234',
        objeto: 'Objeto Teste',
        valor: 1000.00,
        data: '01/01/2024'
  
      }];
  
      renderizarTabela(dados);
      expect(tableContainer.innerHTML).toContain('Empresa Teste');
      expect(tableContainer.innerHTML).toContain('12345678901234');
      expect(tableContainer.innerHTML).toContain('R$ 1000.00');
    });
  });
  
  describe('montarValorPadraoDoFiltro', () => {
  
    test('deve montar valor padrão corretamente', () => {
  
      const valorPadrao = document.getElementById('valor-padrao');
      montarValorPadraoDoFiltro('Meses');
      expect(valorPadrao.textContent).toBe('Todos os Meses');
  
    });
  });
  
  describe('PesquisarTabelaCompras', () => {
  
    beforeEach(() => {
  
      global.gastosCompras = [
        {
          empresa: 'Empresa A',
          cnpj: '12345678901234',
          objeto: 'Objeto A',
          valor: 1000.00,
          data: '01/01/2024'
        },
        {
          empresa: 'Empresa B',
          cnpj: '56789012345678',
          objeto: 'Objeto B',
          valor: 2000.00,
          data: '01/02/2024'
  
        }
      ];
    });
  
    test('deve filtrar por empresa corretamente', () => {
  
      document.getElementById('search-input').value = 'Empresa A';
      document.getElementById('filter-select').value = '';
      
      PesquisarTabelaCompras();
      
      const tableContainer = document.getElementById('table-container');
      expect(tableContainer.innerHTML).toContain('Empresa A');
      expect(tableContainer.innerHTML).not.toContain('Empresa B');
  
    });
  });
  
  describe('desmontarOpcoesFiltro', () => {
  
    test('deve limpar opções e manter valor padrão', () => {
  
      const filtroSelect = document.getElementById('filter-select');
      const valorPadrao = document.createElement('option');
      valorPadrao.id = 'valor-padrao';
      valorPadrao.textContent = 'Todos';
      filtroSelect.appendChild(valorPadrao);
      const opcaoExtra = document.createElement('option');
      opcaoExtra.textContent = 'Extra';
      filtroSelect.appendChild(opcaoExtra);
      desmontarOpcoesFiltro(filtroSelect);
      expect(filtroSelect.children.length).toBe(1);
      expect(filtroSelect.children[0].id).toBe('valor-padrao');
  
    });
  });
  
  describe('montarOpcoesFiltroAno', () => {
  
    let filtroSelect;
    beforeEach(() => {
  
      filtroSelect = document.getElementById('filter-select');
      filtroSelect.innerHTML = '<option id="valor-padrao" value="">Todos</option>';
  
    });
  
    test('deve montar anos corretamente', () => {
  
      // criando teste de ano de 2019 até o atual
      const anoAtual = new Date().getFullYear();
      const anos = [];
      for (let ano = 2019; ano <= anoAtual; ano++) {
        anos.push(ano.toString());
      }
      
      montarOpcoesFiltro(anos, filtroSelect);
      montarValorPadraoDoFiltro('Anos');
      expect(filtroSelect.children.length).toBe(anos.length + 1); 
      expect(filtroSelect.children[1].textContent).toBe('2019');
      expect(filtroSelect.children[filtroSelect.children.length - 1].textContent).toBe(anoAtual.toString());
  
    });
  
    test('deve configurar valor padrão corretamente', () => {
  
      montarValorPadraoDoFiltro('Anos');
      const valorPadrao = document.getElementById('valor-padrao');
      expect(valorPadrao.textContent).toBe('Todos os Anos');
  
    });
  });
  
  describe('mostrarTabela', () => {
  
    beforeEach(() => {
  
      global.gastosCompras = [
        {
          empresa: 'Empresa Teste',
          cnpj: '12345678901234',
          objeto: 'Objeto Teste',
          valor: 1000.00,
          data: '01/01/2024'
        }
  
      ];
      global.secaoAtual = 'compras';
  
    });
  
    test('deve renderizar tabela inicial corretamente', () => {
  
      mostrarTabela();
      
      const tableContainer = document.getElementById('table-container');
      expect(tableContainer.innerHTML).toContain('Empresa Teste');
      expect(tableContainer.innerHTML).toContain('12345678901234');
  
    });
  });
  
  describe('AtivarDropdown', () => {
  
    beforeEach(() => {
  
      document.getElementById('dropdownContent').classList.remove('show');
    });
  
    test('deve alternar classe show do dropdown', () => {
  
      AtivarDropdown();
      expect(document.getElementById('dropdownContent').classList.contains('show')).toBe(true);
      
      AtivarDropdown();
      expect(document.getElementById('dropdownContent').classList.contains('show')).toBe(false);
  
    });
  });
  
  describe('baixarTabelas', () => {
  
    beforeEach(() => {
  
      global.fetch.mockClear();
      global.URL.createObjectURL = jest.fn();
      global.URL.revokeObjectURL = jest.fn();
      document.getElementById('table-container').innerHTML = `
        <table class="data-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>CNPJ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Empresa Teste</td>
              <td>12345678901234</td>
            </tr>
          </tbody>
        </table>
      `;
  
    });
  
    test('deve exibir alerta quando não há tabela', () => {
  
      document.getElementById('table-container').innerHTML = '';
      global.alert = jest.fn();
  
      baixarTabelas();
  
      expect(global.alert).toHaveBeenCalledWith('Nenhuma tabela disponível para download.');
      
    });
  });