/**
 * Download a PDF from the backend API.
 * @param {string} path - Path after /api/pdf (e.g. "/sales-invoice/5")
 * @param {string} filename - Suggested download filename
 */
export async function downloadPdf(path, filename) {
  const token = localStorage.getItem("token");
  const url = `/api/pdf${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    let message = `PDF export failed (${res.status})`;
    try {
      const data = await res.json();
      if (data.message) message = data.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
}
