/**
 * Lien vers le site officiel de chaque État (portail .gov de l'État).
 * Syntaxe : https://www.[état].gov/ (code ou nom selon l'État).
 * Ex. North Dakota : https://www.nd.gov/
 */
const defaultUrl = (code) => `https://www.${code.toLowerCase()}.gov/`;

module.exports = {
  AL: defaultUrl('al'),
  AK: defaultUrl('ak'),
  AZ: defaultUrl('az'),
  AR: defaultUrl('ar'),
  CA: defaultUrl('ca'),
  CO: defaultUrl('co'),
  CT: defaultUrl('ct'),
  DE: defaultUrl('de'),
  DC: 'https://www.dc.gov/',
  FL: defaultUrl('fl'),
  GA: defaultUrl('ga'),
  HI: defaultUrl('hi'),
  ID: defaultUrl('id'),
  IL: defaultUrl('il'),
  IN: defaultUrl('in'),
  IA: defaultUrl('ia'),
  KS: defaultUrl('ks'),
  KY: defaultUrl('ky'),
  LA: defaultUrl('la'),
  ME: defaultUrl('me'),
  MD: defaultUrl('md'),
  MA: 'https://www.mass.gov/',      // Massachusetts : mass.gov
  MI: defaultUrl('mi'),
  MN: defaultUrl('mn'),
  MS: defaultUrl('ms'),
  MO: defaultUrl('mo'),
  MT: defaultUrl('mt'),
  NE: defaultUrl('ne'),
  NV: defaultUrl('nv'),
  NH: defaultUrl('nh'),
  NJ: defaultUrl('nj'),
  NM: defaultUrl('nm'),
  NY: defaultUrl('ny'),
  NC: defaultUrl('nc'),
  ND: defaultUrl('nd'),              // North Dakota : nd.gov
  OH: defaultUrl('oh'),
  OK: defaultUrl('ok'),
  OR: defaultUrl('or'),
  PA: defaultUrl('pa'),
  RI: defaultUrl('ri'),
  SC: defaultUrl('sc'),
  SD: defaultUrl('sd'),
  TN: defaultUrl('tn'),
  TX: 'https://www.texas.gov/',     // Texas : texas.gov
  UT: defaultUrl('ut'),
  VT: defaultUrl('vt'),
  VA: defaultUrl('va'),
  WA: defaultUrl('wa'),
  WV: defaultUrl('wv'),
  WI: defaultUrl('wi'),
  WY: defaultUrl('wy'),
};
