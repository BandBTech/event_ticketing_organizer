import Header from "@/components/header";
import Footer from "@/components/footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Auth Header */}
      <Header />
      {/* Main Auth Content */}
      <main className="flex-1 flex items-center justify-center">{children}</main>
      {/* Auth Footer */}
      <Footer />
    </div>
  );
}
