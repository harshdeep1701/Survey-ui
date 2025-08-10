# Survey UI (Angular 18 + Material)

A Angular 18 app for creating and answering surveys.

* **Admin (protected)**: Create and manage surveys after Keycloak login [Work in progress]
* **Public (open)**: Render any survey and submit responses
* **Material UI**: Toolbar, cards, forms, snackbars
* **Drag & Drop Editor**: Drag input types from a side palette to append questions at the bottom, edit inline, remove, and save

---

## Features

* 🔐 **Keycloak authentication** (OIDC) for `/admin` routes [Work in progress]
* 🧩 **Dynamic form renderer** supporting `TEXT`, `CHECKBOX`, `RADIO`, `DROPDOWN`, `FILE`
* 🧱 **Drag-only survey editor**

  * Draggable **palette** in a left sidebar (pellets always stay in the toolbar)
  * Drop on canvas to **append** new question to the bottom
  * Inline edit (label, required, order, options), **remove** button
* 🧵 **Multipart submission** for responses (JSON + optional file)
* 🎨 **Angular Material** components & **animations**
* 🌐 Works with Spring Boot API (context path `/survey`)

---

## Tech stack

* Angular 18 (standalone components)
* Angular Material 18 + CDK (DragDrop)
* Keycloak JS + keycloak-angular
* RxJS
* TypeScript

---

## Prerequisites

* Node 18+ / 20+ and npm
* Angular CLI 18: `npm i -g @angular/cli`
* A running **Keycloak** server (realm + public client set up)
* A running **Spring Boot** API (default in this README assumes `http://localhost:8081/survey`)

---

## Getting started

```bash
# 1) Install
npm install

# 2) (Recommended) Install Material & CDK if you haven't
npm i @angular/material @angular/cdk

# 3) Run dev server
npm start
# => http://localhost:4200
```

---

## Configuration

### 1) Environment

`src/environments/environment.ts`

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8081/survey', // Spring Boot base (includes context path)
  keycloak: {
    url: 'https://<keycloak-host>/',          // e.g., https://auth.example.com/
    realm: 'survey-realm',
    clientId: 'survey-angular'
  }
};
```

### 2) Keycloak

* Realm: `survey-realm`
* Client: `survey-angular` (Public, PKCE S256)
* Valid redirect URIs: `http://localhost:4200/*`
* Web origins: `http://localhost:4200`

### 3) HTTP client & interceptor

`main.ts` registers HttpClient and the token interceptor:

```ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { httpAuthInterceptor } from './app/services/http-auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([httpAuthInterceptor])),
    // ...
  ]
});
```

> Note: Angular 18 `HttpInterceptorFn` must return **Observable**, not Promise. The included interceptor wraps async token retrieval with `from(...).pipe(switchMap(...))`.

### 4) Material theme & animations

* If you didn’t use `ng add @angular/material`, add a prebuilt theme in `angular.json`:

  ```json
  "styles": [
    "node_modules/@angular/material/prebuilt-themes/indigo-pink.css",
    "src/styles.scss"
  ]
  ```
* Enable animations in `main.ts`:

  ```ts
  import { provideAnimations } from '@angular/platform-browser/animations';
  // ...
  providers: [ provideAnimations(), /* ... */ ]
  ```

---

## API contract (used by the app)

Base: `http://localhost:8081/survey`

* `GET    /api/surveys` → `Survey[]`
* `GET    /api/surveys/{id}` → `Survey`
* `POST   /api/surveys` (auth) → create `Survey`
* `PUT    /api/surveys/{id}` (auth) → update `Survey`
* `DELETE /api/surveys/{id}` (auth)
* `GET    /api/surveys/{surveyId}/responses` → `SurveyResponse[]`
* `POST   /api/surveys/{surveyId}/responses` (multipart/form-data)

  * `response`: **application/json** of `{ userInputs: UserInputDTO[] }`
  * `file`: optional binary attachment

Models: see `src/app/models/api-models.ts` (contains `Survey`, `SurveyInput`, `SurveyResponseSaveRequest`, `UserInputDTO`, etc.)

---

## Project structure (key files)

```
src/
  app/
    app.component.ts                 # Top toolbar + sidenav
    app.routes.ts                    # Routes: /admin, /admin/surveys/:id, /s/:id
    models/
      survey.ts                      # UI model
      api-models.ts                  # API models & DTOs
    services/
      auth.service.ts                # Keycloak wrapper
      http-auth.interceptor.ts       # Bearer token interceptor (Observable)
      survey.service.ts              # CRUD for surveys (+ public submit shortcut)
      survey-response-api.service.ts # GET/POST responses with multipart
    components/
      dynamic-form/
        dynamic-form.component.ts    # Public survey renderer (Material)
    pages/
      admin/
        admin-page.component.ts      # My Surveys (Material list)
        survey-editor.component.ts   # Drag-only editor (palette → canvas append)
      public/
        public-survey.component.ts   # Renders survey & submits response
      not-found.component.ts
  environments/
    environment.ts
```

---

## Running the app

```bash
npm start
# http://localhost:4200

# Protected: /admin  -> redirects to Keycloak login
# Public:    /s/:id  -> dynamic survey page
```

### Optional: dev proxy (avoid CORS and hardcoding host)

Create `proxy.conf.json`:

```json
{
  "/api": {
    "target": "http://localhost:8081/survey",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug",
    "pathRewrite": { "^/api": "/api" }
  }
}
```

Update scripts:

```json
"start": "ng serve --proxy-config proxy.conf.json"
```

Then set `apiBaseUrl: ""` and call relative `/api/...` in services.

---

## Using the survey editor (drag-only)

* **Left side toolbar** lists **draggable** input types (Text, Checkbox, Radio, Dropdown, File).
* Drag a pellet and drop it on the center **canvas** → a new input is **appended to the bottom**.
* Pellets **stay in the toolbar** after drop (always reusable).
* Click **trash** on a question to remove it; ordering is normalized.
* **Save** creates/updates the survey via the API.

> If drags don’t register, ensure both **palette** and **canvas** are `cdkDropList`s and are **connected** via `[cdkDropListConnectedTo]`. The drop handler appends regardless of pointer index.

---

## Scripts

```json
"start":  "ng serve --port 4200 --open",
"build":  "ng build",
"preview":"http-server dist/survey-ui -p 4200 -c-1"
```

---

## Common pitfalls & fixes

* **NG0908: Zone.js not found**
  Add Zone:

  * `npm i zone.js` and either

    * `import 'zone.js'` at the top of `main.ts`, or
    * `"polyfills": ["zone.js"]` in `angular.json`.

* **No provider for HttpClient**
  Add `provideHttpClient()` in `main.ts`.

* **Interceptor type error (Promise vs Observable)**
  `HttpInterceptorFn` must return **Observable**. Use `from(auth.token()).pipe(switchMap(next))`.

* **CORS / wrong base URL**
  If Spring Boot uses `server.servlet.context-path: /survey`, your base must include `/survey`.
  Use the dev proxy to simplify.

* **Material/CDK mismatch**
  Ensure versions align with Angular:

  ```bash
  npm i @angular/material@^18 @angular/cdk@^18
  ```

---

## Build

```bash
npm run build
# output: dist/survey-ui
```

Serve with any static host (Nginx, Apache, S3+CloudFront, etc.). Make sure your Keycloak and API URLs in `environment.prod.ts` are correct and HTTPS in production.

---

## License

MIT (or adapt to your organization’s preference).
