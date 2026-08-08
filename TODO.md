# THRIFTX — Auth + Footer UI Polish (Design System Compliance)

## Steps

- [ ] 1. Button.tsx: wrap content in `inline-flex items-center` span (fix icon/text vertical misalignment globally)
- [ ] 2. button.styles.ts: base gap → 10px (gap-2.5); add `dark` & `light` variants for the global button system
- [ ] 3. PasswordField.tsx: eye button → ghost + `iconMd` (44×44), proper radius, focus ring, dark/light support
- [ ] 4. login/page.tsx: use shared `container-tight` (1280px) content width; fix Google icon size (22→20)
- [ ] 5. signup/page.tsx: use shared `container-tight` (1280px); fix Google icon size (22→20)
- [ ] 6. Footer.tsx: use shared `Container`; use shared `Input` for email; ensure Subscribe button icon/text centered
- [ ] 7. Header.tsx: ensure Sign In button matches header actions (shared Button); dropdown right-aligned, no overflow
- [ ] 8. profile/settings/page.tsx: fix "Sign Outsf sdf" typo; password eye buttons → 44×44 (`iconMd`)
- [ ] 9. Final QA: verify buttons/icons/text centered, content widths, dark/light mode, no manual margins

