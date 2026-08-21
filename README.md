# CheckFrota

Aplicativo responsivo para a vistoria de caminhões, carros e utilitários. Ele foi desenhado para uso no celular pelo motorista e para acompanhamento pela base.

## O que esta versão já faz

- Cadastro da frota, responsável, WhatsApp e e-mail por veículo.
- Checklist de saída com 12 itens de segurança e operação.
- Registro de ocorrências com texto, foto opcional e gravidade **leve**, **média** ou **grave — veículo sem condição de deslocamento**.
- Geração de um registro completo da inspeção e painel da base com ocorrências abertas, histórico, frota e relatório de solicitações.
- Retorno da manutenção por ocorrência: situação, data/hora de agendamento, oficina/responsável e observação. O retorno pode ser enviado pelo WhatsApp para a base.
- Relatório das solicitações com totais e download em CSV, pronto para abrir no Excel.
- Botão que abre o WhatsApp da base no número `+55 12 98840-0316`, com a ocorrência já redigida.
- Botão que abre o WhatsApp do responsável pelo caminhão/carro, quando o número estiver cadastrado.
- Envio do formulário para um fluxo externo (Power Automate, Make ou Google Apps Script) que pode encaminhá-lo automaticamente por e-mail.
- Instalação como atalho/app no Android ou iPhone quando for publicado em HTTPS.

## Primeiro uso

1. Abra o aplicativo em um navegador.
2. Em **Controle da frota → Configurações**, confirme o telefone da base.
3. Em **Controle da frota → Veículos**, edite os três veículos de exemplo ou cadastre toda a frota real. Para cada um informe placa, tipo, dono/responsável, WhatsApp e e-mail.
4. O motorista informa o nome, escolhe o veículo e preenche o checklist.
5. Havendo alguma falha, ele toca em `!`, descreve o problema e escolhe a gravidade. Ao concluir, aparecem os botões de aviso pelo WhatsApp. Na base, use **Agendar / retorno** e a aba **Relatório** para acompanhar e baixar as solicitações.

> Os dados locais servem para demonstração e para uso no mesmo aparelho. Para todos os motoristas e a base enxergarem a mesma frota e o mesmo histórico, a publicação final precisa de uma base central (por exemplo, SharePoint, Supabase ou Firebase). A tela e o fluxo já estão prontos para isso; o endpoint de automação é configurável.

## E-mail e Microsoft Forms

O Microsoft Forms é excelente para coleta manual, mas não oferece uma integração universal para receber formulários completos diretamente por um aplicativo. O caminho mais confiável é o **Power Automate**: o CheckFrota envia o formulário em JSON para o fluxo, e o fluxo gera o e-mail padronizado (ou grava numa lista/planilha) para o e-mail cadastrado no veículo.

No Power Automate, crie um fluxo com:

1. Gatilho **Quando uma solicitação HTTP é recebida**.
2. Ação **Analisar JSON** usando o corpo recebido.
3. Ação **Enviar um e-mail (V2)** para `vehicle.email`, incluindo os dados de `inspection` e a lista `issues`.
4. Opcionalmente, grave o mesmo registro numa lista do SharePoint ou planilha Excel e envie notificações de ocorrências graves para o time de manutenção.
5. Copie a URL do gatilho e cole em **⚙ Configurações → URL de envio do formulário** no aplicativo.

O corpo enviado inclui `inspection`, `vehicle` e `issues`; cada ocorrência traz veículo, motorista, gravidade, descrição, horário e nome da foto. O aplicativo também envia uma atualização com `type: "maintenance-update"` quando a base salva um agendamento ou retorno. Se a empresa preferir Make ou Google Apps Script, a mesma URL de webhook funciona.

## Instalar no celular

Depois de publicar em uma URL **HTTPS**, o motorista deve abrir o link uma única vez no celular:

- **Android (Chrome):** toque em **Instalar** no topo do CheckFrota. Se o botão nativo não aparecer, abra o menu `⋮` do Chrome e escolha **Instalar aplicativo** ou **Adicionar à tela inicial**.
- **iPhone/iPad (Safari):** toque em **Compartilhar** → **Adicionar à Tela de Início** → **Adicionar**.

O CheckFrota aparecerá com seu ícone na tela inicial e abrirá em tela própria, como um aplicativo. A tela principal e os arquivos do checklist permanecem disponíveis mesmo se a conexão cair depois do primeiro acesso.

## Publicação para os celulares

O conteúdo é um PWA estático, sem instalação de dependências. Pode ser publicado em GitHub Pages, Netlify, Vercel, servidor da empresa ou hospedagem comum que use HTTPS. Depois de abrir a URL no celular, escolha **Adicionar à tela inicial** no menu do navegador.

Para pré-visualizar em um computador, na pasta do projeto execute:

```powershell
python -m http.server 4173
```

e abra `http://localhost:4173`.

## Arquivos

- `index.html` — telas do motorista, checklist e painel da base.
- `app.js` — regras, dados, ocorrência, WhatsApp e integração por webhook.
- `styles.css` — design adaptado a tela de celular.
- `manifest.webmanifest` e `service-worker.js` — comportamento de aplicativo instalável/offline.
