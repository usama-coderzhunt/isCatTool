/**
 * Extracts fields and their values from an object, excluding specified keys
 * @param settings The settings object to extract fields from
 * @param prohibitedKeys Array of keys to exclude from the result
 * @returns Array of objects with key, label, and value properties
 */
export const getFieldsAndValues = (
  settings: any, 
  prohibitedKeys: string[] = ['created_by', 'updated_by', 'id', 'created_at', 'updated_at']
) => {
  if (!settings) return [];
  
  return Object.keys(settings)
    .filter(key => !prohibitedKeys.includes(key))
    .map(key => ({
      key,
      label: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      value: settings[key],
      type: getFieldType(key)
    }));
};

/**
 * Determines the appropriate input type for a field based on its key
 * @param key The field key
 * @returns The input type to use for the field
 */
const getFieldType = (key: string): 'text' | 'password' | 'number' | 'email' => {
  if (key.includes('password') || key.includes('secret') || key.includes('key') || key.includes('sid')) {
    return 'password';
  }
  
  if (key.includes('email')) {
    return 'email';
  }
  
  if (key.includes('count') || key.includes('amount') || key.includes('price') || key.includes('quantity')) {
    return 'number';
  }
  
  return 'text';
};
