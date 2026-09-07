# Auditoria de fluxo — URBAM Frotas v183–v184

Data da revisão: 07/09/2026.

## Atualização v184

- O painel da Liderança agora separa **Aprovações** de **Acompanhamento**.
- A aba de acompanhamento mostra somente veículos já agendados ou em atendimento, com os estados **Agendada**, **Em manutenção**, **Atrasada** e **Veículo pronto para retirada**.
- A Liderança pode filtrar por situação, base e veículo, conferir oficina, endereço, horário, prazo contratual de seis horas e abrir a rota no mapa.
- A retirada pode ser confirmada diretamente no cartão do veículo pronto.

## Fluxo adotado

1. O colaborador preenche o checklist e abre o chamado.
2. A liderança aprova ou pede retificação. Veículos encaminhados diretamente à Gestão não aguardam essa etapa.
3. A Gestão agenda data, horário, oficina e endereço; o colaborador e a liderança recebem as informações.
4. O colaborador confirma a entrega na oficina. A partir desse momento começa o prazo contratual de seis horas.
5. A Gestão registra o retorno que receber do fornecedor por WhatsApp. O fornecedor não acessa o aplicativo.
6. Quando o veículo está pronto, a liderança acompanha a liberação e organiza a retirada.
7. A Gestão conclui o chamado depois que a retirada estiver confirmada.

## Correções publicadas nesta versão

- A Gestão passa a respeitar o status oficial recebido do banco, evitando que uma atualização reabra ou altere indevidamente um chamado já decidido.
- O agendamento fica bloqueado até a aprovação da liderança, salvo os chamados encaminhados diretamente para Gestão.
- O botão **Avisar equipe interna** salva e registra a atualização antes de abrir a mensagem para o grupo.
- Reagendar limpa os horários da entrega, do prazo, da liberação e da retirada anteriores.
- Chamados concluídos não permanecem no acompanhamento de prazo de seis horas.
- O e-mail de atraso agora diferencia veículo ainda parado de veículo liberado após o prazo.
- O painel da liderança mostra **Agendado**, **Em manutenção** e **Pronto para retirada**, mesmo que o chamado já tenha sido aprovado.
- Links de instalação, QR Codes e cache foram atualizados para a mesma versão.
- A inicialização duplicada do serviço de avisos foi removida e a mensagem de ativação foi traduzida para português.

## Pendências obrigatórias antes da implantação final

1. Aplicar no Supabase somente as migrações consolidadas e compatíveis com o banco atual. Não execute todos os arquivos antigos em sequência, pois existem versões antigas de funções e permissões.
2. Criar automação de servidor para o prazo de seis horas. O aplicativo aberto acompanha o prazo, mas o envio automático de e-mail e push exige Supabase Cron/Edge Function ou Apps Script configurado no servidor.
3. Cadastrar e validar e-mail, telefone, contrato e responsável para cada empresa/veículo terceirizado. Sem e-mail, o sistema copia a notificação formal, mas não consegue abrir o destinatário automaticamente.
4. Definir a regra final de retirada: a recomendação é o colaborador vinculado confirmar a retirada física e a Gestão encerrar o chamado. Hoje a confirmação de retirada ainda é feita no painel da liderança.
5. Agrupar ocorrências do mesmo checklist em uma ordem de manutenção única, para evitar vários prazos e vários e-mails para o mesmo veículo.
6. Centralizar configurações da Gestão (telefones, grupo de manutenção e integração) no banco de dados, para que funcionem iguais em todos os computadores.

## Testes realizados no código

- Sintaxe de `app.js` e `service-worker.js` validada.
- Verificação de links, versões, manifestos e cache PWA.
- Conferência estática dos fluxos de aprovação, agendamento, entrega, prazo, liberação e conclusão.

## Como testar a versão publicada

Use sempre o endereço HTTPS publicado, e não `file:///.../index.html`. O modo de arquivo local não representa o funcionamento real de login, banco de dados, instalação, cache ou notificações.

Endereço oficial: `https://4lves-dev.github.io/checkfrota/?v=183`
