# 🗺️ Google Maps Integration Setup for BudEvent

This guide will help you set up Google Maps integration to enhance your weather feature with precise coordinate validation and interactive maps.

## 🚀 Prerequisites

- ✅ Google Cloud Project (you already have this!)
- ✅ BudEvent project running locally

## 📋 Step-by-Step Setup

### 1. Enable Google Maps APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your existing project
3. Navigate to **APIs & Services** > **Library**
4. Search for and enable these APIs:
   - **Maps JavaScript API** - For interactive maps
   - **Geocoding API** - For address → coordinates conversion
   - **Places API** - For location search and autocomplete

### 2. Create API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the generated API key
4. **Important**: Click on the API key to configure restrictions:
   - **Application restrictions**: HTTP referrers (web sites)
   - **Website restrictions**: Add your domains:
     - `http://localhost:3000/*` (for development)
     - `https://yourdomain.com/*` (for production)

### 3. Install Dependencies

```bash
# Remove pnpm lock file if it exists
rm -f pnpm-lock.yaml

# Install Google Maps loader
npm install @googlemaps/js-api-loader

# Or if npm has issues, try:
npm cache clean --force
npm install @googlemaps/js-api-loader
```

### 4. Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 5. Test the Integration

1. Start your development server: `npm run dev`
2. Go to an event creation/edit page
3. Look for the enhanced weather forecast component
4. Try entering different Swedish locations:
   - `Stockholm`
   - `Göteborg`
   - `Vätö`
   - `Gävle`
   - Any other Swedish city/village

## 🎯 Features You'll Get

### ✅ **Enhanced Weather Accuracy**
- **Precise coordinates** instead of approximate city centers
- **Any Swedish location** - not just major cities
- **Better weather forecasts** for specific areas

### ✅ **Interactive Maps**
- **Visual location confirmation** - see exactly where events are
- **Click-to-select** locations on the map
- **Address validation** - prevent typos and invalid locations

### ✅ **Professional UX**
- **Location autocomplete** suggestions
- **Map preview** when creating events
- **Coordinate display** for technical users

## 🔧 How It Works

### **Location Input → Google Geocoding → SMHI Weather**

1. **User types**: "Vätö, Nynäshamn"
2. **Google Maps**: Finds exact coordinates (59.8333, 18.7167)
3. **Validation**: Confirms location is in Sweden
4. **SMHI API**: Gets precise weather forecast for those coordinates
5. **Result**: Much more accurate weather prediction!

## 🚨 Troubleshooting

### **"Google Maps API key not found"**
- Check `.env.local` has `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Restart your dev server after adding the key

### **"Location not found in Sweden"**
- Make sure the location exists in Sweden
- Try different spellings (e.g., "Göteborg" vs "Gothenburg")

### **Map not loading**
- Check browser console for errors
- Verify API key restrictions allow localhost
- Ensure all required APIs are enabled

### **npm install issues**
- Remove `pnpm-lock.yaml` if it exists
- Clear npm cache: `npm cache clean --force`
- Try: `npm install --legacy-peer-deps`

## 💰 Cost Considerations

- **Free tier**: $200/month credit
- **Typical usage**: 1,000-10,000 map loads/month
- **Cost**: Usually $0-50/month for small-medium apps
- **Monitor usage** in Google Cloud Console

## 🔒 Security Best Practices

- **Restrict API key** to your domain only
- **Set usage quotas** to prevent abuse
- **Monitor usage** regularly
- **Use environment variables** (never commit API keys)

## 🎉 Next Steps

Once Google Maps is working:

1. **Test with various Swedish locations**
2. **Verify weather accuracy** improves
3. **Consider adding** map display to event details pages
4. **Explore** additional Google Maps features (directions, nearby events)

## 📞 Need Help?

- Check browser console for error messages
- Verify all environment variables are set
- Ensure Google Cloud APIs are enabled
- Check API key restrictions and quotas

---

**🎯 Goal**: Transform your weather feature from basic city lookup to precise, map-based location selection with professional-grade accuracy!
