import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/split-bill/header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-8">
      <Header />
      <main className="max-w-7xl mx-auto px-4 mt-4">
        <div className="text-center space-y-6 py-16">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-pink-500 to-yellow-500">
            Transaction Not Found
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            We couldn&apos;t find the transaction you&apos;re looking for. It may have
            been deleted or the link might be incorrect.
          </p>
          <div className="pt-4">
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-6 py-3 transition-all duration-200">
                <Home className="h-5 w-5 mr-2" />
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
