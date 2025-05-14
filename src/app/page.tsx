import { Upload, ListChecks, Share2, Calculator, Edit3 } from "lucide-react";
import { BillInputOptions } from "@/components/bill-input-options";

export default function Home() {
  const features = [
    {
      icon: <Upload className="h-8 w-8 text-blue-500" />,
      title: "Upload or Snap a Receipt",
      description:
        "Easily upload a photo of your receipt or take a new one directly within the app.",
    },
    {
      icon: <ListChecks className="h-8 w-8 text-green-500" />,
      title: "Automatic Item Extraction",
      description:
        "Our AI vision technology powered by Llama Vision accurately extracts item names and prices from your receipt.",
    },
    {
      icon: <Share2 className="h-8 w-8 text-purple-500" />,
      title: "Instant Shareable Session",
      description:
        "A new session is created with the items, generating a unique, shareable URL (e.g., /split/[id]).",
    },
    {
      icon: <ListChecks className="h-8 w-8 text-yellow-500" />,
      title: "Collaborative Item Selection",
      description:
        "Users with the link can join (no auth needed!) and check off the items they consumed.",
    },
    {
      icon: <Calculator className="h-8 w-8 text-red-500" />,
      title: "Fair & Transparent Calculation",
      description:
        "The app calculates each person's subtotal and proportionally adds tip and tax for a clear breakdown.",
    },
    {
      icon: <Edit3 className="h-8 w-8 text-orange-500" />,
      title: "Manual Item Entry",
      description:
        "Prefer to type? Add items and prices one by one with our simple form for full control.",
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center p-4 md:p-8">
      <main className="container mx-auto max-w-4xl space-y-12 md:space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-pink-500 to-yellow-500">
            Split Bills, Not Friendships.
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            Effortlessly manage shared expenses. Upload a receipt, invite friends, and let us handle the math.
          </p>

          {/* Bill Input Options Section */}
          <BillInputOptions />
        </section>

        {/* Features Section */}
        <section className="space-y-10 md:space-y-12 py-12 md:py-16">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100">
              How It Works
            </h2>
            <p className="mt-3 text-md md:text-lg text-slate-400 max-w-xl mx-auto">
              A seamless experience from photo to fair split.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-800/70 p-6 rounded-xl shadow-lg border border-slate-700 hover:border-blue-600 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-slate-700 mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-50">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="text-center py-8 text-slate-500 border-t border-slate-700/50">
          <p>&copy; {new Date().getFullYear()} SplitEase. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
