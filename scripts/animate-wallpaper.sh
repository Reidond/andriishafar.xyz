#!/usr/bin/env bash
# Animates the wallpaper with Grok Imagine (image_to_video) and turns the clip into a seamless, light loop at
# public/wallpaper/sunset.mp4. When that file exists, the homepage plays it through the dither shader instead
# of animating the still.
#
# Needs ffmpeg and the grok CLI signed in with video generation available (Zero Data Retention blocks it).
# Pass an existing clip to skip generation: scripts/animate-wallpaper.sh path/to/clip.mp4
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
out="$root/public/wallpaper/sunset.mp4"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

clip="${1:-}"
if [[ -z "$clip" ]]; then
  ffmpeg -loglevel error -y -i "$root/public/wallpaper/sunset.webp" "$work/sunset.png"
  grok -p "Use image_to_video on ./sunset.png (it is frame 1) with a 10 second duration and save the result in this directory as clip.mp4. Video prompt: 'Static locked-off camera on a red pixel-art beach at sunset. Gentle waves roll in and white foam washes softly over the sand and recedes, the sun's reflection shimmers on the water, and the clouds drift very slowly to the right. Keep the pixel-art dithered look and the exact red palette; no camera movement, no zoom.' Generate nothing else and edit no other files." \
    --cwd "$work" --tools image_to_video,run_terminal_cmd --max-turns 12
  clip="$work/clip.mp4"
  if [[ ! -f "$clip" ]]; then
    echo "grok did not produce a video; check that video generation isn't blocked by Zero Data Retention" >&2
    exit 1
  fi
fi

# Crossfade the last second into the first so the loop has no seam, drop audio, and shrink it: the shader
# re-dithers every frame at a few hundred cells across, so 720px is plenty.
fade=1
duration="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$clip")"
offset="$(awk "BEGIN { print $duration - 2 * $fade }")"
ffmpeg -loglevel error -y -i "$clip" -filter_complex "
  [0:v]fps=30,format=yuv420p,split[a][b];
  [a]trim=start=$fade,setpts=PTS-STARTPTS[body];
  [b]trim=end=$fade,setpts=PTS-STARTPTS[head];
  [body][head]xfade=transition=fade:duration=$fade:offset=$offset,scale=720:-2:flags=lanczos[out]" \
  -map "[out]" -an -c:v libx264 -preset slow -crf 26 -movflags +faststart "$out"
echo "Wrote $out"
