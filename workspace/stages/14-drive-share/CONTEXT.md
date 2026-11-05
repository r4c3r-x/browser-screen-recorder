# Stage 14 — share to Google Drive [REMOVED]

**Status: removed at user direction on 2026-11-06.** The feature was built
and merged (ada38f1), then reverted (e8bb98e) after the user reviewed the
setup requirements.

User request (verbatim): "nah i dont want the Google OAuth client ID.. to
much hassle setting up.. not user-friendly. hell no.. remove it fro the
page then."

## Why it was removed

Google Drive has no email+password login for third-party apps — OAuth is
the only access mechanism, and it requires a Google Cloud OAuth client ID
(a one-time console setup the user found too much hassle and not
user-friendly). The rejection applies to the setup requirement, not to a
bug. This record is kept so the decision and its reason survive in the
workspace trail; do not re-introduce Drive sharing without the user asking.

## What the feature was (for the record)

Share button on the finished recording; Google Identity Services sign-in
(scope drive.file, token in memory only); title form with optional private
transcript upload; public view link for the recording. Implementation was
verified by 56/56 unit and 3/3 e2e tests before removal. If a no-account
or friendlier sharing path is ever wanted (e.g. Supabase email/password),
this record is the starting point.
