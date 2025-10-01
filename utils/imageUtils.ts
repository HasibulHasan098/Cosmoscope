const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // The result includes the data URL prefix (e.g., "data:image/jpeg;base64,"), 
        // so we split and take the second part which is the pure Base64 string.
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to read blob as a Base64 string.'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const fileToBase64 = (file: File): Promise<string> => {
    return blobToBase64(file);
};


export const urlToBase64 = async (url: string): Promise<string> => {
  // NASA image URLs can be HTTP. Upgrade to HTTPS for better compatibility with proxies and browsers.
  const secureUrl = url.replace(/^http:/, 'https:');
  
  // Using a list of public CORS proxies as fallbacks increases reliability.
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(secureUrl)}`,
    // Add another proxy as a fallback.
    `https://api.codetabs.com/v1/proxy?quest=${secureUrl}`
  ];

  for (const proxyUrl of proxies) {
    try {
      // Attempt to fetch the image through the current proxy.
      const response = await fetch(proxyUrl);
      
      // If the response is successful, process it.
      if (response.ok) {
        const blob = await response.blob();
        return await blobToBase64(blob);
      }
      
      // Log a warning if a proxy fails, then the loop will try the next one.
      console.warn(`CORS proxy failed: ${proxyUrl.split('?')[0]} responded with status ${response.status}`);
    } catch (error) {
      // Log a warning if a fetch error occurs (e.g., network issue), then try the next proxy.
      console.warn(`CORS proxy error with ${proxyUrl.split('?')[0]}:`, error);
    }
  }

  // If all proxies in the list have been tried and failed, throw an error.
  throw new Error('All CORS proxies failed. Unable to fetch the image.');
};