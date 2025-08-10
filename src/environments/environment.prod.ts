export const environment = {
  production: true,
  apiBaseUrl: 'https://your-api.example.com/api',
  keycloak: {
    url: 'http://localhost:8080/',   // e.g., https://auth.example.com/
    realm: 'survey-realm',
    clientId: 'survey-angular'
  }
};
