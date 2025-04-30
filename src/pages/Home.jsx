export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-48px)]">
      <div className="relative w-[400px] h-[300px]">
        <img src="/truck-logo.png" alt="Logística ACME" className="w-full h-full object-contain" />
      </div>
      <h1 className="text-5xl font-bold text-green-700 mt-4">LOGÍSTICA ACME</h1>
      <p className="text-xl text-gray-600 uppercase tracking-wider mt-2">Movemos el mundo por ti</p>
    </div>
  )
}
