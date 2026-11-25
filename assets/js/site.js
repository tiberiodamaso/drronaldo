// Fecha o menu do celular depois de escolher uma secao; sem isso o <details>
// continua aberto por cima do conteudo. A pagina funciona sem este script.
document.querySelectorAll(".topo__menu a").forEach(function (a) {
  a.addEventListener("click", function () {
    a.closest("details").removeAttribute("open");
  });
});

// No celular, a bolha flutuante some enquanto um bloco de botoes de WhatsApp esta na
// tela: ali ela e redundante e cobriria o texto junto dos botoes (o CSS so aplica a
// classe abaixo de 600 px). Sem IntersectionObserver, a bolha fica sempre visivel.
var bolha = document.querySelector(".bolha");
if (bolha && "IntersectionObserver" in window) {
  var naTela = [];                      // blocos .agendar visiveis agora
  var obs = new IntersectionObserver(function (itens) {
    itens.forEach(function (i) {
      var k = naTela.indexOf(i.target);
      if (i.isIntersecting && k < 0) naTela.push(i.target);
      if (!i.isIntersecting && k >= 0) naTela.splice(k, 1);
    });
    bolha.classList.toggle("bolha--oculta", naTela.length > 0);
  });
  document.querySelectorAll(".agendar").forEach(function (el) { obs.observe(el); });
}
