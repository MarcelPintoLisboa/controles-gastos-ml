# Controles de gastos ML

App mobile (React Native + Expo) para iPhone e Android que controla o planejamento anual de gastos.
Versão 1 já vem carregada com os 163 lançamentos da aba **Plan2027** da planilha PlanoCustos.xlsx.

## Telas
- **Resumo**: total planejado, pago e falta pagar (rosca de progresso), gráfico de barras por mês (pago x a pagar), maiores gastos do ano e tabela mês a mês. Toque em um mês do gráfico para abrir o que falta nele.
- **A pagar**: escolha o mês e veja quanto falta, quais contas estão pendentes e as já pagas. Toque no círculo para marcar pago/a pagar.
- **Lançamentos**: lista completa com filtros (busca por nome, status, mês), adicionar, editar e excluir pagamentos. Opção "repetir todo mês até dezembro" ao criar.
- **Ajustes**: criar planejamento de um novo ano copiando o anterior, exportar CSV (compartilhar) e restaurar os dados da planilha.

Os dados ficam salvos no aparelho (AsyncStorage). Não há servidor nem login nesta versão.

## Como rodar
```bash
npm install
npx expo install --fix   # alinha as versões ao Expo SDK instalado
npx expo start
```
Abra o app **Expo Go** no iPhone/Android e leia o QR code (celular e computador na mesma rede).
Também: `npm run ios` (precisa de Mac + Xcode) ou `npm run android` (Android Studio).

## Estrutura
```
App.js                      navegação por abas
src/store.js                estado + persistência (AsyncStorage)
src/utils.js                formatação R$, meses, agregações
src/data/seed.json          dados da aba Plan2027
src/screens/                Resumo, Faltam, Lançamentos, Ajustes
src/components/             gráficos (SVG), formulário, linha de item, UI
```

## Atualizar os dados iniciais a partir da planilha
`src/data/seed.json` foi gerado da aba Plan2027 (colunas Mensal, Valor, Mês, Status). Para novas versões da planilha, gere o JSON de novo no mesmo formato:
`{ id, nome, valor, mes (1-12), ano, status: "A pagar" | "Pago", dataPagamento: null }`.

## Publicar nas lojas (depois)
Usar EAS Build (`npx eas build`). iPhone exige conta Apple Developer; Android, conta Google Play. Ícone em `assets/` (trocar por imagem em alta resolução, 1024x1024, antes de publicar).
