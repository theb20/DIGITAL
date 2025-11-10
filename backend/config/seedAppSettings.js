import * as AppSettings from "../models/appSettings.model.js";

async function ensureSetting(key, value, type = 'string', description = null) {
  await AppSettings.ensureTable();
  const existing = await AppSettings.findByKey(key);
  if (!existing) {
    return await AppSettings.create({
      setting_key: key,
      setting_value: value,
      setting_type: type,
      description,
    });
  }
  // Mettre à jour si la valeur a changé
  if (String(existing.setting_value) !== String(value) || String(existing.setting_type) !== String(type)) {
    return await AppSettings.update(existing.id, {
      setting_key: key,
      setting_value: value,
      setting_type: type,
      description: description ?? existing.description,
    });
  }
  return existing;
}

export async function ensureDefaultContactSettings() {
  const openingHours = {
    weekdays: "Lundi - Vendredi: 9h - 18h",
    saturday: "Samedi: 10h - 16h",
    sunday: "Dimanche: Fermé",
  };

  await ensureSetting('number', '+225 07 05 234 324', 'string', 'Téléphone principal');
  await ensureSetting('email', 'contact@filter-finder.com', 'string', 'Adresse email de contact');
  await ensureSetting('contact_hours_summary', 'Lun - Ven: 9h - 18h', 'string', 'Résumé des horaires');
  await ensureSetting('response_time', 'Réponse sous 24h', 'string', "Délai moyen de réponse");
  await ensureSetting('address', '123 Avenue des Champs-Élysées, 75008 Paris, France', 'string', 'Adresse de contact');
  await ensureSetting('opening_hours_json', JSON.stringify(openingHours), 'json', 'Horaires détaillés');
}

export default { ensureDefaultContactSettings };