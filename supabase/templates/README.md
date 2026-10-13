# Account confirmation mail
Subject: Welkom bij AI Taalcoach — bevestig je account

Use confirm-signup.html for Supabase Authentication → Emails → Confirm sign up.
Keep {{ .ConfirmationURL }} intact: Supabase creates the single-use link and redirect.
HTML uses inline styles, tables and image alternative text for mail-client compatibility.

The current project uses Supabase's default mail service. Its dashboard requires a custom SMTP sender to use custom templates. A verified sender/domain and SMTP credentials must be configured before this template can be delivered. Do not disable email confirmation to work around this requirement.
Class invitations currently appear inside the student's account; they do not send email.
