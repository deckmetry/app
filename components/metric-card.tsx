import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface MetricCardProps {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  accentColor?: string;
}

export function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  href,
  accentColor,
}: MetricCardProps) {
  const card = (
    <Card
      className={
        href
          ? "transition-all duration-200 hover:shadow-md hover:border-primary/30 cursor-pointer"
          : ""
      }
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{
            backgroundColor: accentColor
              ? `${accentColor}15`
              : "oklch(0.968 0.007 248)",
          }}
        >
          <Icon
            className="h-4 w-4"
            style={{ color: accentColor ?? "oklch(0.554 0.046 257)" }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {sub && (
          <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{card}</Link>;
  }

  return card;
}
