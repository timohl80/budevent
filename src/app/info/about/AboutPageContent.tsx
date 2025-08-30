'use client';

import Link from 'next/link';

export default function AboutPageContent() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#111827] to-[#1F2937]">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              About BudEvent
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Connecting people through meaningful events and experiences
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mission & Vision */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">
              To democratize event creation and discovery, making it easy for anyone to organize 
              meaningful gatherings and for communities to find events that matter to them. 
              We believe that real connections happen in real life, and technology should 
              facilitate, not replace, human interaction.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔮</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">
              A world where every community has a vibrant event culture, where people 
              can easily discover and participate in activities that enrich their lives, 
              and where event organizers have the tools they need to create memorable 
              experiences for their audiences.
            </p>
          </div>
        </div>

        {/* Company Story */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Our Story</h2>
          <div className="prose prose-lg prose-invert max-w-none">
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              BudEvent was founded in 2024 by a team of event enthusiasts and technology 
              professionals who recognized that existing event platforms were either too 
              complex, too expensive, or too focused on large-scale events. We saw an 
              opportunity to create something different – a platform that would serve 
              the needs of local communities, small businesses, and individual organizers.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              What started as a simple idea has grown into a comprehensive platform that 
              serves thousands of users across Sweden and beyond. Our commitment to 
              simplicity, affordability, and community focus has remained constant, 
              even as we've added powerful features and expanded our reach.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              Today, BudEvent is more than just a platform – it's a community of 
              passionate event organizers and attendees who believe in the power of 
              bringing people together. We're proud of what we've built and excited 
              about the future we're creating together.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Community First</h3>
              <p className="text-gray-300">
                We believe that strong communities are built through meaningful interactions 
                and shared experiences. Every feature we build is designed with community 
                needs in mind.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">💡</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Innovation</h3>
              <p className="text-gray-300">
                We're constantly exploring new ways to make event creation and discovery 
                easier, more engaging, and more effective for our users.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Trust & Security</h3>
              <p className="text-gray-300">
                We take the security and privacy of our users seriously. Your data is 
                protected, and we're transparent about how we use it.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Meet Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👨‍💻</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Tim Ohlén</h3>
              <p className="text-blue-400 mb-2">Founder & CEO</p>
              <p className="text-gray-300 text-sm">
                Passionate about technology and community building. Leads our vision 
                and product strategy.
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👩‍🎨</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Sarah Chen</h3>
              <p className="text-blue-400 mb-2">Head of Design</p>
              <p className="text-gray-300 text-sm">
                Creates beautiful, intuitive user experiences that make event planning 
                a joy, not a chore.
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👨‍🔧</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Marcus Lindberg</h3>
              <p className="text-blue-400 mb-2">Lead Developer</p>
              <p className="text-gray-300 text-sm">
                Builds the robust, scalable technology that powers BudEvent's platform.
              </p>
            </div>
          </div>
        </div>

        {/* Contact & Back */}
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Get in Touch</h2>
            <p className="text-gray-300 mb-6">
              Have questions about BudEvent? Want to learn more about our platform? 
              We'd love to hear from you!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:hello@budevent.se"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Us
              </a>
              <Link
                href="/info"
                className="inline-flex items-center px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors border border-white/30"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Info Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
