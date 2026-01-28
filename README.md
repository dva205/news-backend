# News Backend API

A comprehensive Node.js/Express backend API for a news platform designed for children and their parents. This API provides features including article management, user authentication, child activity tracking, text-to-speech functionality, and parental controls.

## 🚀 Features

- **Multi-Role Authentication**: Separate authentication flows for parents and children
- **Article Management**: CRUD operations for articles with categories and tags
- **Parental Controls**: Parents can manage child profiles and set reading time limits
- **Child Activity Tracking**: Monitor reading streaks, saved articles, and activity history
- **Text-to-Speech**: Convert articles to audio for accessibility
- **Automated Content Crawling**: Scheduled cron jobs for article collection
- **Public API**: Public endpoints for guest access
- **Swagger Documentation**: Interactive API documentation available at `/api-docs`

## 📋 Prerequisites

- **Node.js**: v14 or higher
- **MySQL**: v8 or higher
- **npm** or **yarn**

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/news-backend.git
   cd news-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example environment file and configure it with your credentials:

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:

   ```env
   PORT=5000
   NODE_ENV=development

   # JWT Secret
   ACCESS_TOKEN_SECRET=your_secret_key_here

   # Supabase Configuration
   SUPABASE_URL=your_supabase_url
   SERVICE_ROLE=your_service_role_key
   BUCKET=your_bucket_name

   # Cloudinary Configuration
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   CLOUD_NAME=your_cloud_name

   # VoiceRSS API (Text-to-Speech)
   VOICERSS_API_KEY=your_voicerss_api_key
   ```

4. **Set up the database**

   ```bash
   # Run migrations
   npx sequelize-cli db:migrate

   # (Optional) Run seeders
   npx sequelize-cli db:seed:all
   ```

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:5000` with hot-reload enabled.

### Production Mode

```bash
npm start
```

## 📚 API Documentation

Once the server is running, access the interactive Swagger documentation at:

```
http://localhost:5000/api-docs
```

## 🔑 API Endpoints

### Parent Routes

- `POST /parent/auth/register` - Register a new parent account
- `POST /parent/auth/login` - Parent login
- `POST /parent/auth/logout` - Parent logout
- `GET /parent/child` - Get all children for a parent
- `POST /parent/child` - Create a child profile
- `PUT /parent/child/:id` - Update child profile
- `DELETE /parent/child/:id` - Delete child profile

### Child Routes

- `POST /child/auth/login` - Child login
- `POST /child/auth/logout` - Child logout
- `GET /child/articles` - Get articles for child (with time-based restrictions)
- `GET /child/articles/:id` - Get article details
- `POST /child/articles/:id/save` - Save/bookmark an article
- `GET /child/activity/streak` - Get reading streak
- `POST /child/activity/streak` - Update reading streak
- `POST /child/tts` - Convert article text to speech

### Public Routes

- `GET /public/articles` - Get public articles (no authentication required)
- `GET /public/articles/:id` - Get public article details
- `POST /public/auth/guest` - Create guest session

## 🏗️ Project Structure

```
news-backend/
├── src/
│   ├── config/          # Database and third-party service configurations
│   ├── controllers/     # Request handlers
│   ├── cron/           # Scheduled jobs (article crawling)
│   ├── helpers/        # Utility functions
│   ├── middlewares/    # Authentication, authorization, and validation
│   ├── migrations/     # Database migrations
│   ├── models/         # Sequelize models
│   ├── routes/         # API route definitions
│   ├── seeders/        # Database seeders
│   ├── services/       # Business logic
│   ├── utils/          # Shared utilities
│   ├── server.js       # Application entry point
│   └── swagger.json    # Swagger API documentation
├── docs/               # Architecture and sequence diagrams
├── .env.example        # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🔒 Security Features

- **JWT Authentication**: Token-based authentication for secure API access
- **Cookie-based Sessions**: HTTP-only cookies for enhanced security
- **Bcrypt Password Hashing**: Secure password storage
- **Role-based Access Control**: Separate permissions for parents and children
- **Time-based Access Control**: Parental controls for limiting child reading time
- **Environment Variables**: Sensitive credentials stored securely in `.env`

## 🧰 Technologies Used

- **Node.js & Express**: Backend framework
- **Sequelize**: ORM for MySQL database
- **MySQL**: Relational database
- **JWT**: Authentication tokens
- **Bcrypt**: Password hashing
- **Supabase**: File storage (images, media)
- **Cloudinary**: Image optimization and delivery
- **VoiceRSS**: Text-to-speech conversion
- **Swagger**: API documentation
- **node-cron**: Scheduled tasks
- **Babel**: ES6+ transpilation

## 🧪 Available Scripts

- `npm run dev` - Start development server with hot-reload
- `npm start` - Start production server
- `npm run format` - Format code with Prettier

## 📝 Environment Variables

| Variable                | Description                          | Required |
| ----------------------- | ------------------------------------ | -------- |
| `PORT`                  | Server port number                   | Yes      |
| `NODE_ENV`              | Environment (development/production) | Yes      |
| `ACCESS_TOKEN_SECRET`   | JWT secret key                       | Yes      |
| `SUPABASE_URL`          | Supabase project URL                 | Yes      |
| `SERVICE_ROLE`          | Supabase service role key            | Yes      |
| `BUCKET`                | Supabase storage bucket name         | Yes      |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                   | Yes      |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                | Yes      |
| `CLOUD_NAME`            | Cloudinary cloud name                | Yes      |
| `VOICERSS_API_KEY`      | VoiceRSS API key for TTS             | Yes      |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Đinh Việt Anh

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Note**: Make sure to never commit your `.env` file to version control as it contains sensitive credentials.
