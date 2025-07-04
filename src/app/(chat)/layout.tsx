import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SidebarInset>
        <div className="flex flex-col gap-4 h-full">
          <div className="">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
