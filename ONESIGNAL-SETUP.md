# OneSignal — URBAM Frotas

O aplicativo usa o App ID `3d57134c-adf3-4f8f-8ec2-093b1d02f3bf` com o SDK Web v16.

## Configuração no painel OneSignal

Em **Settings → Push & In-App → Web Settings**, confirme o endereço do site:

`https://4lves-dev.github.io`

O OneSignal aceita somente o domínio nesse campo. Isso **não** altera o endereço do aplicativo: colaboradores e liderança devem continuar acessando `https://4lves-dev.github.io/checkfrota/`. Abrir somente `https://4lves-dev.github.io` apresenta 404 porque o projeto é publicado pelo GitHub Pages dentro da pasta `/checkfrota/`.

Em **Advanced Push Settings**, use o worker personalizado abaixo para ele não conflitar com o worker do PWA:

- Caminho: `/checkfrota/push/onesignal/`
- Arquivo: `OneSignalSDKWorker.js`
- Escopo: `/checkfrota/push/onesignal/`

O arquivo publicado pode ser conferido em:

`https://4lves-dev.github.io/checkfrota/push/onesignal/OneSignalSDKWorker.js`

## Teste

1. Abra o aplicativo publicado em HTTPS.
2. Toque em **Avisos** (colaborador/gestão) ou **Ativar avisos** (liderança).
3. Na janela de confirmação, toque em **Got it** e aceite a permissão do navegador.
4. Envie uma notificação de teste pelo painel OneSignal.

No iPhone/iPad, o site deve primeiro ser instalado na tela inicial; o Web Push é compatível com iOS/iPadOS 16.4 ou posterior.

## Privacidade

O aplicativo marca a assinatura apenas com `perfil`, `base`, `area` e `aplicativo`. Nomes, telefones e senhas não são enviados ao OneSignal.

## Envio automático

O SDK cadastra os dispositivos e permite testes/segmentos pelo painel. Para disparar push automático a cada novo chamado, retificação, recusa ou veículo pronto, a chamada à API REST do OneSignal deve ser feita por uma Edge Function/servidor seguro, usando uma chave REST guardada em segredo — nunca no JavaScript público.

