import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-20 min-h-screen bg-grid-pattern bg-background flex flex-col justify-between">
      <div className="flex-1">
        <Navbar />
        <main className="max-w-7xl mx-auto p-8">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
