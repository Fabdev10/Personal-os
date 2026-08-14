# Personal OS (Local)

Questo repository contiene la base per "Personal OS": un'app personale completamente locale.

Quick start (Docker):

```bash
cp .env.example .env
docker compose up -d --build
```

Dev (senza Docker):

- Backend
  - aprire `personal-os/backend`, installare dipendenze `npm install`
  - `npm run dev`
- Frontend
  - aprire `personal-os/frontend`, installare dipendenze `npm install`
  - `npm run dev`

Struttura:

```
personal-os/
├── frontend/
├── backend/
├── prisma/
├── docker-compose.yml
├── .env.example
└── README.md
```

Obiettivo: sviluppo completamente in locale, nessun servizio cloud.
