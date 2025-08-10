export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8081/survey',
  keycloak: {
    url: 'http://localhost:8080/survey',   // e.g., https://auth.example.com/
    realm: 'survey-realm',
    clientId: 'survey-angular'
  }
};
