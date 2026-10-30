# Family Tree with MongoDB

A **Family Tree (Shajra) website** with **MongoDB backend** support. Now you can save your family data in a real database!

## Features

✅ **MongoDB Backend** - All data saved in MongoDB database
✅ **REST API** - Full CRUD operations via API
✅ **Offline Fallback** - Works even if server is down (uses cached data)
✅ **Admin Panel** - Add, delete, import/export family members
✅ **Responsive Design** - Works on mobile and desktop
✅ **Urdu Support** - Full Urdu language support

---

## Quick Start

### Option 1: Local Development (Recommended)

1. **Install MongoDB**
   - Download from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
   - Or use MongoDB Atlas (cloud): [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)

2. **Install Node.js**
   - Download from [https://nodejs.org/](https://nodejs.org/)
   - Version 18+ recommended

3. **Setup Project**
   ```bash
   # Clone or navigate to project folder
   cd family123
   
   # Install dependencies
   npm install
   
   # Create .env file (copy from .env.example)
   cp .env.example .env
   
   # Edit .env file with your MongoDB connection string
   nano .env  # or use any text editor
   ```

4. **Edit .env file**
   ```env
   # For local MongoDB
   MONGODB_URI=mongodb://localhost:27017/family_tree
   
   # For MongoDB Atlas (cloud)
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/family_tree?retryWrites=true&w=majority
   
   PORT=3000
   ADMIN_PASSWORD=1234
   CORS_ORIGIN=http://localhost:3001
   ```

5. **Start Server**
   ```bash
   npm start
   ```
   
   Server will start at `http://localhost:3000`

6. **Open Website**
   - Open `index.html` in your browser
   - Or serve it with a web server:
     ```bash
     # Install http-server globally
     npm install -g http-server
     
     # Start web server on port 3001
     http-server -p 3001
     ```
   - Open `http://localhost:3001` in browser

---

### Option 2: Production Setup

1. **Deploy Node.js server** (to Heroku, Render, Railway, etc.)
2. **Update API_BASE in common.js**
   ```javascript
   // Change this line in common.js
   const API_BASE = 'https://your-server-url/api';
   ```
3. **Update CORS_ORIGIN in .env**
   ```env
   CORS_ORIGIN=https://your-website-domain.com
   ```

---

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/members` | Get all family members | No |
| GET | `/api/members/:id` | Get single member | No |
| POST | `/api/members` | Add new member | Yes |
| PUT | `/api/members/:id` | Update member | Yes |
| DELETE | `/api/members/:id` | Delete member | Yes |
| POST | `/api/members/import` | Import all data | Yes |
| GET | `/api/stats` | Get statistics | No |
| GET | `/api/health` | Health check | No |

---

## Authentication

All write operations (POST, PUT, DELETE) require the admin password in the header:

```javascript
headers: {
  'x-admin-password': '1234'  // Default password
}
```

You can change the password in `.env` file:
```env
ADMIN_PASSWORD=your_new_password
```

---

## Data Structure

Each family member has this structure:

```json
{
  "id": 123,
  "name": "Ahmad",
  "father": 1,  // ID of father, null for root members
  "gender": "M"  // "M" for Male, "F" for Female
}
```

---

## Project Structure

```
family123/
├── server.js           # Node.js/Express backend
├── package.json        # Node.js dependencies
├── .env.example        # Environment variables template
├── common.js           # Frontend API functions
├── index.html          # Main family tree page
├── admin.html          # Admin panel
├── stats.html          # Statistics page
├── about.html          # About page
├── style.css           # Styles
└── README.md           # This file
```

---

## Development

For development with auto-restart:

```bash
npm install -g nodemon  # Install nodemon globally
npm run dev             # Start with auto-restart on file changes
```

---

## Troubleshooting

### MongoDB Connection Issues

1. **Check if MongoDB is running**
   ```bash
   mongod --version
   ```

2. **Check connection**
   ```bash
   mongo --eval "db.runCommand({ping: 1})"
   ```

3. **Enable MongoDB service** (Windows)
   ```bash
   net start MongoDB
   ```

4. **Enable MongoDB service** (Linux/Mac)
   ```bash
   sudo systemctl start mongod
   ```

### Server Not Starting

1. Check if port is available
2. Check `.env` file exists and has correct values
3. Run with debug:
   ```bash
   node server.js
   ```

---

## License

MIT License - Free to use and modify!

---

## Credits

- **Frontend**: Original family tree HTML/JS
- **Backend**: Node.js + Express + MongoDB
- **Icons**: Unicode emojis
- **Fonts**: Google Fonts (Noto Nastaliq Urdu)
