import AppHeader from "@/components/layout/app-header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col h-dvh overflow-hidden">
      <AppHeader />
      <div className="absolute inset-0 z-0">{children}</div>
    </div>
  );
}
