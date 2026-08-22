var SPREADSHEET_ID = '';

function doGet(e) {
  var action = e.parameter.action;
  try {
    switch (action) {
      case 'buscarMaterial':
        return jsonResponse(buscarMaterial(e.parameter.codigo));
      case 'listarMateriais':
        return jsonResponse(listarMateriais());
      case 'listarPedidos':
        return jsonResponse(listarPedidos());
      case 'itensPedido':
        return jsonResponse(obterItensPedido(e.parameter.numeroPedido));
      case 'listarCadastros':
        return jsonResponse(listarCadastros(e.parameter.tipo));
      default:
        return jsonResponse({ success: false, mensagem: 'Acao nao reconhecida' });
    }
  } catch (err) {
    return jsonResponse({ success: false, mensagem: err.toString() });
  }
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var action = data.action;
  try {
    switch (action) {
      case 'salvarMaterial':
        return jsonResponse(salvarCadastroMaterial(data));
      case 'salvarPedido':
        return jsonResponse(salvarPedidoCompleto(data));
      case 'salvarCadastro':
        return jsonResponse(salvarCadastroGenerico(data));
      case 'atualizarCadastro':
        return jsonResponse(atualizarCadastro(data));
      case 'excluirCadastro':
        return jsonResponse(excluirCadastro(data));
      case 'excluirItemPedido':
        return jsonResponse(excluirItemPedido(data));
      case 'excluirPedido':
        return jsonResponse(excluirPedidoCompleto(data));
      default:
        return jsonResponse({ success: false, mensagem: 'Acao nao reconhecida' });
    }
  } catch (err) {
    return jsonResponse({ success: false, mensagem: err.toString() });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    criarAbasSeNecessario();
    sheet = ss.getSheetByName(name);
  }
  return sheet;
}

function criarAbasSeNecessario() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var abas = ss.getSheets().map(function(s) { return s.getName(); });
  if (abas.indexOf('Materiais') === -1) {
    var nova = ss.insertSheet('Materiais');
    nova.appendRow(['Codigo de Barras', 'Descricao', 'Referencia', 'Anvisa']);
  }
  if (abas.indexOf('Pedidos') === -1) {
    var nova2 = ss.insertSheet('Pedidos');
    nova2.appendRow(['N Pedido', 'Hospital', 'Medico', 'Convenio', 'Paciente', 'Data Cirurgia', 'Status', 'Data Emissao', 'Responsavel']);
  }
  if (abas.indexOf('Itens_Pedido') === -1) {
    var nova3 = ss.insertSheet('Itens_Pedido');
    nova3.appendRow(['N Pedido', 'Codigo de Barras', 'Descricao', 'Qtd', 'Lote', 'Validade', 'Anvisa']);
  }
}

function salvarCadastroMaterial(dados) {
  var sheet = getSheet('Materiais');
  var ultimaLinha = sheet.getLastRow();
  for (var i = 2; i <= ultimaLinha; i++) {
    if (sheet.getRange(i, 1).getValue().toString() === dados.codigo.toString()) {
      return { success: false, mensagem: 'Ja existe material com este codigo!' };
    }
  }
  sheet.appendRow([dados.codigo, dados.descricao, dados.referencia, dados.anvisa]);
  return { success: true, mensagem: 'Material cadastrado com sucesso!' };
}

function buscarMaterial(codigo) {
  var sheet = getSheet('Materiais');
  var ultimaLinha = sheet.getLastRow();
  for (var i = 2; i <= ultimaLinha; i++) {
    if (sheet.getRange(i, 1).getValue().toString() === codigo.toString()) {
      return {
        success: true,
        material: {
          codigo: sheet.getRange(i, 1).getValue().toString(),
          descricao: sheet.getRange(i, 2).getValue(),
          referencia: sheet.getRange(i, 3).getValue(),
          anvisa: sheet.getRange(i, 4).getValue()
        }
      };
    }
  }
  return { success: false, mensagem: 'Material nao encontrado!' };
}

function listarMateriais() {
  var sheet = getSheet('Materiais');
  var dados = [];
  var ultimaLinha = sheet.getLastRow();
  for (var i = 2; i <= ultimaLinha; i++) {
    dados.push({
      codigo: sheet.getRange(i, 1).getValue().toString(),
      descricao: sheet.getRange(i, 2).getValue(),
      referencia: sheet.getRange(i, 3).getValue(),
      anvisa: sheet.getRange(i, 4).getValue()
    });
  }
  return { success: true, materiais: dados };
}

function salvarPedidoCompleto(dados) {
  var sheetPedidos = getSheet('Pedidos');
  var sheetItens = getSheet('Itens_Pedido');
  var numeroPedido = dados.numeroPedido;
  var dataEmissao = new Date().toLocaleDateString('pt-BR');
  sheetPedidos.appendRow([
    numeroPedido, dados.hospital, dados.medico, dados.convenio,
    dados.paciente, dados.dataCirurgia, 'Pendente', dataEmissao, dados.responsavel
  ]);
  var itens = dados.itens;
  for (var i = 0; i < itens.length; i++) {
    sheetItens.appendRow([
      numeroPedido, itens[i].codigo, itens[i].descricao,
      itens[i].qtd, itens[i].lote, itens[i].validade, itens[i].anvisa
    ]);
  }
  return { success: true, mensagem: 'Pedido ' + numeroPedido + ' salvo com sucesso!', totalItens: itens.length };
}

function listarPedidos() {
  var sheet = getSheet('Pedidos');
  var dados = [];
  var ultimaLinha = sheet.getLastRow();
  for (var i = 2; i <= ultimaLinha; i++) {
    dados.push({
      numeroPedido: sheet.getRange(i, 1).getValue().toString(),
      hospital: sheet.getRange(i, 2).getValue(),
      medico: sheet.getRange(i, 3).getValue(),
      convenio: sheet.getRange(i, 4).getValue(),
      paciente: sheet.getRange(i, 5).getValue(),
      dataCirurgia: sheet.getRange(i, 6).getValue(),
      status: sheet.getRange(i, 7).getValue(),
      dataEmissao: sheet.getRange(i, 8).getValue(),
      responsavel: sheet.getRange(i, 9).getValue()
    });
  }
  return { success: true, pedidos: dados };
}

function obterItensPedido(numeroPedido) {
  var sheet = getSheet('Itens_Pedido');
  var dados = [];
  var ultimaLinha = sheet.getLastRow();
  for (var i = 2; i <= ultimaLinha; i++) {
    if (sheet.getRange(i, 1).getValue().toString() === numeroPedido.toString()) {
      dados.push({
        numeroPedido: sheet.getRange(i, 1).getValue().toString(),
        codigo: sheet.getRange(i, 2).getValue().toString(),
        descricao: sheet.getRange(i, 3).getValue(),
        qtd: sheet.getRange(i, 4).getValue(),
        lote: sheet.getRange(i, 5).getValue(),
        validade: sheet.getRange(i, 6).getValue(),
        anvisa: sheet.getRange(i, 7).getValue()
      });
    }
  }
  return { success: true, itens: dados };
}

function excluirItemPedido(dados) {
  var sheet = getSheet('Itens_Pedido');
  var ultimaLinha = sheet.getLastRow();
  for (var i = ultimaLinha; i >= 2; i--) {
    if (sheet.getRange(i, 1).getValue().toString() === dados.numeroPedido.toString() &&
        sheet.getRange(i, 2).getValue().toString() === dados.codigo.toString()) {
      sheet.deleteRow(i);
      return { success: true, mensagem: 'Item removido!' };
    }
  }
  return { success: false, mensagem: 'Item nao encontrado!' };
}

function excluirPedidoCompleto(dados) {
  var sheetItens = getSheet('Itens_Pedido');
  var sheetPedidos = getSheet('Pedidos');
  var ultimaLinhaItens = sheetItens.getLastRow();
  for (var i = ultimaLinhaItens; i >= 2; i--) {
    if (sheetItens.getRange(i, 1).getValue().toString() === dados.numeroPedido.toString()) {
      sheetItens.deleteRow(i);
    }
  }
  var ultimaLinhaPedidos = sheetPedidos.getLastRow();
  for (var j = ultimaLinhaPedidos; j >= 2; j--) {
    if (sheetPedidos.getRange(j, 1).getValue().toString() === dados.numeroPedido.toString()) {
      sheetPedidos.deleteRow(j);
    }
  }
  return { success: true, mensagem: 'Pedido excluido!' };
}

function salvarCadastroGenerico(dados) {
  var nomeAba = dados.tipo + 's';
  var sheet;
  try {
    sheet = getSheet(nomeAba);
  } catch (e) {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    sheet = ss.insertSheet(nomeAba);
    sheet.appendRow(['Nome', 'Data Cadastro']);
  }
  var ultimaLinha = sheet.getLastRow();
  for (var i = 2; i <= ultimaLinha; i++) {
    if (sheet.getRange(i, 1).getValue().toString().toLowerCase() === dados.nome.toLowerCase()) {
      return { success: false, mensagem: 'Este registro ja existe!' };
    }
  }
  sheet.appendRow([dados.nome, new Date().toLocaleDateString('pt-BR')]);
  return { success: true, mensagem: dados.tipo + ' cadastrado com sucesso!' };
}

function listarCadastros(tipo) {
  var nomeAba = tipo + 's';
  var sheet;
  try {
    sheet = getSheet(nomeAba);
  } catch (e) {
    return { success: true, dados: [] };
  }
  var dados = [];
  var ultimaLinha = sheet.getLastRow();
  for (var i = 2; i <= ultimaLinha; i++) {
    dados.push(sheet.getRange(i, 1).getValue().toString());
  }
  return { success: true, dados: dados };
}

function atualizarCadastro(dados) {
  var nomeAba = dados.tipo + 's';
  var sheet = getSheet(nomeAba);
  var ultimaLinha = sheet.getLastRow();
  for (var i = 2; i <= ultimaLinha; i++) {
    if (sheet.getRange(i, 1).getValue().toString() === dados.nomeAntigo) {
      sheet.getRange(i, 1).setValue(dados.nomeNovo);
      return { success: true, mensagem: 'Atualizado com sucesso!' };
    }
  }
  return { success: false, mensagem: 'Registro nao encontrado!' };
}

function excluirCadastro(dados) {
  var nomeAba = dados.tipo + 's';
  var sheet = getSheet(nomeAba);
  var ultimaLinha = sheet.getLastRow();
  for (var i = ultimaLinha; i >= 2; i--) {
    if (sheet.getRange(i, 1).getValue().toString() === dados.nome) {
      sheet.deleteRow(i);
      return { success: true, mensagem: 'Excluido com sucesso!' };
    }
  }
  return { success: false, mensagem: 'Registro nao encontrado!' };
}