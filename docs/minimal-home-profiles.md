# Minimal home and profile pictures

Removed the learning-plan navigation, dashboard card, rendered route and tour step. Existing saved plans are retained in storage but no longer surfaced. Level check remains accessible from the profile.

Home now shows greeting, level, one recommendation and three secondary links (exercises, coach, progress). Removed dashboard promotional blocks, daily ring, word-of-day and duplicated language/start choices. Classes remain available in the profile. Voice preloading stays active without a home banner.

Students and teachers share a profile-image editor: eight presets, JPEG/PNG/WebP input up to 8 MB, center-cropped to 192px JPEG and capped at 40,000 data-URL characters. Metadata is discarded during canvas re-encoding. Images are stored in the existing private profile JSON, accessed through authenticated GET/PUT. Normal profile updates preserve them. AI profile reads exclude the avatar field. No new storage bucket, schema migration or dependency.

Verification: automated suite and production build. Live authenticated upload/save and visual browser QA were not performed in this change. Upload save errors are shown inline; the existing picture remains until a successful save.
