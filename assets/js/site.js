// Fecha o menu do celular depois de escolher uma secao; sem isso o <details>
// continua aberto por cima do conteudo. A pagina funciona sem este script.
document.querySelectorAll(".topo__menu a").forEach(function (a) {
  a.addEventListener("click", function () {
    a.closest("details").removeAttribute("open");
  });
});
