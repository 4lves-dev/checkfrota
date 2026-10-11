/** Manual visual diagnostic. Sends only to the existing URBAM recipient.
 * Does not create database calls, employees, vehicles or maintenance issues.
 */
function testarPdfCompleto() {
  const names = ['Pneus e estepe', 'Faróis, lanternas e setas', 'Freios e freio de estacionamento', 'Óleo, água e demais fluidos', 'Vazamentos visíveis', 'Buzina', 'Limpador e para-brisa', 'Retrovisores', 'Cintos de segurança', 'Documentação do veículo', 'Painel e luzes de advertência', 'Carroceria e portas', 'Limpeza e lavagem', 'Equipamentos de segurança', 'Condições gerais'];
  const issues = [
    { itemName: names[0], severity: 'Alta', description: 'TESTE: pneu com perda de pressão. Veículo fictício imobilizado para inspeção. Não executar serviço real.' },
    { itemName: names[3], severity: 'Média', description: 'TESTE: troca de óleo solicitada conforme plano preventivo. Confirmar especificação do fabricante e registrar quilometragem no atendimento.' },
    { itemName: names[9], severity: 'Alta', description: 'TESTE: documento vencido. Conferir regularização antes de liberar o veículo fictício para circulação.' },
    { itemName: names[12], severity: 'Baixa', description: 'TESTE: lavagem programada, incluindo cabine e carroceria. ' + 'Descrição longa para conferir quebra de linhas e continuidade entre páginas, sem perda de conteúdo. '.repeat(8) }
  ];
  const inspection = {
    id: 'pdf-completo-diagnostico-' + Date.now(), createdAt: new Date().toISOString(),
    driver: 'TESTE TÉCNICO - NÃO É CHAMADO', driverRegistration: 'TESTE', baseName: 'Homologação', odometer: 0,
    items: names.map(name => {
      const issue = issues.find(entry => entry.itemName === name);
      return { name, status: issue ? 'issue' : 'ok', issue };
    }),
    notes: 'Teste visual autorizado. Nenhum veículo ou colaborador real. ' + 'Verificar se a observação permanece legível e não sobrepõe o rodapé na última página. '.repeat(6)
  };
  const result = sendChecklist_({ postData: { contents: JSON.stringify({ inspection, vehicle: { prefix: 'TEST-PDF', plate: 'TESTE', model: 'Veículo fictício' }, issues }) } });
  const response = JSON.parse(result.getContent());
  if (!response.ok) throw new Error(response.error || 'Falha no PDF completo.');
  console.log('PDF COMPLETO enviado para validação visual: ' + inspection.id);
}

