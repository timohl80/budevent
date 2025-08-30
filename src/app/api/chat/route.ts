import { NextRequest, NextResponse } from 'next/server';

// BudEvent company knowledge base for the AI
const BUDEVENT_KNOWLEDGE = `
You are a helpful AI assistant for BudEvent, an event management platform. Here's what you know about BudEvent:

COMPANY INFORMATION:
- BudEvent is a modern event management platform that helps people create, discover, and join events
- The platform allows users to create events, RSVP to events, and manage event details
- Users can upload images for their events and share events with others
- The platform supports both local user accounts and Google OAuth authentication

FEATURES:
- Event Creation: Users can create events with title, description, date/time, location, and capacity
- RSVP System: Users can RSVP to events with statuses like "going", "maybe", or "not going"
- Image Upload: Event organizers can upload images for their events
- Search & Filter: Users can search events and sort them by date, title, or location
- User Management: Admin approval system for new user registrations
- Email Notifications: RSVP confirmations and user approval notifications

POLICIES:
- User Registration: New users require admin approval before they can access the platform
- Event Guidelines: Events should be appropriate and follow community guidelines
- Privacy: User data is protected and handled according to privacy policies
- Terms of Service: Users must agree to terms when creating accounts

TECHNICAL DETAILS:
- Built with Next.js 15, React, TypeScript, and Tailwind CSS
- Uses Supabase for database and authentication
- Integrates with Google OAuth for social login
- Resend for email services
- OpenAI integration for this AI assistant

INFORMATION PAGES:
- About BudEvent: Company mission, vision, and team information
- Privacy Policy: How user data is protected and handled
- Terms of Service: Platform usage terms and conditions
- Event Guidelines: Best practices for creating and managing events
- FAQ: Frequently asked questions and answers

When answering questions:
1. Be helpful, friendly, and professional
2. Provide accurate information based on the knowledge above
3. If someone asks about specific policies or features, mention the relevant information page
4. Suggest they visit the appropriate page for more detailed information
5. Keep responses concise but informative
6. If you don't know something, suggest they check the information pages or contact support

Remember: You're here to help users understand BudEvent better and guide them to the right information!
`;

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    const openaiApiKey = process.env.OPENAI_API_KEY;
    console.log('OpenAI API Key exists:', !!openaiApiKey);
    console.log('OpenAI API Key length:', openaiApiKey ? openaiApiKey.length : 0);
    
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    // Prepare conversation for OpenAI
    const messages = [
      {
        role: 'system',
        content: BUDEVENT_KNOWLEDGE
      },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      {
        role: 'user',
        content: message
      }
    ];

    // Call OpenAI API
    console.log('Calling OpenAI API with message:', message);
    console.log('Messages being sent:', JSON.stringify(messages, null, 2));
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        stream: false,
      }),
    });

    console.log('OpenAI API response status:', response.status);
    console.log('OpenAI API response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      console.error('OpenAI API response status:', response.status);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI API response data:', JSON.stringify(data, null, 2));
    
    const aiResponse = data.choices?.[0]?.message?.content;
    console.log('Extracted AI response:', aiResponse);

    if (!aiResponse) {
      console.error('No AI response in data:', data);
      throw new Error('No response from OpenAI');
    }

    // Add relevant page links if the response mentions specific topics
    let enhancedResponse = aiResponse;
    
    if (aiResponse.toLowerCase().includes('privacy') || aiResponse.toLowerCase().includes('data protection')) {
      enhancedResponse += '\n\n📖 **Learn More:** [Privacy Policy](/info/privacy)';
    }
    
    if (aiResponse.toLowerCase().includes('terms') || aiResponse.toLowerCase().includes('conditions')) {
      enhancedResponse += '\n\n📖 **Learn More:** [Terms of Service](/info/terms)';
    }
    
    if (aiResponse.toLowerCase().includes('guidelines') || aiResponse.toLowerCase().includes('rules')) {
      enhancedResponse += '\n\n📖 **Learn More:** [Event Guidelines](/info/guidelines)';
    }
    
    if (aiResponse.toLowerCase().includes('faq') || aiResponse.toLowerCase().includes('frequently asked')) {
      enhancedResponse += '\n\n📖 **Learn More:** [FAQ](/info/faq)';
    }

    return NextResponse.json({
      response: enhancedResponse,
      model: data.model,
      usage: data.usage
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get AI response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
