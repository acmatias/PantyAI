# Pantry Capture - AI-Powered Inventory

A React application that uses Google Cloud Vision AI to automatically identify pantry items from photos.

## Features

- 📷 **Camera Integration**: Capture photos of pantry items using device camera
- 🤖 **AI Recognition**: Google Cloud Vision API automatically identifies food items
- ✏️ **Manual Editing**: Edit, add, or remove detected items
- 📊 **Confidence Scores**: View AI confidence levels for each detection
- 🏷️ **Smart Categorization**: Automatic categorization of food items
- 📱 **Responsive Design**: Works on mobile and desktop devices
- 🔐 **User Authentication**: Secure sign-up and sign-in with Supabase
- 💾 **Cloud Storage**: Save your pantry inventory to the cloud

## Live Demo

Visit the live application: [https://loquacious-kelpie-24c290.netlify.app](https://loquacious-kelpie-24c290.netlify.app)

## Local Development Setup

### Prerequisites

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Google Cloud Account** with Vision API enabled
- **Supabase Account** for database and authentication

### Installation

1. **Clone or download the project**
   ```bash
   # If you have git access to the repository
   git clone https://github.com/acmatias/PantyAI.git
   cd pantry-capture-app
   
   # Or download and extract the project files
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your actual values
   ```

4. **Configure your `.env` file**
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   
   # Google Cloud Vision API Key (set in Supabase Edge Function environment)
   GOOGLE_CLOUD_VISION_API_KEY=your-google-cloud-vision-api-key
   ```

### Running Locally

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open your browser**
   - Navigate to `http://localhost:5173`
   - The app will automatically reload when you make changes

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

### Development Notes

- **HTTPS Required**: Camera access requires HTTPS in production. The dev server runs on HTTP for localhost.
- **Mobile Testing**: Use your browser's device emulation or test on actual mobile devices for camera functionality.
- **Hot Reload**: Changes to React components will automatically refresh the browser during development.

## Project Setup (First Time)

### 1. Google Cloud Vision API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Vision API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Cloud Vision API"
   - Click "Enable"
4. Create an API key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Set up the database schema (tables are created automatically via migrations)
4. Deploy the Edge Function:
   - The `analyze-image` function in `supabase/functions/` needs to be deployed
   - Set `GOOGLE_CLOUD_VISION_API_KEY` in your Supabase Edge Functions environment
5. Enable authentication:
   - Go to Authentication > Settings
   - Configure sign-up settings as needed

### 3. Database Schema

The application uses these main tables:
- `user_profiles` - User account information
- `pantry_items` - Individual pantry items with AI confidence scores
- `products` - Master product catalog (if needed)
- `promotions` - Promotional offers (if needed)

Row Level Security (RLS) is enabled to ensure users can only access their own data.

## How It Works

1. **Image Capture**: Users take a photo using their device camera
2. **AI Analysis**: The image is sent to Google Cloud Vision API via Supabase Edge Function
3. **Item Detection**: The API identifies objects and labels in the image
4. **Food Filtering**: Results are filtered to show only food-related items
5. **Categorization**: Items are automatically categorized (Fruit, Dairy, etc.)
6. **User Review**: Users can edit, add, or remove detected items
7. **Save**: Confirmed items are saved to the user's pantry in Supabase

## Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Build Tool**: Vite
- **AI/ML**: Google Cloud Vision API
- **Backend**: Supabase (Database + Authentication + Edge Functions)
- **Deployment**: Netlify
- **Icons**: Lucide React

## API Integration

The app uses Supabase Edge Functions to securely call the Google Cloud Vision API. The edge function handles:

- Image processing and validation
- Google Cloud Vision API authentication
- Response filtering and formatting
- Error handling and fallbacks

## Supported Categories

The AI can detect and categorize items into:
- Fruits
- Vegetables  
- Dairy
- Meat
- Bakery
- Pantry staples
- Beverages
- Snacks
- Frozen items
- Canned goods

## Browser Compatibility

- Modern browsers with camera access support
- Mobile Safari, Chrome, Firefox
- Desktop Chrome, Firefox, Safari, Edge

## Troubleshooting

### Camera Issues
- Ensure browser has camera permissions
- Check if other apps are using the camera
- Try refreshing the page or restarting the browser
- Use HTTPS in production environments

### API Issues
- Verify Google Cloud Vision API key is set correctly
- Check Supabase environment variables
- Ensure Edge Function is deployed and running

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Update Node.js to the latest LTS version
- Check for TypeScript errors: `npm run lint`
