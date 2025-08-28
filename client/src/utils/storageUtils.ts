export const getItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error getting item from localStorage', error);
    return null;
  }
};

export const setItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error('Error setting item in localStorage', error);
  }
};

export const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing item from localStorage', error);
  }
};

export const getJSON = <T>(key: string): T | null => {
  const item = getItem(key);
  if (item) {
    try {
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Error parsing JSON from localStorage', error);
      return null;
    }
  }
  return null;
};

export const setJSON = (key: string, value: any): void => {
  try {
    const stringValue = JSON.stringify(value);
    setItem(key, stringValue);
  } catch (error) {
    console.error('Error stringifying JSON for localStorage', error);
  }
};