export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#D4AF37] mb-4">404</h1>
        <p className="text-gray-400">Page non trouvée</p>
        <a 
          href="/" 
          className="inline-block mt-6 px-6 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#B8860B] transition-colors"
        >
          Retour au Dashboard
        </a>
      </div>
    </div>
  );
}
