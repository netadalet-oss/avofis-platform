/**
 * AVOfis S2 / AV-045, AV-053: deterministic preparation of canonical categorical choices.
 * No free-text inputs, case data, filing, storage, network calls or legal determination.
 */
export type PreparationChoice = { value: string; label: string };
export type PreparationField = {
  key: string; label: string; options: readonly PreparationChoice[];
};
export type PreparationResult = {
  answered: number;
  total: number;
  complete: boolean;
  selections: readonly { key: string; label: string; chosen: string }[];
};

export function safeStageTwoPreparation(
  fields: readonly PreparationField[],
  selected: Readonly<Record<string, string>>
): PreparationResult {
  if (fields.length < 1 || fields.length > 12) throw new Error("INVALID_PREPARATION_FIELDS");
  const keys = fields.map(field => field.key);
  if (new Set(keys).size !== keys.length ||
      fields.some(field => !/^[A-Za-z][A-Za-z0-9]{0,40}$/.test(field.key) ||
        !field.label || field.options.length < 2 ||
        new Set(field.options.map(option => option.value)).size !== field.options.length ||
        field.options.some(option => !/^[a-z0-9-]{1,40}$/.test(option.value) || !option.label))) {
    throw new Error("INVALID_PREPARATION_FIELDS");
  }
  // Ignore forged keys and arbitrary values; only canonical predefined labels appear.
  const selections = fields.flatMap(field => {
    const option = field.options.find(item => item.value === selected[field.key]);
    return option ? [{ key: field.key, label: field.label, chosen: option.label }] : [];
  });
  return {
    answered: selections.length, total: fields.length,
    complete: selections.length === fields.length, selections
  };
}

export function updateStageTwoPreparation(
  fields: readonly PreparationField[],
  previous: Readonly<Record<string, string>>,
  key: string,
  value: string
): Record<string, string> {
  const field = fields.find(item => item.key === key);
  if (!field || (value !== "" && !field.options.some(item => item.value === value))) {
    return { ...previous };
  }
  return { ...previous, [key]: value };
}
