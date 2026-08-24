interface SendVerificationRequestParams {
  identifier: string;
  url: string;
  provider: { apiKey?: string; from?: string };
}

// Custom sender so the magic-link email matches Even Kletsen's voice instead
// of Auth.js's generic default template. Calls the Resend HTTP API directly —
// no SDK needed for a single POST.
export async function sendVerificationRequest({
  identifier: to,
  url,
  provider,
}: SendVerificationRequestParams) {
  if (!provider.apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is not configured");
    }
    // Dev fallback so the login flow is testable without a real Resend
    // account: print the magic link instead of emailing it.
    console.log(`\n[dev] Magic link for ${to}:\n${url}\n`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: provider.from,
      to,
      subject: "Je inloglink voor Even Kletsen",
      html: emailHtml(url),
      text: emailText(url),
    }),
  });

  if (!res.ok) {
    throw new Error(`Kon inloglink niet versturen: ${await res.text()}`);
  }
}

function emailHtml(url: string) {
  return `
  <div style="background:#fbf6ef;padding:40px 20px;font-family:'Plus Jakarta Sans',Arial,sans-serif;color:#2b2420;">
    <div style="max-width:440px;margin:0 auto;background:#ffffff;border-radius:20px;padding:36px;">
      <p style="font-size:15px;color:#8c8175;margin:0 0 8px;">Even Kletsen</p>
      <h1 style="font-size:22px;margin:0 0 16px;">Hoi, welkom terug 👋</h1>
      <p style="font-size:15px;line-height:1.6;margin:0 0 24px;">
        Klik op de knop hieronder om in te loggen. Deze link is 24 uur geldig
        en kan maar één keer gebruikt worden.
      </p>
      <a href="${url}"
        style="display:inline-block;background:#e2643a;color:#fffaf5;text-decoration:none;
        padding:12px 28px;border-radius:999px;font-weight:600;font-size:15px;">
        Inloggen bij Even Kletsen
      </a>
      <p style="font-size:13px;color:#8c8175;margin:28px 0 0;line-height:1.6;">
        Heb je dit niet aangevraagd? Dan kun je deze e-mail gewoon negeren.
      </p>
    </div>
  </div>`;
}

function emailText(url: string) {
  return `Hoi, welkom terug bij Even Kletsen.\n\nLog in via deze link (24 uur geldig, eenmalig te gebruiken):\n${url}\n\nHeb je dit niet aangevraagd? Dan kun je deze e-mail negeren.`;
}
