import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-green-900 text-green-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-2">Lanark Community Club</h3>
          <p className="text-sm text-green-300">
            Community events • Local projects • Lanark, Illinois
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Quick Links</h4>
          <ul className="space-y-1 text-sm text-green-300">
            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/events" className="hover:text-white transition-colors">Events</Link></li>
            <li><Link href="/projects" className="hover:text-white transition-colors">Projects</Link></li>
            <li><Link href="/coming-soon" className="hover:text-white transition-colors">Scholarships</Link></li>
            <li><Link href="/donate" className="hover:text-white transition-colors">Donate</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Contact</h4>
          <p className="text-sm text-green-300">
            Lanark, Illinois<br />
            <Link href="/coming-soon" className="hover:text-white transition-colors">Send us a message</Link>
          </p>
          <div className="flex gap-3 mt-3">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-green-300 hover:text-white text-sm transition-colors">Facebook</a>
          </div>
        </div>
      </div>
      <div className="border-t border-green-700 text-center text-xs text-green-400 py-3">
        © {year} Lanark Community Club. All rights reserved.
      </div>
    </footer>
  );
}
