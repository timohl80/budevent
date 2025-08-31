import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 });
    }

    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
    }

    // Call Google Geocoding API from server-side with better address handling
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address + ', Sweden')}&key=${process.env.GOOGLE_MAPS_API_KEY}&components=country:SE&language=sv`;
    
    const response = await fetch(geocodingUrl);
    const data = await response.json();

    console.log('Google Geocoding API response:', {
      status: data.status,
      resultsCount: data.results?.length || 0,
      errorMessage: data.error_message,
      address: address
    });

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      const location = result.geometry.location;
      
      // Extract different address components
      const addressComponents = result.address_components;
      let streetNumber = '';
      let route = '';
      let locality = '';
      let administrativeArea = '';
      let postalCode = '';
      
      addressComponents.forEach((component: any) => {
        if (component.types.includes('street_number')) {
          streetNumber = component.long_name;
        } else if (component.types.includes('route')) {
          route = component.long_name;
        } else if (component.types.includes('locality')) {
          locality = component.long_name;
        } else if (component.types.includes('administrative_area_level_1')) {
          administrativeArea = component.long_name;
        } else if (component.types.includes('postal_code')) {
          postalCode = component.long_name;
        }
      });
      
      // Build a clean address string
      const cleanAddress = [streetNumber, route, locality, administrativeArea, postalCode]
        .filter(Boolean)
        .join(', ');
      
      const responseData = {
        success: true,
        coordinates: {
          lat: location.lat,
          lng: location.lng,
          formattedAddress: result.formatted_address,
          cleanAddress: cleanAddress || result.formatted_address
        }
      };
      
      console.log('Geocoding successful:', responseData);
      
      return NextResponse.json(responseData);
    } else {
      return NextResponse.json({
        success: false,
        error: data.error_message || `Geocoding failed: ${data.status}`,
        status: data.status
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Geocoding API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
