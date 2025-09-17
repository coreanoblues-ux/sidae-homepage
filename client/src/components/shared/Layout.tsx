import { Header } from "./Header";
import { ThemeProvider } from "./ThemeProvider";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>{children}</main>
      </div>
    </ThemeProvider>
  );
}
