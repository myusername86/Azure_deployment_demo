# Login Application

A simple React login application with reusable components using Material-UI.

## Features

- Clean and modern login UI
- Reusable components (InputField, PrimaryButton)
- Form validation
- Responsive design
- Material-UI component library
- Docker support

## Project Structure

```
LOGIN/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── reusable/
│   │   │   │   ├── InputField.js      # Reusable text input component
│   │   │   │   └── PrimaryButton.js   # Reusable button component
│   │   │   └── LoginForm.js           # Login form component
│   │   ├── pages/
│   │   │   └── HomePage.js            # Home page with login screen
│   │   ├── App.js                     # Main app component
│   │   └── index.js                   # Entry point
│   ├── package.json
│   └── README.md
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Installation & Running

### Option 1: Using Docker (Recommended)

1. Build and run the application using Docker Compose:
```bash
docker-compose up
```

Or using Docker directly:
```bash
docker build -t login-app .
docker run -p 3000:3000 login-app
```

The application will be available at `http://localhost:3000`

To stop the container:
```bash
docker-compose down
```

### Option 2: Using npm (Local Installation)

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open in your browser at `http://localhost:3000`

## Components

### Reusable Components

1. **InputField** - A reusable text input component with:
   - Label and placeholder support
   - Error handling
   - Multiple input types (text, password, email, etc.)
   - Helper text display

2. **PrimaryButton** - A reusable button component with:
   - Customizable text
   - Multiple variants (contained, outlined, text)
   - Icon support
   - Disabled state

### Feature Components

- **LoginForm** - Complete login form with validation
- **HomePage** - Landing page displaying the login form

## Usage

The login form includes:
- User ID field
- Password field (minimum 6 characters)
- Form validation
- Success/error messages
