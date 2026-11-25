"use client";

const SHIMMER =
  "relative overflow-hidden bg-white/[0.05] " +
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_1.4s_ease-in-out_infinite] " +
  "before:bg-gradient-to-r before:from-transparent before:via-white/[0.08] before:to-transparent";

function Box({ className = "", style }) {
  return <div className={`rounded-lg ${SHIMMER} ${className}`} style={style} />;
}

function Text({ lines = 1, width, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => {
        const w = width || (i === lines - 1 ? "70%" : "100%");
        return <div key={i} className={`h-3 rounded ${SHIMMER}`} style={{ width: w }} />;
      })}
    </div>
  );
}

function Circle({ size = 32, className = "" }) {
  return <div className={`rounded-full ${SHIMMER} ${className}`} style={{ width: size, height: size }} />;
}

function Pill({ width = 70, className = "" }) {
  return <div className={`h-5 rounded-full ${SHIMMER} ${className}`} style={{ width }} />;
}

function Cell({ type = "text", count = 2, align = "left" }) {
  switch (type) {
    case "image":
      return <div className={`h-12 w-20 rounded-lg ${SHIMMER}`} />;
    case "avatar":
      return <Circle size={32} />;
    case "longText":
      return <div className={`h-3 w-[90%] rounded ${SHIMMER}`} />;
    case "number":
      return <div className={`h-3 w-12 rounded ${SHIMMER} ${align === "right" ? "ml-auto" : ""}`} />;
    case "link":
      return <div className={`h-3 w-28 rounded ${SHIMMER}`} />;
    case "badge":
      return <div className={`h-6 w-20 rounded-full ${SHIMMER}`} />;
    case "status":
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.02]">
          <span className={`w-1.5 h-1.5 rounded-full ${SHIMMER}`} />
          <span className={`h-3 w-12 rounded ${SHIMMER}`} />
        </div>
      );
    case "datetime":
      return (
        <div className="space-y-1.5">
          <div className={`h-3 w-20 rounded ${SHIMMER}`} />
          <div className={`h-2.5 w-14 rounded ${SHIMMER}`} />
        </div>
      );
    case "actions":
      return (
        <div className="flex items-center gap-2">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className={`h-8 w-16 rounded-lg ${SHIMMER}`} />
          ))}
        </div>
      );
    case "text":
    default:
      return <div className={`h-3 rounded ${SHIMMER}`} style={{ width: "75%" }} />;
  }
}

function varyWidth(row, col) {
  const widths = ["55%", "62%", "70%", "78%", "85%", "65%", "60%", "73%"];
  return widths[(row * 7 + col * 3) % widths.length];
}

function TableRow({ cols, rowIndex = 0, dense = false }) {
  return (
    <tr className="border-b border-white/5">
      {cols.map((c, i) => (
        <td
          key={i}
          className={`px-4 ${dense ? "py-2.5" : "py-3.5"} ${c.align === "right" ? "text-right" : ""}`}
        >
          {c.type === "number" || c.align === "right" ? (
            <div className="flex justify-end">
              <Cell type={c.type} count={c.count} align="right" />
            </div>
          ) : c.type === "text" || !c.type ? (
            <div className={`h-3 rounded ${SHIMMER}`} style={{ width: varyWidth(rowIndex, i) }} />
          ) : (
            <Cell type={c.type} count={c.count} />
          )}
        </td>
      ))}
    </tr>
  );
}

function PageHeader({ withCta = true, ctaWidth = 140, titleWidth = 240 }) {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div className={`h-8 rounded-lg ${SHIMMER}`} style={{ width: titleWidth }} />
      {withCta && (
        <div className={`h-9 rounded-lg ${SHIMMER}`} style={{ width: ctaWidth }} />
      )}
    </div>
  );
}

function TablePage({
  columnLabels,
  columns,
  rows = 6,
  withFilters = true,
  withCta = true,
  withHeader = true,
  withCard = true,
  titleWidth,
  ctaWidth,
  bare = false,
}) {
  const cols =
    columns ??
    (columnLabels ?? Array.from({ length: 6 })).map((label) => ({
      label: typeof label === "string" ? label : "",
      type: "text",
    }));

  const wrapper = withCard
    ? "rounded-xl border border-white/10 bg-white/[0.02]"
    : "";

  const Wrapper = bare ? "div" : "main";
  const wrapperCls = bare ? "" : "min-h-screen px-6 py-8";

  return (
    <Wrapper className={wrapperCls}>
      {withHeader && !bare && <PageHeader withCta={withCta} titleWidth={titleWidth} ctaWidth={ctaWidth} />}

      <div className={wrapper}>
        {withFilters && (
          <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-5 py-3.5">
            <div className={`h-9 w-60 rounded-lg ${SHIMMER}`} />
            <div className={`h-9 w-36 rounded-lg ${SHIMMER}`} />
            <div className={`h-9 w-32 rounded-lg ${SHIMMER}`} />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10 bg-[#0d091a]">
                {cols.map((c, i) => (
                  <th key={i} className={`px-4 py-3.5 ${c.align === "right" ? "text-right" : "text-left"}`}>
                    <div className={`h-3 w-20 rounded ${SHIMMER}`} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {Array.from({ length: rows }).map((_, i) => (
                <TableRow key={i} rowIndex={i} cols={cols} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Wrapper>
  );
}

const Skeleton = {
  Box,
  Text,
  Circle,
  Pill,
  Cell,
  TableRow,
  PageHeader,
  TablePage,
};

export default Skeleton;
export { Box, Text, Circle, Pill, Cell, TableRow, PageHeader, TablePage, SHIMMER };