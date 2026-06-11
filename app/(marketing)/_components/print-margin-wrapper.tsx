/**
 * Wraps printable document content in a CSS table structure so that
 * top/bottom margins repeat on every printed page — including when the
 * browser print dialog is set to "No margins". On screen it renders as
 * a normal block wrapper.
 *
 * How it works: CSS table thead/tfoot are the only layout primitives
 * that genuinely repeat at the top/bottom of each printed page. The
 * .pm-head/.pm-foot spacer rows are hidden on screen (display:none via
 * globals.css) and become table-header/footer-group in print media.
 */
export function PrintMarginWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`pm-table mx-auto max-w-5xl${className ? ` ${className}` : ""}`}>
      {/* Spacer row — repeats as top margin on every printed page */}
      <div className="pm-head">
        <div className="pm-row">
          <div className="pm-spacer" />
        </div>
      </div>

      {/* Document content */}
      <div className="pm-body">
        <div className="pm-row">
          <div className="pm-cell">{children}</div>
        </div>
      </div>

      {/* Spacer row — repeats as bottom margin on every printed page */}
      <div className="pm-foot">
        <div className="pm-row">
          <div className="pm-spacer" />
        </div>
      </div>
    </div>
  );
}
