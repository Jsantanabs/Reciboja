// Função para formatar valor monetário
function formatarMoeda(valor) {
    let stringValue = String(valor);
    // Remove thousand separators (dots) first, then replace comma with dot for decimal.
    // This ensures numbers like "3.700,00" become "3700.00" before parseFloat.
    let cleanedValue = stringValue.replace(/\./g, '').replace(',', '.');
    let numericValue = parseFloat(cleanedValue);

    if (isNaN(numericValue)) {
        return "0,00";
    }
    return numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Função para formatar data
function formatarData(dataString) {
    if (!dataString) return '____/____/________';
    try {
        const [ano, mes, dia] = dataString.split('-');
        return `${dia}/${mes}/${ano}`;
    } catch (e) {
        console.error("Erro ao formatar data:", e);
        return '____/____/________'; // Retorno seguro em caso de erro
    }
}

// Função para converter número em extenso
function extenso(numero) {
    // Garante que o número é um número antes de processar
    // Correção: Agora, a função `formatarMoeda` já lida com a conversão de string para number de forma robusta.
    // Para a função `extenso`, é melhor receber o valor numérico direto ou fazer uma limpeza similar.
    let valorNumericoParaExtenso = typeof numero === 'string' ? parseFloat(numero.replace(/\./g, '').replace(",", ".")) : numero;

    if (isNaN(valorNumericoParaExtenso) || valorNumericoParaExtenso === 0) {
        return "zero reais";
    }

    const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
    const dezenas = ["", "dez", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
    const especiais = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
    const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

    function numeroPorExtenso(num) {
        if (num === 0) return "";
        if (num < 10) return unidades[num];
        if (num < 20) return especiais[num - 10];
        if (num < 100) {
            const dez = Math.floor(num / 10);
            const unid = num % 10;
            return dezenas[dez] + (unid > 0 ? " e " + unidades[unid] : "");
        }
        if (num < 1000) {
            const cent = Math.floor(num / 100);
            const resto = num % 100;
            if (cent === 1 && resto === 0) return "cem";
            return centenas[cent] + (resto > 0 ? " e " + numeroPorExtenso(resto) : "");
        }
        return ""; // Para números maiores que 999
    }

    const partes = {
        bilhoes: Math.floor(valorNumericoParaExtenso / 1000000000),
        milhoes: Math.floor((valorNumericoParaExtenso % 1000000000) / 1000000),
        milhares: Math.floor((valorNumericoParaExtenso % 1000000) / 1000),
        inteiros: Math.floor(valorNumericoParaExtenso % 1000),
        centavos: Math.round((valorNumericoParaExtenso - Math.floor(valorNumericoParaExtenso)) * 100)
    };

    let texto = [];

    if (partes.bilhoes > 0) {
        texto.push(numeroPorExtenso(partes.bilhoes) + (partes.bilhoes === 1 ? " bilhão" : " bilhões"));
    }
    if (partes.milhoes > 0) {
        texto.push(numeroPorExtenso(partes.milhoes) + (partes.milhoes === 1 ? " milhão" : " milhões"));
    }
    if (partes.milhares > 0) {
        texto.push(numeroPorExtenso(partes.milhares) + " mil");
    }
    if (partes.inteiros > 0) {
        texto.push(numeroPorExtenso(partes.inteiros));
    }

    let resultadoInteiro = texto.filter(Boolean).join(" e ");
    if (resultadoInteiro === "" && partes.centavos === 0) {
        return "zero reais";
    }

    let resultadoFinal = "";
    if (resultadoInteiro !== "") {
        resultadoFinal += resultadoInteiro + (partes.inteiros === 1 && partes.milhares === 0 && partes.milhoes === 0 && partes.bilhoes === 0 ? " real" : " reais");
    }

    if (partes.centavos > 0) {
        if (resultadoFinal !== "") {
            resultadoFinal += " e ";
        }
        resultadoFinal += numeroPorExtenso(partes.centavos) + (partes.centavos === 1 ? " centavo" : " centavos");
    }

    return resultadoFinal;
}

// --- Funções de Autoformatação ---

// Autoformatação para valores monetários
function autoFormatarMoeda(event) {
    let input = event.target;
    let value = input.value.replace(/\D/g, ''); // Remove tudo que não é número
    if (value === '') {
        input.value = '';
        return;
    }

    // Converte para centavos para evitar problemas de ponto flutuante
    let cents = parseInt(value, 10);
    // Converte para reais (dividindo por 100)
    let real = (cents / 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    input.value = real;
}

// Autoformatação para CPF/CNPJ
function autoFormatarCpfCnpj(event) {
    let input = event.target;
    let value = input.value.replace(/\D/g, ''); // Remove tudo que não é número
    let formattedValue = '';

    if (value.length <= 11) { // CPF
        formattedValue = value.replace(/(\d{3})(\d)/, '$1.$2');
        formattedValue = formattedValue.replace(/(\d{3})(\d)/, '$1.$2');
        formattedValue = formattedValue.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else { // CNPJ
        formattedValue = value.replace(/^(\d{2})(\d)/, '$1.$2');
        formattedValue = formattedValue.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        formattedValue = formattedValue.replace(/\.(\d{3})(\d)/, '.$1/$2');
        formattedValue = formattedValue.replace(/(\d{4})(\d)/, '$1-$2');
    }
    input.value = formattedValue;
}


// Função para mostrar/esconder o formulário do documento
function showDocumentForm() {
    const documentType = document.getElementById('documentType').value;
    const allForms = document.querySelectorAll('.document-form');
    const documentContent = document.getElementById('documentContent');
    const printButton = document.getElementById('printButton');

    // Esconde todos os formulários primeiro
    allForms.forEach(form => {
        form.classList.add('hidden');
    });

    // Reseta o conteúdo da prévia e esconde o botão de imprimir
    documentContent.innerHTML = '<p class="center-text">Selecione um tipo de documento e preencha os dados para visualizar.</p>';
    printButton.style.display = 'none';

    // Mostra o formulário selecionado
    if (documentType === 'simpleReceipt') {
        document.getElementById('simpleReceiptForm').classList.remove('hidden');
    } else if (documentType === 'salaryReceipt') {
        document.getElementById('salaryReceiptForm').classList.remove('hidden');
    } else if (documentType === 'rentReceipt') {
        document.getElementById('rentReceiptForm').classList.remove('hidden');
    } else if (documentType === 'promissoryNote') {
        document.getElementById('promissoryNoteForm').classList.remove('hidden');
    } else if (documentType === 'voucher') {
        document.getElementById('voucherForm').classList.remove('hidden');
    }
}

// --- Função para Imprimir Duas Vias na Mesma Folha (Atualizada) ---
function imprimirDuasVias() {
    const documentContentElement = document.getElementById('documentContent');
    const originalContentHTML = documentContentElement.innerHTML; // Salva o conteúdo original do innerHTML

    // Cria um container temporário para a impressão
    const printContainer = document.createElement('div');
    printContainer.classList.add('print-container'); // Adiciona uma classe para o CSS de impressão

    // Constrói o HTML para as duas vias dentro do container
    // Removendo o print-page-break para que as vias fiquem na mesma página
    const twoViasHTML = `
        <div class="print-via">
            <p class="center-text via-label">--- 1ª VIA ---</p>
            <div class="receipt-content-printable">${originalContentHTML}</div>
        </div>
        <div class="print-via" style="margin-top: 40px;"> <p class="center-text via-label">--- 2ª VIA ---</p>
            <div class="receipt-content-printable">${originalContentHTML}</div>
        </div>
    `;

    printContainer.innerHTML = twoViasHTML;

    // Adiciona o container de impressão ao body
    document.body.appendChild(printContainer);

    // Chama a função de impressão do navegador
    window.print();

    // Remove o container de impressão do body após a impressão
    setTimeout(() => {
        document.body.removeChild(printContainer);
    }, 500); // 500ms de delay
}


// FUNÇÕES DE GERAÇÃO DE DOCUMENTOS

// Gerar Recibo Simples
function gerarReciboSimples() {
    const valor = document.getElementById('simple_valor').value;
    const beneficiario = document.getElementById('simple_beneficiario').value || '____________________';
    const referencia = document.getElementById('simple_referencia').value || '____________________';
    const data = document.getElementById('simple_data').value;
    const cidade = document.getElementById('simple_cidade').value || '____________________'; // Novo campo
    const emitente = document.getElementById('simple_emitente').value || '____________________';
    const documentoEmitente = document.getElementById('simple_documentoEmitente').value || '';

    const valorFormatado = formatarMoeda(valor); // Passar a string formatada para formatarMoeda
    const dataFormatada = formatarData(data);
    const valorExtenso = extenso(valor); // Passar a string formatada para extenso para que ela limpe

    const reciboHTML = `
        <p class="center-text"><span class="bold">RECIBO</span></p>
        <p>Recebemos de <span class="bold">${beneficiario}</span>, a quantia de <span class="bold">R$ ${valorFormatado}</span> (${valorExtenso}) referente a <span class="bold">${referencia}</span>.</p>
        <br>
        <p>${cidade}, ${dataFormatada}.</p>
        <br>
        <br>
        <p class="center-text">_________________________________________</p>
        <p class="center-text">${emitente}</p>
        <p class="center-text">${documentoEmitente ? 'CPF/CNPJ: ' + documentoEmitente : 'CPF/CNPJ: _____________'}</p>
    `;

    document.getElementById('documentContent').innerHTML = reciboHTML;
    document.getElementById('printButton').style.display = 'block';
}

// Gerar Recibo de Salário
function gerarReciboSalario() {
    const periodo = document.getElementById('salary_periodo').value || '____________________';
    const nomeFuncionario = document.getElementById('salary_nomeFuncionario').value || '____________________';
    const cpfFuncionario = document.getElementById('salary_cpfFuncionario').value || '';
    const cargo = document.getElementById('salary_cargo').value || '____________________';
    // Passa os valores das strings diretamente para formatarMoeda e extenso
    const salarioBase = document.getElementById('salary_salarioBase').value;
    const horasExtras = document.getElementById('salary_horasExtras').value;
    const comissoes = document.getElementById('salary_comissoes').value;
    const outrosAdicionais = document.getElementById('salary_outrosAdicionais').value;
    const inss = document.getElementById('salary_inss').value;
    const irrf = document.getElementById('salary_irrf').value;
    const outrosDescontos = document.getElementById('salary_outrosDescontos').value;

    const dataPagamento = document.getElementById('salary_dataPagamento').value;
    const cidade = document.getElementById('salary_cidade').value || '____________________'; // Novo campo
    const nomeEmpresa = document.getElementById('salary_nomeEmpresa').value || '____________________';
    const cnpjEmpresa = document.getElementById('salary_cnpjEmpresa').value || '';

    // Calcula os totais convertendo para número antes
    const totalProventos = parseFloat(salarioBase.replace(/\./g, '').replace(',', '.') || 0) +
                           parseFloat(horasExtras.replace(/\./g, '').replace(',', '.') || 0) +
                           parseFloat(comissoes.replace(/\./g, '').replace(',', '.') || 0) +
                           parseFloat(outrosAdicionais.replace(/\./g, '').replace(',', '.') || 0);
    const totalDescontos = parseFloat(inss.replace(/\./g, '').replace(',', '.') || 0) +
                           parseFloat(irrf.replace(/\./g, '').replace(',', '.') || 0) +
                           parseFloat(outrosDescontos.replace(/\./g, '').replace(',', '.') || 0);
    const salarioLiquido = totalProventos - totalDescontos;

    const dataFormatada = formatarData(dataPagamento);
    const salarioLiquidoExtenso = extenso(salarioLiquido);

    const reciboHTML = `
        <p class="center-text"><span class="bold">RECIBO DE PAGAMENTO DE SALÁRIO</span></p>
        <p class="center-text">Período de Referência: <span class="bold">${periodo}</span></p>
        <br>
        <table style="width:100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Descrição</th>
                    <th style="border: 1px solid #ccc; padding: 8px; text-align: right;">Proventos (R$)</th>
                    <th style="border: 1px solid #ccc; padding: 8px; text-align: right;">Descontos (R$)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid #ccc; padding: 8px;">Salário Base</td>
                    <td style="border: 1px solid #ccc; padding: 8px; text-align: right;">${formatarMoeda(salarioBase)}</td>
                    <td style="border: 1px solid #ccc; padding: 8px; text-align: right;"></td>
                </tr>
                ${parseFloat(horasExtras.replace(/\./g, '').replace(',', '.')) > 0 ? `<tr><td style="border: 1px solid #ccc; padding: 8px;">Horas Extras</td><td style="border: 1px solid #ccc; padding: 8px; text-align: right;">${formatarMoeda(horasExtras)}</td><td style="border: 1px solid #ccc; padding: 8px; text-align: right;"></td></tr>` : ''}
                ${parseFloat(comissoes.replace(/\./g, '').replace(',', '.')) > 0 ? `<tr><td style="border: 1px solid #ccc; padding: 8px;">Comissões</td><td style="border: 1px solid #ccc; padding: 8px; text-align: right;">${formatarMoeda(comissoes)}</td><td style="border: 1px solid #ccc; padding: 8px; text-align: right;"></td></tr>` : ''}
                ${parseFloat(outrosAdicionais.replace(/\./g, '').replace(',', '.')) > 0 ? `<tr><td style="border: 1px solid #ccc; padding: 8px;">Outros Adicionais</td><td style="border: 1px solid #ccc; padding: 8px; text-align: right;">${formatarMoeda(outrosAdicionais)}</td><td style="border: 1px solid #ccc; padding: 8px; text-align: right;"></td></tr>` : ''}
                ${parseFloat(inss.replace(/\./g, '').replace(',', '.')) > 0 ? `<tr><td style="border: 1px solid #ccc; padding: 8px;">INSS</td><td style="border: 1px solid #ccc; padding: 8px; text-align: right;"></td><td style="border: 1px solid #ccc; padding: 8px; text-align: right;">${formatarMoeda(inss)}</td></tr>` : ''}
                ${parseFloat(irrf.replace(/\./g, '').replace(',', '.')) > 0 ? `<tr><td style="border: 1px solid #ccc; padding: 8px;">IRRF</td><td style="border: 1px solid #ccc; padding: 8px; text-align: right;"></td><td style="border: 1px solid #ccc; padding: 8px; text-align: right;">${formatarMoeda(irrf)}</td></tr>` : ''}
                ${parseFloat(outrosDescontos.replace(/\./g, '').replace(',', '.')) > 0 ? `<tr><td style="border: 1px solid #ccc; padding: 8px;">Outros Descontos</td><td style="border: 1px solid #ccc; padding: 8px; text-align: right;"></td><td style="border: 1px solid #ccc; padding: 8px; text-align: right;">${formatarMoeda(outrosDescontos)}</td></tr>` : ''}
            </tbody>
            <tfoot>
                <tr>
                    <td style="border: 1px solid #ccc; padding: 8px; font-weight: bold;">TOTAL</td>
                    <td style="border: 1px solid #ccc; padding: 8px; text-align: right; font-weight: bold;">${formatarMoeda(totalProventos)}</td>
                    <td style="border: 1px solid #ccc; padding: 8px; text-align: right; font-weight: bold;">${formatarMoeda(totalDescontos)}</td>
                </tr>
                <tr>
                    <td colspan="2" style="border: 1px solid #ccc; padding: 8px; font-weight: bold;">SALÁRIO LÍQUIDO</td>
                    <td style="border: 1px solid #ccc; padding: 8px; text-align: right; font-weight: bold;">${formatarMoeda(salarioLiquido)}</td>
                </tr>
            </tfoot>
        </table>
        <br>
        <p>${cidade}, ${dataFormatada}.</p>
        <br>
        <br>
        <p class="center-text">_________________________________________</p>
        <p class="center-text">${nomeFuncionario}</p>
        <p class="center-text">${cpfFuncionario ? 'CPF: ' + cpfFuncionario : 'CPF: _____________'}</p>
    `;

    document.getElementById('documentContent').innerHTML = reciboHTML;
    document.getElementById('printButton').style.display = 'block';
}

// Gerar Recibo de Aluguel
function gerarReciboAluguel() {
    const periodo = document.getElementById('rent_periodo').value || '____________________';
    const valorAluguel = document.getElementById('rent_valorAluguel').value;
    const valorCondominio = document.getElementById('rent_valorCondominio').value;
    const valorIptu = document.getElementById('rent_valorIptu').value;
    const outrosAcrescimos = document.getElementById('rent_outrosAcrescimos').value;
    const nomeLocatario = document.getElementById('rent_nomeLocatario').value || '____________________';
    const documentoLocatario = document.getElementById('rent_documentoLocatario').value || '';
    const enderecoImovel = document.getElementById('rent_enderecoImovel').value || '____________________';
    const dataPagamento = document.getElementById('rent_dataPagamento').value;
    const nomeLocador = document.getElementById('rent_nomeLocador').value || '____________________';
    const documentoLocador = document.getElementById('rent_documentoLocador').value || '';

    // Calcula o total convertendo para número antes
    const valorTotal = parseFloat(valorAluguel.replace(/\./g, '').replace(',', '.') || 0) +
                       parseFloat(valorCondominio.replace(/\./g, '').replace(',', '.') || 0) +
                       parseFloat(valorIptu.replace(/\./g, '').replace(',', '.') || 0) +
                       parseFloat(outrosAcrescimos.replace(/\./g, '').replace(',', '.') || 0);

    const dataFormatada = formatarData(dataPagamento);
    const valorExtensoTotal = extenso(valorTotal);

    const reciboHTML = `
        <p class="center-text"><span class="bold">RECIBO DE ALUGUEL</span></p>
        <p>Recebi(emos) de <span class="bold">${nomeLocatario}</span>, ${documentoLocatario ? 'CPF/CNPJ: ' + documentoLocatario : ''}, a importância de <span class="bold">R$ ${formatarMoeda(valorTotal)}</span> (${valorExtensoTotal}), referente ao aluguel do imóvel situado em <span class="bold">${enderecoImovel}</span>, correspondente ao período de <span class="bold">${periodo}</span>.</p>
        <br>
        <p>Detalhes:</p>
        <ul style="list-style-type: none; padding-left: 20px;">
            <li>Aluguel: R$ ${formatarMoeda(valorAluguel)}</li>
            ${parseFloat(valorCondominio.replace(/\./g, '').replace(',', '.')) > 0 ? `<li>Condomínio: R$ ${formatarMoeda(valorCondominio)}</li>` : ''}
            ${parseFloat(valorIptu.replace(/\./g, '').replace(',', '.')) > 0 ? `<li>IPTU: R$ ${formatarMoeda(valorIptu)}</li>` : ''}
            ${parseFloat(outrosAcrescimos.replace(/\./g, '').replace(',', '.')) > 0 ? `<li>Outros Acréscimos: R$ ${formatarMoeda(outrosAcrescimos)}</li>` : ''}
        </ul>
        <br>
        <p>Rio de Janeiro, ${dataFormatada}.</p>
        <br>
        <br>
        <p class="center-text">_________________________________________</p>
        <p class="center-text">${nomeLocador}</p>
        <p class="center-text">${documentoLocador ? 'CPF/CNPJ: ' + documentoLocador : 'CPF/CNPJ: _____________'}</p>
    `;

    document.getElementById('documentContent').innerHTML = reciboHTML;
    document.getElementById('printButton').style.display = 'block';
}

// Gerar Nota Promissória
function gerarNotaPromissoria() {
    const valor = document.getElementById('note_valor').value;
    const dataEmissao = document.getElementById('note_dataEmissao').value;
    const dataVencimento = document.getElementById('note_dataVencimento').value;
    const nomeEmitente = document.getElementById('note_nomeEmitente').value || '____________________';
    const documentoEmitente = document.getElementById('note_documentoEmitente').value || '';
    const enderecoEmitente = document.getElementById('note_enderecoEmitente').value || '____________________';
    const nomeBeneficiario = document.getElementById('note_nomeBeneficiario').value || '____________________';
    const documentoBeneficiario = document.getElementById('note_documentoBeneficiario').value || '';

    const valorFormatado = formatarMoeda(valor);
    const dataEmissaoFormatada = formatarData(dataEmissao);
    const dataVencimentoFormatada = formatarData(dataVencimento);
    const valorExtensoNota = extenso(valor); // Passa a string formatada para extenso

    const notaHTML = `
        <p class="center-text"><span class="bold">NOTA PROMISSÓRIA</span></p>
        <p style="text-align: right;">Valor: R$ <span class="bold">${valorFormatado}</span></p>
        <br>
        <p>A(o) <span class="bold">${dataVencimentoFormatada}</span>, pagarei(emos) por esta ÚNICA via de NOTA PROMISSÓRIA a(o) <span class="bold">${nomeBeneficiario}</span>, ou à sua ordem, a quantia de <span class="bold">R$ ${valorFormatado}</span> (${valorExtensoNota}).</p>
        <br>
        <p>Valor recebido em: ${dataEmissaoFormatada}.</p>
        <br>
        <p>Emitente:</p>
        <p>Nome: <span class="bold">${nomeEmitente}</span></p>
        <p>CPF/CNPJ: <span class="bold">${documentoEmitente || '____________________'}</span></p>
        <p>Endereço: <span class="bold">${enderecoEmitente}</span></p>
        <br>
        <p>Beneficiário:</p>
        <p>Nome: <span class="bold">${nomeBeneficiario}</span></p>
        <p>CPF/CNPJ: <span class="bold">${documentoBeneficiario || '____________________'}</span></p>
        <br>
        <p class="center-text">_________________________________________</p>
        <p class="center-text">Assinatura do Emitente</p>
    `;

    document.getElementById('documentContent').innerHTML = notaHTML;
    document.getElementById('printButton').style.display = 'block';
}

// Gerar Vale
function gerarVale() {
    const valor = document.getElementById('voucher_valor').value;
    const beneficiario = document.getElementById('voucher_beneficiario').value || '____________________';
    const referencia = document.getElementById('voucher_referencia').value || '____________________';
    const data = document.getElementById('voucher_data').value;
    const cidade = document.getElementById('voucher_cidade').value || '____________________'; // Novo campo
    const emitente = document.getElementById('voucher_emitente').value || '____________________';

    const valorFormatado = formatarMoeda(valor);
    const dataFormatada = formatarData(data);
    const valorExtensoVale = extenso(valor); // Passa a string formatada para extenso

    const valeHTML = `
        <p class="center-text"><span class="bold">VALE</span></p>
        <br>
        <p>VALE a(o) <span class="bold">${beneficiario}</span>, a quantia de <span class="bold">R$ ${valorFormatado}</span> (${valorExtensoVale}).</p>
        <p>Referente a: <span class="bold">${referencia}</span>.</p>
        <br>
        <p>${cidade}, ${dataFormatada}.</p>
        <br>
        <br>
        <p class="center-text">_________________________________________</p>
        <p class="center-text">${emitente}</p>
    `;

    document.getElementById('documentContent').innerHTML = valeHTML;
    document.getElementById('printButton').style.display = 'block';
}

// Chamar showDocumentForm no carregamento da página para garantir que o formulário esteja escondido
document.addEventListener('DOMContentLoaded', () => {
    showDocumentForm();

    // Adiciona event listeners para autoformatação de valores monetários
    document.querySelectorAll('input[id$="_valor"], input[id$="_salarioBase"], input[id$="_horasExtras"], input[id$="_comissoes"], input[id$="_outrosAdicionais"], input[id$="_inss"], input[id$="_irrf"], input[id$="_outrosDescontos"], input[id$="_valorAluguel"], input[id$="_valorCondominio"], input[id$="_valorIptu"], input[id$="_outrosAcrescimos"]').forEach(input => {
        input.addEventListener('input', autoFormatarMoeda);
    });

    // Adiciona event listeners para autoformatação de CPF/CNPJ
    document.querySelectorAll('input[id$="_documentoEmitente"], input[id$="_cpfFuncionario"], input[id$="_cnpjEmpresa"], input[id$="_documentoLocatario"], input[id$="_documentoLocador"], input[id$="_documentoBeneficiario"]').forEach(input => {
        input.addEventListener('input', autoFormatarCpfCnpj);
    });

    // Configura o botão de impressão para chamar a função correta
    document.getElementById('printButton').setAttribute('onclick', 'imprimirDuasVias()');

    // Adiciona event listener para rolagem suave em todos os links da navegação principal
    document.querySelectorAll('nav.main-nav ul li a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault(); // Previne o comportamento padrão do link âncora

            const targetId = this.getAttribute('href').substring(1); // Obtém o ID sem o '#'
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                // Tenta obter a altura do cabeçalho para calcular um offset, se ele for fixo.
                const header = document.querySelector('.main-header');
                const offset = header ? header.offsetHeight : 0;

                const elementPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth" // Rola suavemente
                });
            }
        });
    });
});