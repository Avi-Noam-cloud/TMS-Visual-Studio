
let tokenClient: any;
let accessToken: string | null = null;
let tokenExpirationTime: number = 0;

/**
 * Initialize the Google Identity Services Token Client.
 * Needs to be called once when the app loads or configuration changes.
 */
export const initDriveAuth = (clientId: string) => {
  if (!window.google || !clientId) return;

  try {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/drive.file', // Scope to access only files created by this app
      callback: (response: any) => {
        if (response.access_token) {
          accessToken = response.access_token;
          // Set expiration roughly (expires_in is usually 3599 seconds)
          tokenExpirationTime = Date.now() + (parseInt(response.expires_in) * 1000) - 60000; 
          console.log("Drive Access Token granted");
        } else {
          console.error("Failed to get Drive Access Token", response);
        }
      },
    });
  } catch (e) {
    console.error("Error initializing Google Drive auth:", e);
  }
};

/**
 * Triggers the popup flow to ask the user for permission.
 * Must be triggered by a user gesture (click) initially.
 */
export const requestDrivePermission = async (): Promise<boolean> => {
  if (!tokenClient) return false;
  
  return new Promise((resolve) => {
    // Override callback for this specific request to resolve the promise
    const originalCallback = tokenClient.callback;
    tokenClient.callback = (resp: any) => {
        if (resp.access_token) {
            accessToken = resp.access_token;
            tokenExpirationTime = Date.now() + (parseInt(resp.expires_in) * 1000) - 60000;
            resolve(true);
        } else {
            resolve(false);
        }
        // Restore original callback (though rarely needed if singleton)
        tokenClient.callback = originalCallback;
    };
    
    // Request token
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

/**
 * Checks if we have a valid token, if not, tries to get one quietly or returns false.
 * For automatic uploads, we rely on a previously cached valid token.
 */
const ensureAccessToken = async (): Promise<string | null> => {
  if (accessToken && Date.now() < tokenExpirationTime) {
    return accessToken;
  }
  
  // If token is missing or expired, we technically need to prompt.
  // But for "automatic" flows without user interaction, we might fail if we can't do it silently.
  // With GIS (Token model), silent refresh usually requires an iframe or just re-requesting if user authorized previously.
  // If we return null here, the caller handles the failure (e.g. asking user to reconnect).
  return null;
};

/**
 * Uploads a Blob to Google Drive using the REST API.
 */
export const uploadToDrive = async (blob: Blob, filename: string): Promise<{ id: string, webViewLink: string }> => {
  const token = await ensureAccessToken();
  if (!token) {
    throw new Error("Authentication required. Please connect Google Drive in Settings.");
  }

  // Metadata for the file
  const metadata = {
    name: filename,
    mimeType: blob.type,
    // Parents: ['root'] // Optional: specify folder ID
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', blob);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: form
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Drive Upload Failed: ${response.status} ${errorText}`);
  }

  return await response.json();
};
