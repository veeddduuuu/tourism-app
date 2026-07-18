# Guide character illustrations

Drop your illustrated tour-guide art in **this folder** (`apps/frontend/assets/guides/`).

## File format
- **PNG** (transparent background looks best) or JPG
- **Square** — ideally 512×512 or larger
- The avatar is shown in a circle, so keep the character centered.

## Naming
Use the character **id**, plus optionally gender and age:

| Granularity | File name pattern | Example |
|---|---|---|
| One image per character | `<id>.png` | `aarohi.png` |
| Per character + gender | `<id>-<gender>.png` | `aarohi-female.png` |
| Full control | `<id>-<gender>-<age>.png` | `aarohi-female-adult.png` |

- **ids:** `aarohi`, `ravi`, `meera`, `arjun`, `priya`, `kabir`
- **gender:** `female`, `male`
- **age:** `young`, `adult`, `senior`

Most specific match wins; anything missing falls back to the built-in vector avatar.

## Register the files
Metro can't load images by a computed name, so after adding files, open
`apps/frontend/constants/guideArt.ts` and **uncomment / add** the matching
`require(...)` line for each file. That's the only wiring step.
