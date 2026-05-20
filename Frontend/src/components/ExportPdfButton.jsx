import { useState } from "react";
import { downloadPdf } from "../utils/pdfExport";

export default function ExportPdfButton({
  path,
  filename,
  label = "Export PDF",
  className = "btn btn-g",
  disabled = false,
  style = undefined,
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await downloadPdf(path, filename);
    } catch (err) {
      alert(err.message || "Failed to export PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      disabled={disabled || loading}
      style={style}
    >
      {loading ? "Exporting…" : `📄 ${label}`}
    </button>
  );
}
