import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// This page has been merged into CustomerDetails.
// Redirect anyone who lands on /staff/search-customer to the unified page.
export default function SearchCustomer() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/staff/customer-details", { replace: true });
  }, [navigate]);
  return null;
}
