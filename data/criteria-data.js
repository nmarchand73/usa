/**
 * Données de classement par critère (ordre 1 = meilleur, 51 = moins bon).
 * Sources: U.S. News Best States 2024/2025, dérivations par catégorie.
 * Chaque tableau liste les codes État dans l'ordre du rang (index 0 = rang 1).
 */
module.exports = {
  // Qualité de vie (global US News)
  qualiteDeVie: ['UT', 'NH', 'NE', 'MN', 'ID', 'IA', 'VT', 'WA', 'FL', 'MA', 'SD', 'WY', 'VA', 'NJ', 'ND', 'CO', 'WI', 'GA', 'NC', 'CT', 'DE', 'MD', 'NY', 'MT', 'KS', 'RI', 'TN', 'ME', 'TX', 'IN', 'OR', 'AZ', 'NV', 'HI', 'MO', 'OH', 'CA', 'DC', 'IL', 'KY', 'PA', 'SC', 'MI', 'OK', 'AL', 'AK', 'WV', 'AR', 'NM', 'MS', 'LA'],
  // Sécurité (Crime & Corrections: NH, ME, HI en tête; LA, NM, AK... en bas)
  securite: ['NH', 'ME', 'HI', 'VT', 'WY', 'ID', 'UT', 'MN', 'IA', 'ND', 'SD', 'NJ', 'VA', 'MA', 'CT', 'RI', 'NE', 'WI', 'MT', 'OR', 'WA', 'KS', 'CO', 'IN', 'KY', 'NC', 'DE', 'WV', 'OH', 'TX', 'FL', 'GA', 'AZ', 'NV', 'OK', 'TN', 'SC', 'MD', 'NM', 'MI', 'PA', 'IL', 'MO', 'AR', 'CA', 'NY', 'AL', 'MS', 'AK', 'LA', 'DC'],
  // Santé (Health Care: HA, MA, CT...; MS, OK, WV en bas)
  sante: ['HI', 'MA', 'CT', 'MN', 'NH', 'VT', 'IA', 'CO', 'WA', 'UT', 'NJ', 'MD', 'NE', 'WI', 'ID', 'RI', 'VA', 'DE', 'OR', 'FL', 'KS', 'ND', 'SD', 'AZ', 'NC', 'GA', 'ME', 'TX', 'WY', 'MT', 'OH', 'IN', 'NY', 'PA', 'MI', 'IL', 'CA', 'TN', 'NV', 'KY', 'MO', 'SC', 'OK', 'AR', 'AL', 'WV', 'NM', 'LA', 'MS', 'AK', 'DC'],
  // Transports / Infrastructure
  transports: ['ND', 'NE', 'SD', 'IA', 'WY', 'MT', 'ID', 'KS', 'MN', 'UT', 'WA', 'OR', 'CO', 'WI', 'NH', 'VT', 'DE', 'VA', 'GA', 'TX', 'NC', 'FL', 'OH', 'IN', 'AZ', 'NV', 'TN', 'NJ', 'MD', 'MA', 'PA', 'MI', 'IL', 'CA', 'NY', 'CT', 'RI', 'ME', 'KY', 'MO', 'SC', 'AL', 'OK', 'AR', 'NM', 'WV', 'LA', 'MS', 'AK', 'HI', 'DC'],
  // Commerces et services (proxy Economy + densité)
  commercesEtServices: ['FL', 'TX', 'UT', 'CO', 'WA', 'ID', 'NV', 'AZ', 'GA', 'NC', 'TN', 'MA', 'NH', 'VA', 'MN', 'WI', 'NJ', 'OR', 'DE', 'MD', 'IA', 'NE', 'SD', 'ND', 'IN', 'OH', 'MT', 'WY', 'KS', 'SC', 'KY', 'MI', 'PA', 'IL', 'CA', 'NY', 'CT', 'RI', 'ME', 'VT', 'AK', 'NM', 'OK', 'AL', 'MO', 'AR', 'WV', 'LA', 'MS', 'HI', 'DC'],
  // Éducation
  education: ['MA', 'NJ', 'FL', 'UT', 'NH', 'VT', 'CT', 'VA', 'MN', 'WI', 'IA', 'CO', 'MD', 'NE', 'WY', 'ND', 'ID', 'KS', 'DE', 'WA', 'SD', 'OR', 'RI', 'MT', 'GA', 'NC', 'OH', 'TX', 'PA', 'NY', 'ME', 'IN', 'AZ', 'KY', 'MI', 'IL', 'TN', 'NV', 'SC', 'CA', 'MO', 'OK', 'NM', 'AL', 'WV', 'AR', 'LA', 'MS', 'AK', 'HI', 'DC'],
  // Protection de l'environnement (Natural Environment)
  protectionEnvironnement: ['HI', 'VT', 'NH', 'ME', 'MT', 'WY', 'ID', 'SD', 'OR', 'WA', 'MN', 'CO', 'UT', 'RI', 'MA', 'WI', 'IA', 'NE', 'ND', 'KS', 'VA', 'NJ', 'CT', 'NY', 'MI', 'PA', 'OH', 'IN', 'IL', 'WV', 'KY', 'TN', 'NC', 'SC', 'GA', 'AL', 'AR', 'MO', 'OK', 'TX', 'LA', 'MS', 'AZ', 'NM', 'CA', 'FL', 'NV', 'DE', 'MD', 'AK', 'DC'],
  // Finances et impôts locaux (Fiscal Stability)
  financesImpotsLocaux: ['NE', 'UT', 'WY', 'ID', 'ND', 'SD', 'IA', 'TN', 'FL', 'NV', 'NH', 'TX', 'OK', 'IN', 'GA', 'NC', 'VA', 'CO', 'MT', 'AZ', 'WA', 'OR', 'KS', 'WI', 'MN', 'OH', 'SC', 'MO', 'KY', 'AL', 'AR', 'MS', 'LA', 'WV', 'AK', 'ME', 'VT', 'RI', 'DE', 'MI', 'PA', 'NJ', 'MD', 'CT', 'NY', 'IL', 'CA', 'MA', 'HI', 'NM', 'DC'],
  // Solidarité / Opportunity (accès logement, équité)
  solidarite: ['NH', 'MN', 'UT', 'IA', 'NE', 'WI', 'ND', 'WA', 'CO', 'VT', 'MA', 'NJ', 'MD', 'VA', 'DE', 'KS', 'ID', 'WY', 'SD', 'HI', 'OR', 'MT', 'RI', 'CT', 'ME', 'FL', 'GA', 'NC', 'TX', 'AZ', 'OH', 'IN', 'PA', 'NY', 'MI', 'IL', 'TN', 'KY', 'NV', 'SC', 'CA', 'MO', 'OK', 'AL', 'NM', 'AR', 'WV', 'LA', 'MS', 'AK', 'DC'],
  // Sports et loisirs (nature + équipements)
  sportsEtLoisirs: ['CO', 'UT', 'VT', 'MT', 'WY', 'ID', 'OR', 'WA', 'NH', 'ME', 'MN', 'WI', 'CA', 'HI', 'AZ', 'NV', 'FL', 'SD', 'ND', 'IA', 'NE', 'MA', 'NY', 'PA', 'MI', 'TX', 'GA', 'NC', 'TN', 'SC', 'KY', 'IN', 'OH', 'MO', 'AR', 'NM', 'OK', 'AL', 'WV', 'LA', 'MS', 'AK', 'IL', 'NJ', 'CT', 'RI', 'DE', 'MD', 'VA', 'KS', 'DC'],
  // Attractivité immobilière (inverse coût: abordable = attractif pour achat; on utilise coût déjà dans state-map)
  attractiviteImmobiliere: ['OK', 'MS', 'WV', 'AL', 'KS', 'AR', 'MO', 'TN', 'IA', 'MI', 'IN', 'ND', 'SD', 'NE', 'KY', 'GA', 'LA', 'TX', 'OH', 'WI', 'NC', 'SC', 'MN', 'NM', 'WY', 'PA', 'IL', 'MT', 'ID', 'NV', 'VA', 'DE', 'FL', 'UT', 'CO', 'AZ', 'RI', 'NH', 'OR', 'ME', 'VT', 'CT', 'NJ', 'WA', 'MD', 'NY', 'AK', 'MA', 'CA', 'HI', 'DC']
};
