import { DemoShell } from "../demo-shell";

export default function DemoAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DemoShell>{children}</DemoShell>;
}
