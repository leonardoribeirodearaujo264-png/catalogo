/**
 * Trava a rolagem do fundo enquanto um menu, modal ou bottom sheet está
 * aberto. Conta quantos elementos pediram a trava: fechar um enquanto
 * outro segue aberto não pode liberar a página.
 *
 * Devolve a função de limpeza, então serve direto como corpo de um efeito:
 *   useEffect(() => lockBodyScroll(open), [open]);
 */
let locks = 0;

export function lockBodyScroll(active: boolean): () => void {
  if (typeof document === "undefined" || !active) return () => {};

  locks += 1;
  document.body.dataset.lockScroll = "true";

  return () => {
    locks = Math.max(0, locks - 1);
    if (locks === 0) delete document.body.dataset.lockScroll;
  };
}
