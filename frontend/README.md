# Lost & Found Frontend

Beautiful, modern frontend for the Lost & Found Management System.

## 📁 Files Included

- **index.html** - Main HTML structure with all pages
- **styles.css** - Complete styling with gradient design and animations
- **app.js** - All JavaScript functionality and API integration

## 🎨 Features

### User Interface
- ✅ Modern gradient design (Purple/Blue theme)
- ✅ Fully responsive layout (Mobile, Tablet, Desktop)
- ✅ Smooth animations and transitions
- ✅ Card-based UI components
- ✅ Loading states and spinners
- ✅ Toast notifications

### Pages Included
1. **Home** - Search and browse all items
2. **Login** - User authentication
3. **Register** - New user registration
4. **Dashboard** - Statistics and recent items
5. **Add Item** - Post lost/found items
6. **My Items** - Manage your posted items
7. **Account** - Profile management and verification

### Functionality
- 🔐 User authentication (Login/Register/Logout)
- 📝 Post lost or found items
- 🔍 Search and filter items by type and category
- 📊 Dashboard with statistics
- 👤 User profile management
- 🔒 Password change
- ✉️ OTP email verification
- 📱 Real-time alerts and notifications
- 💾 Local storage for auth tokens

## 🚀 How to Use

### Option 1: Direct Usage
1. Copy all three files to a folder
2. Make sure your backend is running on `http://localhost:5000`
3. Open `index.html` in a web browser

### Option 2: With Live Server
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 3: With HTTP Server
```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx http-server -p 8080
```

Then visit: `http://localhost:8080`

## ⚙️ Configuration

### API URL
By default, the frontend connects to `http://localhost:5000/api`

To change this, edit line 1 in `app.js`:
```javascript
const API_URL = 'http://localhost:5000/api';
```

For production, change it to your backend URL:
```javascript
const API_URL = 'https://your-backend-domain.com/api';
```

## 🎨 Customization

### Colors
All colors are defined in CSS variables in `styles.css`:
```css
:root {
    --primary: #667eea;      /* Main purple */
    --secondary: #764ba2;    /* Secondary purple */
    --success: #28a745;      /* Green for success */
    --danger: #dc3545;       /* Red for danger */
    --warning: #ffc107;      /* Yellow for warnings */
    --info: #17a2b8;         /* Blue for info */
}
```

### Layout
- Maximum content width: `1200px`
- Grid columns adapt automatically based on screen size
- Breakpoint for mobile: `768px`

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## 🔧 Backend Requirements

The frontend expects these API endpoints:

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### Items
- `GET /api/items` - Get all items (with optional filters)
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create new item (requires auth)
- `PUT /api/items/:id` - Update item (requires auth)
- `DELETE /api/items/:id` - Delete item (requires auth)
- `GET /api/my-items` - Get user's items (requires auth)

### Profile
- `GET /api/profile` - Get user profile (requires auth)
- `PUT /api/profile` - Update profile (requires auth)

### Verification
- `POST /api/send-otp` - Send OTP to email
- `POST /api/verify-otp` - Verify OTP code

### Stats
- `GET /api/stats` - Get system statistics

## 📸 Screenshots

The application includes:
- Beautiful hero section with gradient background
- Interactive item cards with hover effects
- Clean forms with validation
- Modal dialogs for item details
- Toast notifications for user feedback
- Responsive navigation

## 🐛 Troubleshooting

### Items not loading
- Check if backend is running on `http://localhost:5000`
- Open browser console (F12) to see error messages
- Verify API_URL in `app.js` matches your backend URL

### CORS errors
- Make sure your backend has CORS enabled
- Backend should allow requests from your frontend origin

### Login not working
- Check browser console for errors
- Verify backend authentication endpoints are working
- Clear localStorage: `localStorage.clear()` in browser console

## 📄 License

Free to use for personal and commercial projects.

## 🤝 Support

For issues or questions, please check:
1. Browser console for error messages
2. Network tab to see API requests/responses
3. Backend logs for server-side errors

---

**Made with ❤️ for Lost & Found Management**
