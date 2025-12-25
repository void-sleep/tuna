import { cn } from "@/lib/utils";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <div className={cn("relative min-h-[calc(100vh-4rem)]", className)}>
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Top gradient */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand/5 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  badge?: string;
}

export function PageHeader({ title, description, children, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
      <div>
        {badge && (
          <span className="inline-block px-3 py-1 mb-4 text-sm font-medium bg-brand/10 text-brand rounded-full">
            {badge}
          </span>
        )}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-lg text-muted-foreground mt-2">{description}</p>
        )}
      </div>
      {children && <div className="flex-shrink-0">{children}</div>}
    </div>
  );
}

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'narrow' | 'wide';
}

export function PageContent({ children, className, size = 'default' }: PageContentProps) {
  const maxWidthClass = {
    narrow: 'max-w-4xl',
    default: 'max-w-7xl',
    wide: 'max-w-[1400px]',
  }[size];

  return (
    <div className={cn("w-full mx-auto px-4 md:px-8 py-8", maxWidthClass, className)}>
      {children}
    </div>
  );
}
