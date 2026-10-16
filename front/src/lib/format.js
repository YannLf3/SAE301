/**
 * Petites fonctions de mise en forme, sans dépendance.
 */

/**
 * 149 -> « 2 h 29 »
 */
export function formaterDuree(minutes) {
  const heures = Math.floor(minutes / 60);
  const restant = minutes % 60;

  if (heures === 0) {
    return `${restant} min`;
  }

  return `${heures} h ${String(restant).padStart(2, "0")}`;
}

/**
 * 8.6 -> « 8,6 » (la virgule décimale française)
 */
export function formaterNote(note) {
  return Number(note).toFixed(1).replace(".", ",");
}

/**
 * 799 -> « 799 € », 1099 -> « 1 099 € », 12.5 -> « 12,50 € »
 * (format français ; les centimes n'apparaissent que s'il y en a)
 */
export function formaterPrix(montant) {
  const entier = Number.isInteger(montant);

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: entier ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(montant);
}
