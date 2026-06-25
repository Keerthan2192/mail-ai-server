# AI Email Generator - Backend

A robust, production-ready Express.js backend API for AI-powered email generation with MySQL persistence. This backend serves as the core engine for the AI Email Generator application, handling email generation, storage, and retrieval.

## 🛠️ Tech Stack

### Core Framework
- **Node.js** - JavaScript runtime
- **Express.js 4.21.2** - Web application framework
- **ES Modules** - Modern JavaScript module system

### AI Integration
- **OpenAI SDK 4.104.0** - Official OpenAI API client
- **OpenAI-compatible APIs** - Supports OpenRouter and other providers

### Database
- **MySQL 2** - MySQL database driver with promise support
- **Connection Pooling** - Efficient database connection management

### Validation & Security
- **Zod 3.25.28** - Runtime type validation and schema parsing
- **CORS 2.8.5** - Cross-Origin Resource Sharing middleware
- **dotenv 16.4.7** - Environment variable management

### Development Tools
- **Windsurf AI Assistant** - AI-powered development assistant used for code generation, debugging, and API design

## 🚀 Features

### API Endpoints
- **Health Check**: `GET /health` - Simple health endpoint
- **Get History**: `GET /api/v1/emails/history` - Retrieve 10 most recent generated emails
- **Generate Email**: `POST /api/v1/emails/generate` - Generate new email with AI
- **Clear History**: `DELETE /api/v1/emails/history` - Delete all email history

### AI Email Generation
- **Multiple Tones**: Professional, Friendly, Formal, Casual
- **Structured Output**: JSON response with subject and body
- **Error Handling**: Comprehensive error handling for AI provider issues
- **Rate Limit Handling**: Graceful handling of rate limits
- **Authentication Errors**: Clear error messages for API key issues

### Database Features
- **Automatic Table Creation**: Creates `email_generations` table on first run
- **Connection Pooling**: Efficient database connection management
- **Indexes**: Optimized indexes on `created_at` and `tone` columns
- **Timestamp Tracking**: Automatic timestamp for generated emails

### Security & Validation
- **Input Validation**: Zod schema validation for all requests
- **CORS Protection**: Configured CORS for frontend origin
- **SQL Injection Prevention**: Parameterized queries
- **Error Sanitization**: Secure error responses

## 📁 Project Structure

```
ai_mail_generator_server/
├── src/
│   ├── config.js           # Configuration and environment variables
│   ├── db.js               # Database connection and table management
│   ├── email-service.js    # AI email generation service
│   └── server.js           # Express server and API routes
├── .env                    # Environment variables (not in git)
├── .env.example            # Environment variables template
└── package.json            # Dependencies and scripts
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 20+ installed
- MySQL 8.0+ installed and running
- npm or yarn package manager

### Installation

1. **Navigate to the server directory:**
   ```bash
   cd ai_mail_generator_server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env
   
   # Or manually create .env with the variables below
   ```

4. **Configure environment variables:**
   
   Edit `.env` and set:
   ```env
   # Server Configuration
   PORT=8000
   FRONTEND_ORIGIN=http://localhost:3000
   
   # AI Provider Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4.1-mini
   OPENAI_BASE_URL=https://openrouter.ai/api/v1
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=rukkon
   DB_USER=root
   DB_PASSWORD=your_db_password
   ```

5. **Create MySQL database:**
   ```sql
   CREATE DATABASE rukkon;
   ```

   The table will be automatically created on first run.

### Running the Application

**Development mode with auto-reload:**
```bash
npm run dev
```
The server will be available at [http://localhost:8000](http://localhost:8000)

**Production mode:**
```bash
npm start
```

## 📊 Database Schema

### `email_generations` Table

| Column | Type | Description |
| --- | --- | --- |
| `id` | INT | Primary key, auto-increment |
| `prompt` | TEXT | User's email prompt |
| `tone` | VARCHAR(50) | Selected tone (Professional, Friendly, Formal, Casual) |
| `subject` | TEXT | AI-generated email subject |
| `body` | TEXT | AI-generated email body |
| `model` | VARCHAR(120) | AI model used for generation |
| `created_at` | TIMESTAMP | Creation timestamp (auto-generated) |

### Indexes
- **Primary Key**: `id`
- **Created At Index**: `idx_email_generations_created_at` (DESC)
- **Tone Index**: `idx_email_generations_tone`

## 🔌 API Documentation

### `GET /health`

Health check endpoint to verify server status.

**Response:**
```json
{
  "status": "ok"
}
```

### `GET /api/v1/emails/history`

Retrieves the 10 most recently generated emails.

**Response:**
```json
[
  {
    "id": 1,
    "prompt": "Write a follow-up email after an interview",
    "tone": "Professional",
    "subject": "Thank You for the Interview",
    "body": "Dear Hiring Manager,\n\nThank you for the opportunity...",
    "model": "gpt-4.1-mini",
    "generatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### `POST /api/v1/emails/generate`

Generates a new email using AI and saves it to the database.

**Request Body:**
```json
{
  "prompt": "Write a follow-up email after an interview",
  "tone": "Professional"
}
```

**Validation Rules:**
- `prompt`: Minimum 8 characters, trimmed
- `tone`: Must be one of "Professional", "Friendly", "Formal", "Casual"

**Response:**
```json
{
  "id": 1,
  "prompt": "Write a follow-up email after an interview",
  "tone": "Professional",
  "subject": "Thank You for the Interview",
  "body": "Dear Hiring Manager,\n\nThank you for the opportunity...",
  "model": "gpt-4.1-mini",
  "generatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**

- **400 Bad Request** - Invalid input:
  ```json
  {
    "error": "Please provide a more specific prompt."
  }
  ```

- **401 Unauthorized** - Invalid API key:
  ```json
  {
    "error": "Authentication failed. Check your backend API key."
  }
  ```

- **402 Payment Required** - Credit/token limit:
  ```json
  {
    "error": "The AI provider rejected the request due to account credit or token limits."
  }
  ```

- **429 Too Many Requests** - Rate limit:
  ```json
  {
    "error": "Rate limit reached. Please try again shortly."
  }
  ```

- **500 Internal Server Error** - Server error:
  ```json
  {
    "error": "Unexpected server error while generating the email."
  }
  ```

### `DELETE /api/v1/emails/history`

Deletes all email history from the database.

**Response:**
```json
{
  "success": true
}
```

**Error Response:**
```json
{
  "error": "Unable to clear email history right now."
}
```

## 🔐 Security Features

### CORS Configuration
CORS is configured to only allow requests from the specified frontend origin:
```javascript
cors({
  origin: config.frontendOrigin
})
```

### Input Validation
All incoming requests are validated using Zod schemas:
- Prompt length and content validation
- Tone enum validation
- Automatic error responses for invalid inputs

### Database Security
- **Parameterized Queries**: Prevents SQL injection attacks
- **Connection Pooling**: Limits database connections
- **Least Privilege**: Database user should have only necessary permissions

### Error Handling
- **Sanitized Error Messages**: Sensitive information not exposed
- **Structured Error Responses**: Consistent error format
- **AI Provider Errors**: Specific handling for different error types

## 🚀 Deployment
- Deployed in AWS EC2 instance

### PM2 Process Manager

PM2 is used to manage the Node.js process in production:


## 📝 Development Notes

### Key Implementation Details
- **ES Modules**: Uses modern ES6 module syntax with `import/export`
- **Connection Pooling**: MySQL connection pool for efficient database access
- **Automatic Table Creation**: Database schema created automatically on first run
- **Structured AI Responses**: JSON mode for consistent AI output
- **Comprehensive Error Handling**: Specific error messages for different failure scenarios

### AI Assistant Usage
This project was developed with assistance from **Windsurf AI**, which helped with:
- API design and endpoint structure
- Database schema optimization
- Error handling patterns
- Security best practices
- Code refactoring and optimization

### Configuration
All configuration is managed through environment variables using dotenv. Never commit `.env` files to version control.

## 🔄 Database Migration

If you need to modify the database schema:

1. Update the `ensureTable` function in `src/db.js`
2. Restart the application
3. The table will be updated automatically

For production migrations, consider using a migration tool like Knex.js or Flyway.

## 📄 License

This project is part of the AI Email Generator assignment.

## 🤝 Contributing

This is an assignment project. For improvements or issues, please contact the development team.

---

**Deployed in AWS EC2 instance**

**Built with ❤️ using Node.js, Express, MySQL, and Windsurf AI**
