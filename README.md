# MyPromo — site

Páginas do MyPromo hospedadas no GitHub Pages, domínio `mypromo.digital`
(registrado na Namecheap, DNS na Cloudflare).

## Estrutura

- `achados/` — LP do grupo de Achados Gerais (v1, molde dos outros nichos)
- `index.html` — raiz, hoje só redireciona para `/achados/`. Vira a página hub (Página B) quando ela existir.
- `CNAME` — domínio custom do GitHub Pages
- `.nojekyll` — desliga o Jekyll (evita que arquivos com `_` sejam ignorados)

## Como a página funciona

- Pixel da Meta `1590110515865777` no `<head>`, disparando `PageView`.
- Os 6 botões de grupo apontam para `/entrar?n=<nicho>` e disparam o evento
  personalizado `EntrouNoGrupo` antes de sair.
- `/entrar` NÃO é servido aqui: é um Cloudflare Worker que decide o grupo ativo
  no momento do clique (rotação), carimba a chave de coorte `<nicho>_g<NN>`
  e redireciona para o convite do WhatsApp. Sem ele, grupo cheio = tráfego perdido.

## Publicar

Push na branch `main`. O GitHub Pages republica sozinho.
