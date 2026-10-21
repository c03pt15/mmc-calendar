const DEFAULT_ADMIN_EMAILS = ['ghgirard@atlasinstitute.ca'];

const TEAM_MEMBER_NAMES = {
  1: ['courtney wright'],
  2: ['ghislain girard'],
  3: ['joy pavelich'],
  4: ['krystle kung'],
  5: ['lori-anne knarr', 'lori-anne thibault'],
  6: ['meg mclean', 'meagan mclean']
};

const getRequesterTeamMemberId = (authUser) => {
  const metadata = authUser?.user_metadata || {};
  const explicitId = Number(metadata.team_member_id ?? metadata.teamMemberId);
  if (Number.isInteger(explicitId) && explicitId > 0) return explicitId;

  const names = [
    `${metadata.first_name || ''} ${metadata.last_name || ''}`.trim(),
    metadata.full_name,
    metadata.name
  ]
    .filter(Boolean)
    .map((name) => name.toLowerCase());

  for (const [id, aliases] of Object.entries(TEAM_MEMBER_NAMES)) {
    if (aliases.some((alias) => names.includes(alias))) {
      return Number(id);
    }
  }

  return null;
};

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

const buildEmailHtml = ({ title, eventDate, createdByName, addedOn, calendarUrl, isUpdate }) => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.6;">
    <h2 style="margin: 0 0 8px; color: #1d4ed8;">${isUpdate ? 'Updated MMC Calendar entry' : 'New MMC Calendar entry'}</h2>
    <p style="margin: 0 0 20px;">${isUpdate ? 'An entry in the MMC Calendar has been updated.' : 'A new entry has been added to the MMC Calendar.'}</p>
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
        <td style="padding: 8px 12px; background: #eff6ff; border: 1px solid #dbeafe; font-weight: 600;">${isUpdate ? 'Date updated' : 'Date added'}</td>
        <td style="padding: 8px 12px; border: 1px solid #dbeafe;">${escapeHtml(addedOn)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; background: #eff6ff; border: 1px solid #dbeafe; font-weight: 600;">${isUpdate ? 'Updated by' : 'Added by'}</td>
        <td style="padding: 8px 12px; border: 1px solid #dbeafe;">${escapeHtml(createdByName)}</td>
      </tr>
    </table>
    <p style="margin: 24px 0 0;">
      <a href="${escapeHtml(calendarUrl)}" style="display: inline-block; padding: 10px 18px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">View in MMC Calendar</a>
    </p>
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

    if (!authUser?.email) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const adminEmails = process.env.MMC_ADMIN_EMAILS
      ? parseEmailList(process.env.MMC_ADMIN_EMAILS)
      : DEFAULT_ADMIN_EMAILS;

    const { title, eventDate, createdByName, action, taskId } = req.body || {};
    const isUpdate = action === 'updated';

    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: 'Missing task title' });
    }

    if (!eventDate || !String(eventDate).trim()) {
      return res.status(400).json({ error: 'Missing event date' });
    }

    if (!taskId) {
      return res.status(400).json({ error: 'Missing task id' });
    }

    const requesterTeamMemberId = getRequesterTeamMemberId(authUser);

    if (!requesterTeamMemberId) {
      return res.status(403).json({ error: 'Could not verify your team member profile' });
    }

    const taskResponse = await fetch(
      `${supabaseUrl}/rest/v1/tasks?id=eq.${encodeURIComponent(taskId)}&select=created_by`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    if (!taskResponse.ok) {
      console.error('Failed to load task for notification verification:', taskResponse.status);
      return res.status(502).json({ error: 'Failed to verify the task creator' });
    }

    const tasks = await taskResponse.json().catch(() => []);

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (Number(tasks[0].created_by) !== requesterTeamMemberId) {
      return res.status(403).json({ error: 'Only the task creator can send this notification' });
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

    const defaultCalendarUrl = 'https://mmc-calendar.atlasveterans.ca/';
    let calendarUrl = defaultCalendarUrl;
    try {
      calendarUrl = new URL(process.env.MMC_CALENDAR_URL || defaultCalendarUrl).toString();
    } catch {
      calendarUrl = defaultCalendarUrl;
    }

    const from = process.env.MMC_FROM_EMAIL || 'MMC Calendar <onboarding@resend.dev>';
    const subject = `${isUpdate ? 'Updated' : 'New'} MMC Calendar entry: ${safeTitle}`;
    const html = buildEmailHtml({
      title: safeTitle,
      eventDate: safeEventDate,
      createdByName: safeCreatedByName,
      addedOn,
      calendarUrl,
      isUpdate
    });

    // Send one email per recipient so member addresses are not exposed to each other
    const emails = recipients.map((recipient) => ({
      from,
      to: [recipient],
      subject,
      html
    }));

    const emailResponse = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emails)
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
      recipients
    });
  } catch (error) {
    console.error('Unexpected notification error:', error);
    return res.status(500).json({ error: 'Unexpected error sending notification' });
  }
};
