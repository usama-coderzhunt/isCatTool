const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY

if (!SECRET_KEY) {
  throw new Error('Missing NEXT_PUBLIC_ENCRYPTION_KEY')
}

function base64Encode(str: string): string {
  const bytes = new TextEncoder().encode(str)
  return btoa(String.fromCharCode(...bytes))
}

function base64Decode(base64: string): string {
  try {
    const binary = atob(base64)
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch (error) {
    console.error('Failed to decode base64 string:', error)
    return ''
  }
}

// XOR cipher function
function xorCipher(text: string, key: string): string {
  let result = ''
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return result
}

// Public API
export function cipher(data: any): string {
  try {
    const json = JSON.stringify(data)
    const encrypted = xorCipher(json, SECRET_KEY!)
    return base64Encode(encrypted)
  } catch (error) {
    console.error('Encryption failed:', error)
    return ''
  }
}

export function decipher(cipherText: string): any {
  try {
    const decryptedBase64 = base64Decode(cipherText)
    const decryptedJson = xorCipher(decryptedBase64, SECRET_KEY!)
    return JSON.parse(decryptedJson)
  } catch (error) {
    console.error('Decryption failed:', error)
    return null
  }
}

// Function to decrypt localStorage values
export function getDecryptedLocalStorage(key: string): any {
  const encryptedValue = localStorage.getItem(key)

  if (!encryptedValue) {
    return null
  }

  try {
    const decrypted = decipher(encryptedValue)
    return decrypted
  } catch (error) {
    // If decryption fails, it might not be encrypted
    console.warn(`Could not decrypt ${key}, returning raw value`)
    return encryptedValue
  }
}
