import AppHeader from "@/components/layout/app-header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-dvh overflow-y-auto lg:overflow-hidden">
      <AppHeader />
      <div className="flex flex-col lg:overflow-auto overflow-x-hidden transition-[margin-top,height] duration-200 ease-out mt-15 lg:h-[calc(100dvh-var(--spacing)*10)]">
        {children}
      </div>
    </div>
  );
}
