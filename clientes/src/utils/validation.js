const dataAtual = new Date();

function validaDadosPessoais(body) {
  const regexNome = /^[a-zA-Z\s]{5,}$/;
  const regexEmail = /^[\w.-]+@[a-zA-Z_-]+?\.[a-zA-Z]{2,3}$/;
  const regexCpfECel = /^[0-9]{11}$/;

  if (!regexNome.test(body.dadosPessoais.nome)) {
    throw new Error('Invalid argument: nome');
  }
  if (!regexEmail.test(body.dadosPessoais.email)) {
    throw new Error('Invalid argument: email');
  }
  if (!regexCpfECel.test(body.dadosPessoais.cpf)) {
    throw new Error('Invalid argument: cpf');
  }
  if (!regexCpfECel.test(body.dadosPessoais.telefone)) {
    throw new Error('Invalid argument: telefone');
  }
}
function validaEndereco(body) {
  const regexNum = /^(\d+|S\/N)$/;
  const regexCep = /^[0-9]{8}$/;
  const uf = [
    'AC',
    'AL',
    'AM',
    'AP',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MG',
    'MS',
    'MT',
    'PA',
    'PB',
    'PE',
    'PI',
    'PR',
    'RJ',
    'RN',
    'RO',
    'RR',
    'RS',
    'SC',
    'SE',
    'SP',
    'TO',
  ];
  if (body.endereco.rua.length < 1) {
    throw new Error('Invalid argument: rua');
  }
  if (!regexNum.test(body.endereco.numero)) {
    throw new Error('Invalid argument: numero');
  }
  if (!regexNum.test(body.endereco.complemento)) {
    throw new Error('Invalid argument: complemento');
  }
  if (!regexCep.test(body.endereco.cep)) {
    throw new Error('Invalid argument: cep');
  }
  if (body.endereco.cidade.length < 5) {
    throw new Error('Invalid argument: cidade');
  }
  if (!uf.includes(body.endereco.uf)) {
    throw new Error('Invalid argument: uf');
  }
}

function validaCartao(body) {
  const regexNome = /^[a-zA-Z\s]{5,}$/;
  const regexValidade = /^\d{2}\/\d{4}$/;
  const regexDia = /^\d{2}$/;
  const validade = body.cartao.validadeCartao;
  if (regexValidade.test(validade)) {
    const mes = validade.split('/')[0];
    const ano = validade.split('/')[1];
    const data = new Date(ano, mes, 0);

    if (data < dataAtual) {
      throw new Error('Invalid argument: cartão expirado');
    }
  } else {
    throw new Error('Invalid argument: validade do cartão');
  }

  if (body.cartao.numeroCartao.length !== 16) {
    throw new Error('Invalid argument: numero do cartão');
  }
  if (!regexNome.test(body.dadosPessoais.nome)) {
    throw new Error('Invalid argument: nome');
  }
  if (body.cartao.cvcCartao.length !== 3) {
    throw new Error('Invalid argument: cvc do cartão');
  }
  if (!regexDia.test(body.cartao.vencimentoFatura)) {
    throw new Error('Invalid argument: vencimento da fatura');
  }
}

function validaClient(body) {
  validaDadosPessoais(body);
  validaEndereco(body);
  validaCartao(body);
}

export default validaClient;
