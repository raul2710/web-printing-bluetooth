# 🖨️ MiniPrint Studio — Mini Impressora Térmica Bluetooth 58mm

Aplicação web moderna, local e responsiva para conectar e imprimir em mini impressoras térmicas Bluetooth de 58mm (largura de cabeça de **384 pontos / pixels**, 203 DPI, 48 bytes por linha).

Fusão entre a vivacidade acolhedora do **MiniPrint** e o design editorial limpo do **Elysano** (`https://www.elysano.com/#app`).

Compatível com modelos como **SC03H, BQ95, MX06, GB01, Cat Printer, Peripage e clones BLE similares**.

---

## ⚡ Como Rodar o Projeto

1. Instale as dependências (se ainda não tiver feito):
   ```bash
   npm install
   ```

2. Inicie o servidor local Vite:
   ```bash
   npm run dev
   ```

3. Acesse `http://localhost:5173/web-printing-bluetooth/` (o Vite usa o mesmo `base` da produção):
   - **No Celular (Android):** Abra pelo **Google Chrome** com o Bluetooth e a Localização (GPS) ativados.
   - **No Desktop:** Acesse pelo **Google Chrome** ou **Microsoft Edge** (com suporte à Web Bluetooth API).

---

## 🌐 Deploy no GitHub Pages

O site fica publicado em **https://raul2710.github.io/web-printing-bluetooth/**.

O deploy é automático via **GitHub Actions**: a cada push na branch `main`, o workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) roda `npm ci` e `npm run build`, e publica a pasta `dist/` no Pages. Também pode ser disparado manualmente em **Actions → Deploy para GitHub Pages → Run workflow**.

**Requisitos (apenas uma vez):**

1. Em **Settings → Pages**, defina a origem (Source) como **GitHub Actions**. O workflow tenta habilitar isso sozinho na primeira execução.
2. O `package-lock.json` precisa estar versionado, pois o workflow usa `npm ci`.

**Detalhes importantes:**

- `vite.config.ts` define `base: '/web-printing-bluetooth/'` — sem esse prefixo os arquivos de `assets/` dariam 404 no Pages. Se o repositório for renomeado ou passar a usar domínio próprio, ajuste essa constante.
- O Pages serve tudo por **HTTPS**, o que é obrigatório para a **Web Bluetooth API** funcionar (em `http://` fora de `localhost` o navegador bloqueia o Bluetooth).
- Para testar o build de produção localmente:
  ```bash
  npm run build
  npm run preview
  ```
  e acesse `http://localhost:4173/web-printing-bluetooth/`.

---

## 🔮 Funcionalidade Exclusiva: Bilhete Secreto da Sorte
- **Mensagem Oculta:** As palavras de sorte, previsões e conselhos são sorteadas em **segredo absoluto**.
- **Escolha do Usuário:**
  - **🖨️ Imprimir no Escuro (Surpresa Real!):** A mensagem é impressa diretamente na impressora térmica sem ser revelada na tela do celular/computador. Quem puxa o papel da impressora tem a surpresa autêntica de romper o lacre com as próprias mãos!
  - **👁️ Espiar na Tela:** Se preferir ler antes de imprimir, basta clicar em "Espiar na Tela" para revelar o texto e os números da sorte.
  - Alternância rápida entre *Segredo Ativo* e *Revelar Sempre*.

---

## 🛠️ Ferramentas Disponíveis

1. **Fotos & Dithering Monocromático:**
   - Upload de foto ou captura instantânea via câmera ao vivo.
   - Algoritmos: **Atkinson** (Mac clássico, pontos nítidos em térmica), **Floyd-Steinberg** (suave) e **Threshold Puro** (para arte em linhas).
   - Sliders de Brilho, Contraste e Nitidez (Unsharp Mask), além de **Auto Ajuste**.
   - Modo **Moldura Polaroid** com rotação e legenda customizada.
2. **Bilhete Secreto & Sorte (Oráculo / Biscoito da Sorte):**
   - Modo Segredo (*Imprimir no Escuro* ou *Espiar na Tela*).
   - Categorias: Biscoito da Sorte, Pensamento do Dia, Horóscopo Sincero ou Mensagem Personalizada.
   - Bilhete vintage com moldura ornamental, números da sorte e código de barras decorativo.
3. **Sudoku 9x9:**
   - Gerador de tabuleiros válidos nos níveis **Fácil**, **Médio** e **Difícil**.
   - Grade com divisões grossas 3x3 e números em fonte monoespaçada de alta legibilidade.
   - Alternância de exibição de gabarito/solução.
4. **Notas Rápidas & QR Code:**
   - Editor de texto livre com quebra automática de linha inteligente.
   - Ajuste de tamanho de fonte (P, M, G, GG), tipografia e alinhamento.
   - Gerador de QR Code integrado (para links, Pix ou Wi-Fi).
5. **Passatempos & Cores:**
   - **Caça-Palavras:** 8 temas divertidos, grade 10x10 ou 12x12 e lista de palavras para riscar `[ ]`.
   - **Mandala para Colorir:** Geração algorítmica de mandalas geométricas exclusivas para colorir na bobina com lápis de cor ou canetinha.
6. **Controle de Densidade Térmica:**
   - Seletor de intensidade (Suave, Normal, Escuro, Intenso) no cabeçalho.
7. **Simulador Realista de Bobina (`ReceiptPreview`):**
   - Textura de papel térmico, corte serrilhado (*sawtooth*), nitidez de pixel (`image-rendering: pixelated`) e botões para **Imprimir**, **Avançar Papel (Feed)** e **Salvar PNG**.
