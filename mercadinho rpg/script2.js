let saldo = 0;
let carrinho = [];

// Carrega saldo do localStorage ao iniciar
function carregarSaldo() {
    const salvo = localStorage.getItem('saldoRPG');
    saldo = salvo !== null ? parseFloat(salvo) : 0;
}

function salvarSaldo() {
    localStorage.setItem('saldoRPG', saldo);
}

function atualizarSaldoVisual() {
    document.getElementById('saldoAtual').textContent = `Saldo atual: R$${saldo}`;
}

function atualizarCarrinho() {
    const carrinhoLista = document.getElementById('carrinho-lista');
    carrinhoLista.innerHTML = '';
    carrinho.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'carrinho-item';
        div.innerHTML = `
            <span class="carrinho-item-nome">${item.nome}</span>
            <span class="carrinho-item-preco">R$${item.preco}</span>
            <button class="remover-carrinho-btn" data-idx="${idx}">Remover</button>
        `;
        carrinhoLista.appendChild(div);
    });
    document.getElementById('carrinho-total').textContent = `Total: R$${carrinho.reduce((acc, item) => acc + item.preco, 0)}`;
}

function salvarHistoricoCompra(itens, total) {
    const historico = {
        itens: itens.map(i => ({ nome: i.nome, preco: i.preco })),
        total: total
    };
    localStorage.setItem('historicoCompraRPG', JSON.stringify(historico));
}

function carregarHistoricoCompra() {
    const historicoDiv = document.getElementById('historico-compra');
    const historico = localStorage.getItem('historicoCompraRPG');
    if (historico) {
        const dados = JSON.parse(historico);
        if (dados.itens.length === 0) {
            historicoDiv.innerHTML = '<span>Nenhuma compra realizada ainda.</span>';
            return;
        }
        let html = '<ul>';
        dados.itens.forEach(item => {
            html += `<li>${item.nome} - R$${item.preco}</li>`;
        });
        html += `</ul><strong>Total gasto: R$${dados.total}</strong>`;
        historicoDiv.innerHTML = html;
    } else {
        historicoDiv.innerHTML = '<span>Nenhuma compra realizada ainda.</span>';
    }
}

document.getElementById('setSaldoBtn').addEventListener('click', () => {
    const valor = parseFloat(document.getElementById('saldoInput').value);
    if (!isNaN(valor) && valor >= 0) {
        saldo = valor;
        salvarSaldo();
        atualizarSaldoVisual();
    }
});

document.getElementById('itens-lista').addEventListener('click', (e) => {
    if (e.target.classList.contains('add-carrinho-btn')) {
        const itemDiv = e.target.closest('.item');
        const nome = itemDiv.getAttribute('data-nome');
        const preco = parseFloat(itemDiv.getAttribute('data-preco'));
        carrinho.push({ nome, preco });
        atualizarCarrinho();
    }
});

document.getElementById('carrinho-lista').addEventListener('click', (e) => {
    if (e.target.classList.contains('remover-carrinho-btn')) {
        const idx = parseInt(e.target.getAttribute('data-idx'));
        carrinho.splice(idx, 1);
        atualizarCarrinho();
    }
});

document.getElementById('finalizarCompraBtn').addEventListener('click', () => {
    const total = carrinho.reduce((acc, item) => acc + item.preco, 0);
    if (total > saldo) {
        alert('Saldo insuficiente!');
        return;
    }
    saldo -= total;
    salvarSaldo();
    salvarHistoricoCompra(carrinho, total);
    atualizarSaldoVisual();
    carrinho = [];
    atualizarCarrinho();
    carregarHistoricoCompra();
    alert('Compra finalizada!');
});

// Controle de abas
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const tab = this.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(tc => {
            tc.style.display = tc.getAttribute('data-tab') === tab ? 'block' : 'none';
        });
    });
});
setTimeout(() => {
    alert('O seu saldo é salvo com com localStorage, então ele persistirá mesmo após fechar o navegador!');
}, 1000)
// Inicialização visual
carregarSaldo();
atualizarSaldoVisual();
atualizarCarrinho();
carregarHistoricoCompra();
carregarSaldo();
atualizarSaldoVisual();
atualizarCarrinho();
carregarHistoricoCompra();

// Modal de informações
document.getElementById('infoBtn').onclick = function() {
    document.getElementById('infoModal').style.display = 'block';
};
window.addEventListener('click', function(event) {
    const modal = document.getElementById('infoModal');
    if (event.target === modal) {
        modal.classList.add = 'hidden';
    }
});
