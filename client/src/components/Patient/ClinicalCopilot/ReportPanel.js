import React, { useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const PRINT_CSS = `
  body { font-family: Georgia, 'Times New Roman', serif; font-size: 11pt; line-height: 1.65;
         max-width: 720px; margin: 0 auto; padding: 24px 32px; color: #111; }
  h1 { font-size: 20pt; font-weight: bold; margin: 0 0 6px; }
  h2 { font-size: 13pt; font-weight: bold; border-bottom: 1px solid #ccc;
       padding-bottom: 3px; margin: 20px 0 8px; }
  h3 { font-size: 11pt; font-weight: bold; margin: 14px 0 5px; }
  p  { margin: 5px 0 10px; }
  ul, ol { margin: 4px 0 10px; padding-left: 22px; }
  li { margin-bottom: 4px; }
  strong { font-weight: 700; }
  table { width: 100%; border-collapse: collapse; font-size: 10pt; margin: 8px 0 14px; }
  th, td { padding: 5px 8px; border: 1px solid #ddd; }
`;

export default function ReportPanel({ title, subtitle, content, accentClass }) {
  const contentRef = useRef(null);

  function handleDownloadPDF() {
    if (!contentRef.current) return;
    const html = contentRef.current.innerHTML;
    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>${PRINT_CSS}</style>
</head>
<body>${html}</body>
</html>`);
    win.document.close();
    setTimeout(() => {
      win.focus();
      win.print();
    }, 350);
  }

  return (
    <div className="cc-reportPanel">
      <div className={`cc-reportHeader ${accentClass}`}>
        <div>
          <h3 className="cc-reportTitle">{title}</h3>
          <p className="cc-reportSubtitle">{subtitle}</p>
        </div>
        <button type="button" className="cc-btn cc-btn-sm" onClick={handleDownloadPDF}>
          PDF
        </button>
      </div>
      <div className="cc-reportBody">
        <div ref={contentRef} className="cc-markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
