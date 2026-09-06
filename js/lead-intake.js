async function submitMethodzLead(e, brandDefault = "elk_antler") {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector("button[type=submit]");
  const originalText = btn ? btn.innerText : "Submit";
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Submitting...";
  }

  const value = (selector) => form.querySelector(selector)?.value?.trim() || "";
  const name = value("[name=name]") || value("#cname") || value("[name=company]");
  const email = value("[name=email]") || value("#cemail");
  const message = value("[name=message]") || value("#cmsg");

  const payload = {
    name,
    email,
    message,
    brand: brandDefault,
    pageUrl: window.location.href,
    sessionId: window.crypto?.randomUUID?.() || undefined,
  };

  try {
    // Browser code never receives Methodz CRM credentials. The same-origin
    // serverless relay owns the secret and forwards a normalized lead to CRM.
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Inquiry received. Our team will reach out shortly.");
      form.reset();
    } else {
      alert("Submission failed. Please reach out to us directly.");
    }
  } catch {
    alert("Connection error while submitting your inquiry.");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = originalText;
    }
  }
}
window.submitMethodzLead = submitMethodzLead;