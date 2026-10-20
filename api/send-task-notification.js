const DEFAULT_ADMIN_EMAILS = ['ghgirard@atlasinstitute.ca'];

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const parseEmailList = (value) =>
  String(value || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

const formatAddedOn = () =>
  new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Toronto'
  }).format(new Date());

const buildEmailHtml = ({ title, eventDate, createdByName, addedOn }) => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.6;">
    <h2 style="margin: 0 0 8px; color: #1d4ed8;">New MMC Calendar entry</h2>
    <p style="margin: 0 0 20px;">A new entry has been added to the MMC Calendar.</p>
    <table cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 560px;">
      <tr>
        <td style="padding: 8px 12px; background: #eff6ff; border: 1px solid #dbeafe; font-weight: 600; width: 140px;">Title</td>
        <td style="padding: 8px 12px; border: 1px solid #dbeafe;">${escapeHtml(title)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; background: #eff6ff; border: 1px solid #dbeafe; font-weight: 600;">Event date</td>
        <td style="padding: 8px 12px; border: 1px solid #dbeafe;">${escapeHtml(eventDate)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; background: #eff6ff; border: 1px solid #dbeafe; font-weight: 600;">Date added</td>
        <td style="padding: 8px 12px; border: 1px solid #dbeafe;">${escapeHtml(addedOn)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; background: #eff6ff; border: 1px solid #dbeafe; font-weight: 600;">Added by</td>
        <td style="padding: 8px 12px; border: 1px solid #dbeafe;">${escapeHtml(createdByName)}</td>
      </tr>
    </table>
    <p style="margin: 20px 0 0; font-size: 12px; color: #6b7280;">
      This notification was sent from the MMC Calendar.
    </p>
  </div>
`;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables for notification endpoint');
    return res.status(500).json({ error: 'Notification service is not configured' });
  }

  const authHeader = req.headers.authorization || '';
  const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!accessToken) {
    return res.status(401).json({ error: 'Missing access token' });
  }

  try {
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!userResponse.ok) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const authUser = await userResponse.json();
    const requesterEmail = String(authUser.email || '').toLowerCase();

    const adminEmails = process.env.MMC_ADMIN_EMAILS
      ? parseEmailList(process.env.MMC_ADMIN_EMAILS)
      : DEFAULT_ADMIN_EMAILS;

    if (!requesterEmail || !adminEmails.includes(requesterEmail)) {
      return res.status(403).json({ error: 'Only administrators can send this notification' });
    }

    const { title, eventDate, createdByName } = req.body || {};

    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: 'Missing task title' });
    }

    if (!eventDate || !String(eventDate).trim()) {
      return res.status(400).json({ error: 'Missing event date' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('Missing RESEND_API_KEY environment variable');
      return res.status(500).json({ error: 'Email service is not configured' });
    }

    const recipientsFromEnv = parseEmailList(process.env.MMC_NOTIFICATION_EMAILS);
    const recipients = recipientsFromEnv.length > 0 ? recipientsFromEnv : adminEmails;

    const addedOn = formatAddedOn();
    const safeTitle = String(title).trim();
    const safeEventDate = String(eventDate).trim();
    const safeCreatedByName = String(createdByName || 'Unknown').trim();

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.MMC_FROM_EMAIL || 'MMC Calendar <onboarding@resend.dev>',
        to: recipients,
        subject: `New MMC Calendar entry: ${safeTitle}`,
        html: buildEmailHtml({
          title: safeTitle,
          eventDate: safeEventDate,
          createdByName: safeCreatedByName,
          addedOn
        })
      })
    });

    const emailResult = await emailResponse.json().catch(() => ({}));

    if (!emailResponse.ok) {
      console.error('Resend error:', emailResult);
      return res.status(502).json({
        error: emailResult.message || 'Failed to send notification email'
      });
    }

    return res.status(200).json({
      success: true,
      id: emailResult.id,
      recipients
    });
  } catch (error) {
    console.error('Unexpected notification error:', error);
    return res.status(500).json({ error: 'Unexpected error sending notification' });
  }
};
