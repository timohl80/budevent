import Link from "next/link";

export default function Home() {
  return (
    <main className="space-y-4 py-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-[#2D3436]">
          Welcome to BudEvent 👋
        </h1>
        <p className="text-lg text-[#2D3436] max-w-2xl mx-auto opacity-80">
          Discover and join amazing events in your area. From concerts and workshops to meetups and conferences, find your next adventure with BudEvent.
        </p>
      </div>
      
      <div className="text-center">
        <Link
          href="/events"
          className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-[#A29BFE] rounded-lg hover:bg-[#8B7FD8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A29BFE] transition-colors"
        >
          View events
        </Link>
      </div>
    </main>
  );
}
