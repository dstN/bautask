// The shift switch. "Automatisch" follows the device; Tagschicht and Nachtschicht pin light or dark for this page view
// through data-ansicht on <html> (src/styles/seite.css). Nothing is stored: the privacy policy promises no browser
// storage, so every page starts on automatic. Without JavaScript the switch stays hidden and the device decides.
const feld = document.querySelector<HTMLFieldSetElement>('[data-ansicht]');

if (feld) {
  feld.hidden = false;
  feld.addEventListener('change', (ev) => {
    if (!(ev.target instanceof HTMLInputElement)) return;
    const wurzel = document.documentElement;
    if (ev.target.value === 'auto') delete wurzel.dataset['ansicht'];
    else wurzel.dataset['ansicht'] = ev.target.value;
  });
}
