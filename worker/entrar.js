/**
 * MyPromo — redirecionador de grupos (Cloudflare Worker)
 * Rota: mypromo.digital/entrar?n=<nicho>
 *
 * Por que existe: o grupo de WhatsApp lota (1.024 pessoas). Se o link do grupo
 * estivesse no anúncio ou no botão da página, quando lotasse o tráfego morreria
 * e seria preciso mexer em cada anúncio. Aqui o destino é decidido no clique.
 *
 * Também é ele que carimba a chave de coorte (nicho_grupo, ex.: achados_g01),
 * que é a MESMA chave usada no SubID do link de afiliado. Sem isso o ROI por
 * grupo não fecha.
 *
 * Configuração: variável de ambiente GRUPOS (JSON), no formato
 * {
 *   "achados": [ {"id":"g01","url":"https://chat.whatsapp.com/XXXX","ativo":true} ],
 *   "casa":    [ {"id":"g01","url":"https://chat.whatsapp.com/YYYY","ativo":true} ]
 * }
 * Quando um grupo lota: "ativo": false e acrescenta o próximo. Só isso.
 */

const FALLBACK = 'https://mypromo.digital/achados/';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const nicho = (url.searchParams.get('n') || 'achados').toLowerCase();

    let grupos = {};
    try { grupos = JSON.parse(env.GRUPOS || '{}'); } catch (_) {}

    const lista = (grupos[nicho] || []).filter(g => g.ativo && g.url);
    if (lista.length === 0) {
      // nicho sem grupo aberto: volta pra página em vez de dar erro na cara do lead
      return Response.redirect(FALLBACK, 302);
    }

    // primeiro grupo aberto da fila. Trocar de grupo = desligar o anterior.
    const grupo = lista[0];
    const chave = `${nicho}_${grupo.id}`;

    // log de clique por coorte (vai virar consulta no Supabase depois)
    console.log(JSON.stringify({
      evento: 'clique_entrar',
      chave,
      ref: request.headers.get('referer') || null,
      pais: request.cf?.country || null,
    }));

    const destino = new URL(grupo.url);
    const headers = new Headers({ Location: destino.toString() });
    // não cacheia: o grupo ativo muda
    headers.set('Cache-Control', 'no-store');
    headers.set('Set-Cookie', `mp_coorte=${chave}; Path=/; Max-Age=2592000; SameSite=Lax`);
    return new Response(null, { status: 302, headers });
  },
};
