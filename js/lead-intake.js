async function submitMethodzLead(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector("button[type=submit]");
  const originalText = btn ? btn.innerText : "Submit";
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Submitting...";
  }

  const payload = {
    name:
      form.querySelector("[name=name]")?.value ||
      form.querySelector("#cname")?.value ||
      "",
    email:
      form.querySelector("[name=email]")?.value ||
      form.querySelector("#cemail")?.value ||
      "",
    message:
      form.querySelector("[name=message]")?.value ||
      form.querySelector("#cmsg")?.value ||
      "",
    pageUrl: window.location.href,
  };

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Inquiry received. Our dispatch desk will reach out shortly.");
      form.reset();
    } else {
      alert("Submission failed. Please reach out to dispatch directly.");
    }
  } catch {
    alert("Connection error reaching the contact service.");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = originalText;
    }
  }
}

window.submitMethodzLead = submitMethodzLead;
