/**
 * Wraps printable document content in a real HTML table so that Chromium's
 * print engine repeats the 0.5in top/bottom spacing on every page — even
 * when the browser is set to "No margins".
 *
 * Why real <table>/<thead>/<tfoot>: Chromium only honours the per-page
 * repeat behaviour for semantic table elements; div + display:table-header-group
 * does not trigger the repeat in the PDF print engine.
 *
 * On screen, CSS in globals.css resets the table to a plain block and hides
 * the spacer rows so the layout is identical to a normal div wrapper.
 */
export function PrintMarginWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <table
      className={`pm-table mx-auto max-w-5xl${className ? ` ${className}` : ""}`}
    >
      {/* Repeating top-margin spacer on every printed page */}
      <thead>
        <tr>
          <td />
        </tr>
      </thead>

      {/* Document content */}
      <tbody>
        <tr>
          <td>{children}</td>
        </tr>
      </tbody>

      {/* Repeating bottom-margin spacer on every printed page */}
      <tfoot>
        <tr>
          <td />
        </tr>
      </tfoot>
    </table>
  );
}
