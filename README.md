🔗 URLShortener

A modern URL shortening service that transforms long URLs into short, easy-to-share links. Designed with simplicity, scalability, and performance in mind, this project serves as a practical implementation of URL redirection and link management.

🚀 Overview

URLShortener allows users to:

- Convert long URLs into compact short links
- Access original URLs through fast redirection
- Manage shortened links efficiently
- Lay the foundation for analytics, authentication, and advanced link management features

✨ Features

- URL shortening
- Unique short code generation
- URL validation
- Fast redirection
- Clean and responsive interface
- RESTful API architecture
- Easy deployment and scalability

🛠️ Tech Stack

«Update this section as development progresses.»

- Frontend: HTML, CSS, JavaScript / React
- Backend: Node.js, Express.js
- Database: MongoDB
- Version Control: Git & GitHub

📂 Project Structure

URLShortener/
├── frontend/
├── backend/
├── docs/
├── .env.example
├── README.md
└── LICENSE

⚙️ Getting Started

Clone the Repository

git clone https://github.com/Surajnpfr/URLShortener.git
cd URLShortener

Install Dependencies

npm install

Configure Environment Variables

Create a ".env" file:

PORT=5000
DATABASE_URL=your_database_url
BASE_URL=http://localhost:5000

Run the Application

npm run dev

📌 API Endpoints

Create Short URL

POST /api/shorten

Request:

{
  "url": "https://example.com/very/long/url"
}

Response:

{
  "shortUrl": "http://localhost:5000/abc123"
}

Redirect to Original URL

GET /:shortCode

## Auth0 setup (Regular Web Application)

This project uses the [Auth0 Express SDK](https://github.com/auth0/express-openid-connect) with **server-side sessions**. Users sign in with **email and password** on Auth0 Universal Login (enable the Database connection; disable Google/social if you only want email/password).

1. In Auth0 Dashboard → **Applications**, use a **Regular Web Application**.
   - **Token Endpoint Authentication Method:** `POST` (`client_secret_post`)
   - **Allowed Callback URLs:** `http://localhost:5000/callback`, `https://app.drovashop.com/callback`
   - **Allowed Logout URLs:** `http://localhost:5173`, `https://drovashop.com`, `https://www.drovashop.com`
2. Copy **Client ID** and **Client Secret** into `backend/.env` (never commit secrets).
3. Set backend env vars (see `backend/.env.example`):
   - `ISSUER_BASE_URL=https://nerdy.jp.auth0.com`
   - `CLIENT_ID`, `CLIENT_SECRET`, `SECRET`, `BASE_URL`, `FRONTEND_URL`
4. Generate a session secret: `openssl rand -hex 32` → `SECRET`
5. Set `VITE_API_URL` in `frontend/.env.production` for production builds
6. Ensure `ALLOWED_DASHBOARD_ORIGINS` includes the React app origin

### Auth routes (Express + Auth0 SDK)

- `GET /login` — start login (supports `?returnTo=` full frontend URL)
- `GET /signup` — start signup (`screen_hint=signup`)
- `GET /logout` — end session (supports `?returnTo=`)
- `GET /callback` — Auth0 OAuth callback (automatic)

### Protected API routes (session cookie)

- `GET /api/auth/me` — current user profile
- `PATCH /api/auth/me` — update display name
- `GET /api/urls`, `POST /api/shorten`, `DELETE /api/urls/:id`
- `GET /api/analytics/summary`, `GET /api/analytics/links/:urlId`

Public routes: `GET /go/:code`, `GET /api/resolve/:code`, `GET /api/status`

🎯 Roadmap

- [x] URL shortening service
- [x] Custom aliases
- [x] QR code generation
- [x] Click analytics
- [x] User authentication (Auth0 email/password)
- [x] Dashboard for link management
- [ ] Link expiration support
- [ ] Rate limiting and abuse protection

🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Push your branch
5. Open a Pull Request

📜 License

This project is licensed under the MIT License.

🌟 Support

If you like this project, consider starring the repository:

https://github.com/Surajnpfr/URLShortener