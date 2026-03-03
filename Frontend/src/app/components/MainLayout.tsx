import { ReactNode } from "react";
import { DesktopNavigation, MobileNavigation } from "./Navigation";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <DesktopNavigation />
      <main className="lg:ml-64 pb-20 lg:pb-0">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
      <MobileNavigation />
    </div>
  );
}
