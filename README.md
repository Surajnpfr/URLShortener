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

## Authentication (email + password)

Session-based auth with `express-session` and `bcryptjs`. No third-party OAuth required.

1. Copy `backend/.env.example` → `backend/.env`
2. Set `SECRET` — generate with: `openssl rand -hex 32`
3. Set `DATABASE_URL`, `BASE_URL`, `FRONTEND_URL`, and CORS origins (see `backend/.env.example`)
4. For production frontend builds, copy `frontend/.env.production.example` → `frontend/.env.production` and set `VITE_API_URL`

### Auth API routes

- `POST /api/auth/register` — create account
- `POST /api/auth/login` — sign in (sets session cookie)
- `POST /api/auth/logout` — sign out
- `GET /api/auth/me` — current user profile
- `PATCH /api/auth/me` — update display name

### Protected API routes (session cookie)

- `GET /api/urls`, `POST /api/shorten`, `DELETE /api/urls/:id`
- `GET /api/analytics/summary`, `GET /api/analytics/links/:urlId`

Public routes: `GET /go/:code`, `GET /api/resolve/:code`, `GET /api/status`

Frontend login UI: `/login` and `/register`

🎯 Roadmap

- [x] URL shortening service
- [x] Custom aliases
- [x] QR code generation
- [x] Click analytics
- [x] User authentication (email / password sessions)
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