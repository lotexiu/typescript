# 01 — Vidro (SVG `backdrop-filter`): custo, alternativas e o que adotamos

> Escopo: o efeito "Liquid Glass" do app de teste (`apps/react-desk/src/tv/glass/`). Nada disto entra na lib
> (é CSS/SVG), mas as conclusões valem para qualquer porte do efeito. Números medidos, não deduzidos.

## 1. Como o efeito funciona (fontes)

- CSS puro não refrata: as 10 funções de `backdrop-filter` não deslocam pixels. O deslocamento vem de
  `feDisplacementMap`, que usa uma segunda imagem como mapa (canais R/G = deslocamento X/Y, 128 = neutro).
  [LogRocket](https://blog.logrocket.com/how-create-liquid-glass-effects-css-and-svg/),
  [Ekino/Medium](https://medium.com/ekino-france/liquid-glass-in-css-and-svg-839985fcb88d).
- O [kube.io](https://kube.io/blog/liquid-glass-css-svg/) gera o mapa com física: perfil de altura do bisel
  (círculo convexo, "squircle", côncavo, "lip"), normal por derivada numérica, Snell (n=1,5), e codifica
  `R=128+x·127`, `G=128+y·127`. Avisa que **mudar tamanho/forma obriga a refazer o mapa**, e que animar `scale` é barato.
- **Só Chromium** aceita `url()` em `backdrop-filter`; Firefox/Safari degradam para blur
  ([WebKit 245510](https://bugs.webkit.org/show_bug.cgi?id=245510), [Mozilla 1961378](https://bugzilla.mozilla.org/show_bug.cgi?id=1961378)).
- Aberração cromática é "deslocar R, G e B com intensidades diferentes" (3 `feDisplacementMap` + `feColorMatrix` + `feBlend`).
- Custo de `backdrop-filter` em geral (post do Chrome sobre blur animado + docs do compositor): um painel cujo
  conteúdo **não mudou** reaproveita a textura anterior (**custo zero**); quando o que está **atrás** muda, o
  filtro é refeito **a cada quadro** e o dano se expande para a superfície inteira.
  [developer.chrome.com](https://developer.chrome.com/blog/animated-blur/).
  Não achei benchmark público do custo de SVG-em-`backdrop-filter`, então medimos.

## 2. O que medimos

Banco de testes isolado (`apps/react-desk/bench/glass/`): 5 painéis com as medidas reais da tela de TV sobre um
fundo detalhado, 1920×1080, Chromium headless **sem GPU** (rasterização por software). Isso satura 1 núcleo, então a
métrica útil é **fps** (maior = melhor); vale o **ranking e a proporção**, não o valor absoluto. Em GPU real tudo sobe.

Fundo em movimento (orbes + conteúdo rolando):

| Variante | fps | observação |
|---|---:|---|
| sem filtro | 26 | o custo do próprio fundo animado |
| só `blur` | 17 | |
| **canvas + 3 deslocamentos** (o que tínhamos) | **7,6** | |
| canvas + 1 deslocamento | 12,2 | −2 passes ≈ +60% |
| **mapa vetorial (SVG) + 1 deslocamento** | **11,6–12,8** | = canvas, sem laço de pixels |
| mapa vetorial + 2 deslocamentos (R × ciano) | 9,6 | meio-termo da aberração |
| mapa vetorial + 3 deslocamentos | 7,6–7,8 | |
| aberração por `feOffset` (1 deslocamento + canais deslocados) | 7,6 | **não** economiza |
| mapa **por primitivas** (flood→blur→Sobel→desloca) + 1 | 3,4 | **mais lento** |
| mapa por primitivas + aberração | 1,2 | |

Outras alavancas (mapa vetorial, 1 passe):

| Situação | fps |
|---|---:|
| 5 painéis refratando | 12,2 |
| só 1 painel refrata (os outros só blur) | 15,2 |
| sem os orbes animados (só o conteúdo rola) | 20,2 (3 passes: 10) |
| **fundo parado, qualquer variante** | **60 (CPU 0,02)** |

### Conclusões

1. **Hipótese "só primitivas de filtro é mais leve": refutada.** O mapa por primitivas (`feFlood` → `feGaussianBlur`
   para criar a rampa → `feConvolveMatrix` Sobel para o gradiente/normal → `feDisplacementMap`) funciona, mas o
   Chromium **refaz toda a cadeia a cada quadro**, enquanto uma imagem de mapa é só uma textura. Ficou 3–6× mais
   lento e, além disso, **pior visualmente**: o Sobel em 8 bits quantiza o gradiente (serrilhado, texto quebrado).
2. **Canvas não era o gargalo por quadro** — o gargalo é o filtro rodar sobre o fundo em movimento. Mas o canvas
   tinha custo de CPU em JS (laço por pixel, ~11 ms por painel) e memória. O **mapa vetorial** (4 gradientes com
   `mix-blend-mode` dentro de um SVG-imagem) dá a **mesma imagem** em ~0,10 ms, sem canvas.
3. **O maior ganho é não mexer o que está atrás**: fundo animado desligado → 8,7 → **60 fps** em repouso no app real.
4. Aberração cromática de 3 canais custa ~40% do fps; a de `feOffset` não ajuda. Vira nível de qualidade.
5. Refrata só onde há detalhe nítido atrás (hero, player, painéis modais); barras sobre papel de parede liso só desfocam.

App real (mesma máquina), repouso / navegando com o conteúdo rolando:

| Configuração | parado | navegando |
|---|---:|---:|
| antes (completo + fundo animado) | 8,7 | 8,8 |
| completo, fundo parado | 60 | 15,7 |
| **equilibrado, fundo parado (novo padrão)** | **60** | **21,7** |

## 3. O que foi adotado

- Mapa vetorial (`glass/displacement.ts`): sem canvas, sem laço de pixel, `Cache` com LRU, custo medido com `StopWatch.measure`.
- Níveis de qualidade: **Leve** (só blur) · **Equilibrado** (1 passe, padrão) · **Completo** (3 passes = aberração).
- **Fundo animado** é opcional e vem desligado.
- `refract={false}` nas superfícies sem conteúdo nítido atrás.

## 4. Ideias que ficaram de fora (para decidir)

- **Qualidade adaptativa**: cair para blur/sólido só *enquanto* algo se move (scroll/transição) e voltar ao repouso.
  Dado do teste: sem filtro o fundo em movimento chega a 60 fps. Risco: "pulo" visual na troca (backdrop-filter não faz crossfade).
- Detectar fps baixo e rebaixar o nível sozinho.
- WebGL/shader para o vidro (outro custo/complexidade; não pesquisado a fundo aqui).
- Safari/Firefox: hoje só blur. Acompanhar os bugs acima.
