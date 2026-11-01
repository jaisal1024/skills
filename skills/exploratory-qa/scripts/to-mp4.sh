#!/usr/bin/env bash
# Convert a recording to an mp4 that GitHub's player plays, and print its path.
# Usage: to-mp4.sh <in.webm> <out.mp4> [--trim <seconds>] [--crf <n>]; raise --crf to shrink the file.
set -euo pipefail

IN="${1:-}"
OUT="${2:-}"
if [[ -z "$IN" || -z "$OUT" ]]; then
  echo "usage: $(basename "$0") <in.webm> <out.mp4> [--trim <seconds>] [--crf <n>]" >&2
  exit 64
fi
shift 2
[[ -f "$IN" ]] || { echo "no such file: $IN" >&2; exit 66; }
command -v ffmpeg >/dev/null || { echo "ffmpeg not found" >&2; exit 69; }

TRIM="0"
CRF="23"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --trim) TRIM="$2"; shift 2 ;;
    --crf)  CRF="$2"; shift 2 ;;
    *) echo "unknown option: $1" >&2; exit 64 ;;
  esac
done

WIDTH="$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$IN")"

# playwright-cli's screencast can capture fewer rows than the video size and
# pads the rest with flat grey. Count those rows on the last frame and crop them.
BAND="$(
  ffmpeg -loglevel error -sseof -0.5 -i "$IN" -frames:v 1 -vf format=gray -f rawvideo - |
    WIDTH="$WIDTH" node -e '
      const data = require("fs").readFileSync(0);
      const width = Number(process.env.WIDTH);
      let rows = 0;
      for (let y = data.length / width - 1; y >= 0; y--) {
        const row = data.subarray(y * width, (y + 1) * width);
        if (!row.every((v) => Math.abs(v - 128) <= 2)) break;
        rows++;
      }
      console.log(rows);
    '
)"

rm -f "$OUT"
# libx264 needs even dimensions, and GitHub plays only yuv420p.
ffmpeg -loglevel error -y -ss "$TRIM" -i "$IN" \
  -vf "crop=iw:ih-${BAND}:0:0,scale=trunc(iw/2)*2:trunc(ih/2)*2" \
  -c:v libx264 -crf "$CRF" -pix_fmt yuv420p -movflags +faststart "$OUT"

[[ "$BAND" -eq 0 ]] || echo "cropped a ${BAND}px grey band from the bottom" >&2
echo "$OUT"
