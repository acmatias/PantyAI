# Pantry Capture - AI-Powered Inventory

A React application that uses Google Cloud Vision AI to automatically identify pantry items from photos.

## Features

- 📷 **Camera Integration**: Capture photos of pantry items using device camera
- 🤖 **AI Recognition**: Google Cloud Vision API automatically identifies food items
- ✏️ **Manual Editing**: Edit, add, or remove detected items
- 📊 **Confidence Scores**: View AI confidence levels for each detection
- 🏷️ **Smart Categorization**: Automatic categorization of food items
- 📱 **Responsive Design**: Works on mobile and desktop devices

## Setup Instructions

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
3. Set up environment variables in Supabase Edge Functions:
   - Go to Edge Functions in your Supabase dashboard
   - Add `GOOGLE_CLOUD_VISION_API_KEY` with your Google Cloud API key

### 3. Environment Variables

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Deploy Edge Function

The `analyze-image` Edge Function needs to be deployed to Supabase. This function:
- Accepts base64 image data
- Calls Google Cloud Vision API
- Filters and categorizes food items
- Returns formatted pantry items

## How It Works

1. **Image Capture**: Users take a photo using their device camera
2. **AI Analysis**: The image is sent to Google Cloud Vision API via Supabase Edge Function
3. **Item Detection**: The API identifies objects and labels in the image
4. **Food Filtering**: Results are filtered to show only food-related items
5. **Categorization**: Items are automatically categorized (Fruit, Dairy, etc.)
6. **User Review**: Users can edit, add, or remove detected items
7. **Save**: Confirmed items are ready to be saved to the database

## Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **AI/ML**: Google Cloud Vision API
- **Backend**: Supabase Edge Functions
- **Deployment**: Netlify
- **Icons**: Lucide React

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

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