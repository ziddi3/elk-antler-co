async function submitMethodzLead(e, brandDefault = "method_hvac") {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector("button[type=submit]");
  const originalText = btn ? btn.innerText : "Submit";
  if (btn) btn.innerText = "Submitting...";

  const payload = {
    company: form.querySelector("[name=company]")?.value || form.querySelector("[name=name]")?.value || "Web Inquiry",
    contact_email: form.querySelector("[name=email]")?.value,
    phone: form.querySelector("[name=phone]")?.value || "",
    industry: form.querySelector("[name=industry]")?.value || brandDefault,
    seats: parseInt(form.querySelector("[name=seats]")?.value || "1", 10),
    source: window.location.hostname || "web_intake"
  };

  try {
    const res = await fetch("https://crm.methodz.ca/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-methodz-crm-secret": "methodz-crm-2026-secret"
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert("Inquiry received. Our dispatch desk will reach out shortly.");
      form.reset();
    } else {
      alert("Submission failed. Please reach out to dispatch directly.");
    }
  } catch (err) {
    alert("Connection error reaching CRM core.");
  } finally {
    if (btn) btn.innerText = originalText;
  }
}
window.submitMethodzLead = submitMethodzLead;
