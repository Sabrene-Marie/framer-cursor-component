# 🖱️ framer-cursor-component

a springy, physics-based custom cursor for Framer — built to make even the simplest website feel alive.

---

## what it does

replaces the default browser cursor with a **dual-layer spring cursor** that squashes and stretches as you move, breathes gently when idle, and expands into a hollow ring on hover. the whole thing is driven by a custom spring physics loop running on `requestAnimationFrame` — no libraries, just math.

inspired by classic cartoon animation principles — specifically **squash & stretch** from old Disney shorts and rubber hose animation from the 1920s–30s. the idea that even a tiny cursor can have *personality*.

---

## preview
<img width="800" height="519" alt="Cursorgif-ezgif com-video-to-gif-converter" src="https://github.com/user-attachments/assets/d57f0457-38de-450d-b555-30a973a6f246" />


---

## features

- 🫧 **dual cursor** — a solid dot + a ghost outline trail, layered with `mix-blend-mode: difference`
- 🌀 **spring physics** — smooth follow with real velocity and damping (no CSS transitions doing the heavy lifting)
- 💗 **idle breathing** — gentle pulse when the cursor is still
- 🖱️ **hover state** — expands into a ring when over any interactive element (buttons, links, `role="button"`)
- 🫀 **click anticipation** — subtle squeeze on mousedown, release on click
- 🎨 **single color prop** — drop it in, pick a colour, done
- 📱 **pointer-aware** — auto-hides on touch devices so it doesn't break mobile

---

## how to use it in Framer

1. open your Framer project
2. go to **Assets → Code** → click `+` to create a new code component
3. paste the full component code
4. drag the `CustomCursor` component onto your canvas (place it anywhere — it renders fixed/global)
5. in the right panel, set your **Color** prop to match your brand
6. preview in the browser — the canvas preview won't show it

> ⚠️ this component uses `document.body.style.cursor = "none"` and injects a global `<style>` to hide the cursor everywhere. it cleans up after itself on unmount.

---

## props

| prop | type | default | description |
|------|------|---------|-------------|
| `color` | Color | `#F7F6F2` | cursor fill and ghost ring colour |

---

## the physics (for the nerds)

the cursor uses two separate spring simulations:

**main cursor** — higher stiffness (`0.14`), more responsive. this is the solid dot.

**ghost cursor** — lower stiffness (`0.09`), trails behind. this is the hollow ring.

both use velocity damping to prevent infinite oscillation. speed is calculated per-frame and used to drive squash/stretch — fast movement = elongated, slow/stopped = round + breathing.

```js
velocity.x = velocity.x * damping + (target.x - current.x) * stiffness
current.x += velocity.x
```

it's not a real physics engine — it's just good enough to *feel* like one.

---

## remixing

free to use, remix, and build on. if you make something cool with it i'd love to see it — tag [@sabrene.marie](https://instagram.com/sabrene.marie) on instagram.

---

## about

built by [sabrene marie](https://instagram.com/sabrene.marie) — creative developer + UX designer based in sydney.
formerly a makeup artist. still obsessed with making things feel alive.
