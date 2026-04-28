// ═══════════════════════════════════════════════════════════════════
//  API Service Layer — Centralized HTTP client for backend calls
//  ─────────────────────────────────────────────────────────────────
//  Features covered: F9, F10, F11 (Irshad)
//  Base URL points to the ASP.NET Core backend
// ═══════════════════════════════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5085/api";

/**
 * Generic fetch wrapper with error handling.
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ─────────────────────────────────────────────────
//  Feature 10: Customer Search API
// ─────────────────────────────────────────────────

/**
 * Search customers by name, phone, ID, or vehicle plate number.
 * @param {string} term - Search query string
 * @returns {Promise<{query: string, count: number, results: Array}>}
 */
export async function searchCustomers(term) {
  return apiFetch(`/customers/search?term=${encodeURIComponent(term)}`);
}

// ─────────────────────────────────────────────────
//  Feature 9: Customer Reports API
// ─────────────────────────────────────────────────

/**
 * Get high-spender report — customers ranked by total spend.
 * @param {number} top - Number of results (default 20)
 */
export async function getHighSpendersReport(top = 20) {
  return apiFetch(`/reports/customers/high-spenders?top=${top}`);
}

/**
 * Get regular-customer report — ranked by purchase frequency.
 * @param {number} top - Number of results (default 20)
 */
export async function getRegularCustomersReport(top = 20) {
  return apiFetch(`/reports/customers/regulars?top=${top}`);
}

/**
 * Get pending-credit report — customers with unpaid balances.
 */
export async function getPendingCreditsReport() {
  return apiFetch(`/reports/customers/pending-credits`);
}

// ─────────────────────────────────────────────────
//  Feature 11: Invoice Email API
// ─────────────────────────────────────────────────

/**
 * Get full invoice details for preview.
 * @param {number} invoiceId
 */
export async function getInvoiceDetail(invoiceId) {
  return apiFetch(`/invoices/${invoiceId}/detail`);
}

/**
 * Send invoice email to customer.
 * @param {number} invoiceId
 * @param {Object} options - { customMessage?: string, recipientEmailOverride?: string }
 */
export async function sendInvoiceEmail(invoiceId, options = {}) {
  return apiFetch(`/invoices/${invoiceId}/email`, {
    method: "POST",
    body: JSON.stringify(options),
  });
}

export default {
  searchCustomers,
  getHighSpendersReport,
  getRegularCustomersReport,
  getPendingCreditsReport,
  getInvoiceDetail,
  sendInvoiceEmail,
};
