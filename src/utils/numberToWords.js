export function convertNumberToWords(num) {
  if (num === 0) return 'zéro';
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
    'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

  function under100(n) {
    if (n < 20) return units[n];
    const t = Math.floor(n / 10);
    const u = n % 10;
    if (t === 7 || t === 9) return tens[t] + '-' + units[10 + u];
    return tens[t] + (u ? '-' + units[u] : (t === 8 ? 's' : ''));
  }
  function under1000(n) {
    if (n < 100) return under100(n);
    const c = Math.floor(n / 100);
    const r = n % 100;
    return (c === 1 ? 'cent' : units[c] + ' cent') + (r ? ' ' + under100(r) : (c > 1 ? 's' : ''));
  }
  function underMillion(n) {
    if (n < 1000) return under1000(n);
    const m = Math.floor(n / 1000);
    const r = n % 1000;
    return (m === 1 ? 'mille' : under1000(m) + ' mille') + (r ? ' ' + under1000(r) : '');
  }
  function underBillion(n) {
    if (n < 1000000) return underMillion(n);
    const b = Math.floor(n / 1000000);
    const r = n % 1000000;
    return (b === 1 ? 'un million' : under1000(b) + ' millions') + (r ? ' ' + underMillion(r) : '');
  }
  if (num < 1000000000) return underBillion(num);
  const md = Math.floor(num / 1000000000);
  const r = num % 1000000000;
  return (md === 1 ? 'un milliard' : under1000(md) + ' milliards') + (r ? ' ' + underBillion(r) : '');
}