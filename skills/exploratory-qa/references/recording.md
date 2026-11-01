# Recording a flow

Record only when a still frame cannot show the change: a transition, an animation, or a
sequence of steps that a reviewer needs to see in order.

## Record

Use the same `playwright-cli` session that you explore with. Load the page and find the refs
first. Then start the video, so that the clip holds the flow and not the page load:

```sh
pw() { npx playwright-cli -s="$QA_SESSION" "$@"; }

pw goto "$QA_URL/some/route"
pw snapshot                                         # find the ref of each control
pw video-start "$QA_DIR/drawer-close.webm" --size 1280x800   # the viewport size
pw click e14
pw press Escape
pw video-stop
```

Give each recording its own file name. Without `playwright-cli`, use a browser tool that
records, or a temporary Playwright script whose context sets `recordVideo`. Assert each
visible state in the script before the next step, and close the context to flush the file.

## Convert

Many players, including GitHub's, need H.264 in `yuv420p`, and Playwright writes WebM. Convert
each recording with [`to-mp4.sh`](../scripts/to-mp4.sh), which needs `ffmpeg` and Node.js:

```sh
"$SKILL_DIR/scripts/to-mp4.sh" "$QA_DIR/drawer-close.webm" "$QA_DIR/drawer-close.mp4"
```

The `playwright-cli` recorder can capture fewer rows than the viewport and fill the rest with
grey. The script crops that band, so the bottom of the page is not in the video. Keep the
control you demonstrate out of the bottom of the viewport. Pass `--trim <seconds>` to drop idle
frames at the start.

## Look at it

You cannot read a video directly. Make one contact sheet with a frame for each second, and
read that:

```sh
ffmpeg -loglevel error -y -i "$QA_DIR/drawer-close.mp4" \
  -vf "fps=1,scale=320:-1,tile=4x4" -frames:v 1 "$QA_DIR/drawer-close-sheet.png"
```

## Size

Attachment hosts cap file size; GitHub rejects an attachment above 10MB. Pass `--crf 30` to
`to-mp4.sh` to shrink a recording. To shrink a screenshot, cap its longest side:

```sh
ffmpeg -y -i shot.png \
  -vf "scale='min(1400,iw)':'min(1400,ih)':force_original_aspect_ratio=decrease" \
  shot-small.png
```
