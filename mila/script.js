(() => {
  'use strict';
  const { chistes, despedida } = window.MILA_DATA;
  const round = [...chistes];
  // Fisher–Yates: each joke appears exactly once per round.
  for (let i = round.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [round[i], round[j]] = [round[j], round[i]];
  }
  const joke = document.getElementById('joke');
  const button = document.getElementById('generate');
  let next = 1;
  let busy = false;
  let finished = false;
  joke.textContent = round[0];
  button.disabled = false;
  button.addEventListener('click', () => {
    if (busy || finished) return;
    busy = true;
    // Keep keyboard focus while preventing all duplicate activations.
    button.setAttribute('aria-disabled', 'true');
    button.textContent = 'Mila está pensando…';
    joke.classList.remove('reveal');
    window.setTimeout(() => {
      finished = next === round.length;
      joke.textContent = finished ? despedida : round[next++];
      joke.classList.add('reveal');
      button.textContent = finished ? 'Mila se ha ido a dormir' : 'Generar otro chiste';
      button.setAttribute('aria-disabled', String(finished));
      busy = false;
    }, 550);
  });
})();
