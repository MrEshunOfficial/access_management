// app/admin/template.tsx - Template for consistent admin layout
export default function AdminTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="animate-in fade-in duration-200">{children}</div>;
}
