import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

interface AdminHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export default function AdminHeader({ title, children }: AdminHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border/50 px-6">
      <SidebarTrigger className="-ml-2" />
      <Separator orientation="vertical" className="h-6" />
      <h1 className="text-lg font-semibold">{title}</h1>
      {children && <div className="ml-auto flex items-center gap-2">{children}</div>}
    </header>
  );
}
