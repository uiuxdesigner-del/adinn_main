# Lead capture and measurement: setup

**Status: built, not live.** Until `CRM_WEBHOOK_URL` is set, `/api/enquiry` replies "not configured" and the
form tells visitors their enquiry was **not** sent (and to call, WhatsApp or email). It never shows a
confirmation unless the server has accepted the lead.

## Required environment variables (server only; never `NEXT_PUBLIC_`)

| Variable | Purpose |
|---|---|
| `CRM_WEBHOOK_URL` | HTTPS endpoint of the CRM or automation tool (HubSpot/Zoho/Zapier/Make/etc.). Receives a JSON POST per enquiry. |
| `CRM_WEBHOOK_TOKEN` | Optional. Sent as `Authorization: Bearer <token>`. |
| `SITE_URL` | Public origin, e.g. `https://www.adinn.com`. Used for canonical URLs, sitemap, robots and structured data. |
| `ENQUIRY_DEV_ACCEPT` | `true` only in local development: logs the lead instead of forwarding. Ignored in production. |

## Payload sent to the CRM

```json
{ "receivedAt": "ISO time", "name": "", "company": null, "email": null, "phone": null,
  "requirement": "", "interest": "guidance | solution:<id> | service:<id>",
  "source": { "site": "adinn-website", "landingPage": "/contact?interest=...", "referrer": null,
              "utm_source": "", "utm_medium": "", "utm_campaign": "", "utm_term": "", "utm_content": "" } }
```
Map `interest` to the CRM's solution/service field. The CRM must send the acknowledgement email and run
follow-up workflows; this site does not send email.

## Behaviour already built

- Validation on client and server (shared rules); values kept after any error.
- Spam: honeypot field, minimum 2.5 s fill time, 5 enquiries per IP per 10 minutes, field length limits.
- Duplicates: submit button locks while sending; per-form key and content hash ignore repeats for 10 minutes.
- The rate limit and duplicate cache are per server instance. If you run several instances, rely on the
  CRM's de-duplication or add a shared store. Add Cloudflare Turnstile/reCAPTCHA if abuse appears.
- Measurement: `lib/track.ts` pushes `cta_click`, `enquiry_submitted`, `enquiry_failed`, `whatsapp_click`,
  `phone_click`, `email_click`, `case_film_play` to `window.dataLayer`. **No analytics vendor is installed**:
  add GTM/GA4 to `app/layout.tsx` (and update `/privacy`, which currently says no analytics) to receive them.

## Content still needed (see CONTENT-SOURCES.md)

Client permission records for each logo; case-study details and results from Adinn; confirmation that
`config/site.ts` `contact.whatsapp` is a WhatsApp number; final legal privacy notice.
