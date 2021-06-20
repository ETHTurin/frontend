import Link from "next/link";

export default function Home() {
  return (
    <main className="h-screen w-screen flex flex-col items-center justify-center space-y-8">
      <h1 className="text-6xl">CMO Demo!</h1>
      <Link href="/registerCopyright">
        <a className="p-4 bg-purple-800 text-white">Lessgoooo</a>
      </Link>
    </main>
  );
}
