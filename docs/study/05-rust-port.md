# 05 — Preparar o terreno para uma versão em Rust

> Você quer, no futuro, uma versão em Rust para usar em vários lugares. Esta nota não propõe fazer o port agora: lista o que,
> **escrevendo TypeScript hoje**, torna o port barato (e o que o encarece).

## 1. Como projetos reais distribuem um núcleo para várias linguagens (fonte)
- **ICU4X** — i18n em Rust pensado para "ambientes cliente e com poucos recursos", **pequeno e rápido**, com suporte multi-linguagem
  [(site)](https://icu4x.unicode.org/). As ligações vêm do **Diplomat**, gerador de FFI via *proc macros* (sem arquivo IDL), que emite **C, C++, JS/TS, Dart** (e, segundo listagens, Kotlin/Python — maturidade não confirmada).
  [icu_capi](https://docs.rs/crate/icu_capi/2.3.0) é a fonte das ligações geradas.
- **UniFFI** (Mozilla) — gera **Kotlin, Swift, Python, Ruby** a partir de um núcleo Rust, a partir de uma definição de interface; usado no Firefox.
  [docs.rs/uniffi](https://docs.rs/crate/uniffi/latest).
- **Material Color Utilities** — mesma lógica de cor reimplementada em **C++, Dart, Java, Swift, TS, Kotlin** (porte manual por linguagem).
- **ICU4X separa motor de dados** (CLDR): a lógica é pequena; os **dados de locale** são carregados à parte. Aplicar o mesmo à `Mask`
  (motor ≠ presets por país) e ao tempo (motor ≠ provider de fuso/locale).

Dois caminhos possíveis para você: **(a)** núcleo em Rust + gerador de bindings (Diplomat/UniFFI/wasm-bindgen) e o TS vira *wrapper*;
**(b)** portar à mão cada módulo (como o Material). A escolha muda o que vale a pena *já* tornar portável.

## 2. Regras para o TypeScript de hoje (barato agora, valioso depois) **[proposta]**
| Faça | Evite |
|---|---|
| **Dados + funções puras**: spec/preset como objeto, `transition(state, event)`, `format(parts)` | closures com estado escondido, `this` mutável espalhado, métodos extraídos que dependem de `this` |
| **Tipos fechados** (uniões discriminadas, `enum`-like) para estados, eventos, segmentos | `any`, `Record<string, any>` como contrato (`ThemeStyle.components` hoje é assim) |
| **Erros como valor** (`{ ok, error }`) nas APIs de parse/validação, e `throw` só para bug | exceções como fluxo normal (jiff usa `Result` em tudo — [DESIGN](https://github.com/BurntSushi/jiff/blob/master/DESIGN.md)) |
| **Relógio, fuso, locale e aleatoriedade injetáveis** (`now()`, `tzOffset()`, `localeData()`) | `Date.now()`, `Intl`, `Math.random()` no meio da lógica; `setInterval` dentro do núcleo (`ticker` hoje) |
| **Números/strings** com limites e unidade explícitos (ms vs ns, UTF-16 vs code points — a lib já cuida de surrogates) | assumir `number` de 53 bits para ns; indexar string por `[i]` |
| **Núcleo sem Proxy, sem decorators, sem monkey-patch de protótipo** | `declarations.ts` que estende `String.prototype` (`_Global.register`) — não porta e atrapalha tree-shaking |
| API **de superfície pequena e estável** (já é a meta do CLAUDE.md) | exportar tudo "por via das dúvidas" |

## 3. O que o núcleo reativo muda
`signal`/`computed` são um modelo próprio (push-pull com versões). Em Rust, equivalentes existem como crates, mas a **API de funções-propriedade**
(`s()`, `s.set()`) não tem tradução direta. Por isso a proposta de `03` (transições puras `(estado, evento) → estado'` com invólucro reativo
fino) favorece o port: o que se porta é a **função pura e os dados**; o invólucro reativo é reescrito por plataforma.

## 4. Verificação cruzada que vale desde já
Manter **vetores de teste em dados** (JSON): entrada → saída esperada para `Mask`, duração, CPF/CNPJ, calendário. Os mesmos arquivos
validam a versão TS e, depois, a versão Rust — o jeito mais barato de provar equivalência.
