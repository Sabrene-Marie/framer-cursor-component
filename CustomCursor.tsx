import { useEffect, useState, useRef } from "react"
import { addPropertyControls, ControlType } from "framer"

export default function CustomCursor(props) {
    const [isVisible, setIsVisible] = useState(false)
    const [isHovering, setIsHovering] = useState(false)

    const cursorRef = useRef(null)
    const ghostRef = useRef(null)

    const targetPos = useRef({ x: -100, y: -100 })
    const currentPos = useRef({ x: -100, y: -100 })
    const ghostPos = useRef({ x: -100, y: -100 })
    const lastPos = useRef({ x: -100, y: -100 })
    const velocity = useRef({ x: 0, y: 0 })
    const ghostVelocity = useRef({ x: 0, y: 0 })
    const smoothedSpeed = useRef(0)

    const wobblePhase = useRef(0)

    const clickPulse = useRef(0)
    const clickAnticipation = useRef(0)

    const animationRef = useRef(null)

    useEffect(() => {
        const hasMouse = window.matchMedia("(pointer: fine)").matches
        if (!hasMouse) return

        setIsVisible(true)
        document.body.style.cursor = "none"

        const handleMouseMove = (e) => {
            targetPos.current = { x: e.clientX, y: e.clientY }

            const target = e.target
            const interactive =
                target.tagName === "BUTTON" ||
                target.tagName === "A" ||
                target.closest("button") !== null ||
                target.closest("a") !== null ||
                target.getAttribute("role") === "button" ||
                window.getComputedStyle(target).cursor === "pointer"

            setIsHovering(interactive)
        }

        const handleMouseDown = () => {
            clickAnticipation.current = 1
            setTimeout(() => {
                clickPulse.current = 1
                clickAnticipation.current = 0
            }, 80)
        }

        const styleEl = document.createElement("style")
        styleEl.innerHTML = `*, *::before, *::after { cursor: none !important; }`
        document.head.appendChild(styleEl)

        window.addEventListener("mousemove", handleMouseMove)
        window.addEventListener("mousedown", handleMouseDown)

        // Softer main cursor spring — gentler pull, more damping
        const mainStiffness = 0.14
        const mainDamping = 0.78

        // Even gentler ghost spring
        const ghostStiffness = 0.09
        const ghostDamping = 0.84

        const animate = () => {
            lastPos.current.x = currentPos.current.x
            lastPos.current.y = currentPos.current.y

            // Main cursor spring
            const dx = targetPos.current.x - currentPos.current.x
            const dy = targetPos.current.y - currentPos.current.y
            velocity.current.x =
                velocity.current.x * mainDamping + dx * mainStiffness
            velocity.current.y =
                velocity.current.y * mainDamping + dy * mainStiffness
            currentPos.current.x += velocity.current.x
            currentPos.current.y += velocity.current.y

            // Ghost cursor spring
            const gdx = currentPos.current.x - ghostPos.current.x
            const gdy = currentPos.current.y - ghostPos.current.y
            ghostVelocity.current.x =
                ghostVelocity.current.x * ghostDamping + gdx * ghostStiffness
            ghostVelocity.current.y =
                ghostVelocity.current.y * ghostDamping + gdy * ghostStiffness
            ghostPos.current.x += ghostVelocity.current.x
            ghostPos.current.y += ghostVelocity.current.y

            // Speed calculation
            const dxFrame = currentPos.current.x - lastPos.current.x
            const dyFrame = currentPos.current.y - lastPos.current.y
            const rawSpeed = Math.sqrt(dxFrame * dxFrame + dyFrame * dyFrame)

            // Much smoother speed averaging (was 0.25, now 0.10 — gentler reactions)
            smoothedSpeed.current += (rawSpeed - smoothedSpeed.current) * 0.1
            const speed = smoothedSpeed.current

            const angle = Math.atan2(dyFrame, dxFrame) * (180 / Math.PI)

            // Toned-down squash & stretch — still bouncy, less extreme
            const stretchAmount = Math.min(1 + speed * 0.05, 2.4)
            const squashAmount = Math.max(1 - speed * 0.03, 0.55)

            // Gentle breathing only — no fidget, no random jitter
            wobblePhase.current += 0.05 // slower phase (was 0.09)
            const isIdle = speed < 0.3
            const wobble = isIdle ? Math.sin(wobblePhase.current) * 0.05 : 0 // softer (was 0.12)
            const breathe = isIdle
                ? Math.sin(wobblePhase.current * 0.7) * 0.04
                : 0 // softer (was 0.09)

            // Click physics — same as before, that part wasn't twitchy
            clickPulse.current *= 0.85
            clickAnticipation.current *= 0.8
            const anticipationScale = 1 + clickAnticipation.current * 0.2
            const clickShrink = 1 - clickPulse.current * 0.32

            let finalStretch, finalSquash
            if (isIdle) {
                finalStretch = (1 + wobble) * clickShrink * anticipationScale
                finalSquash = (1 + breathe) * clickShrink * anticipationScale
            } else {
                finalStretch = stretchAmount * clickShrink * anticipationScale
                finalSquash = squashAmount * clickShrink * anticipationScale
            }

            // Apply to main cursor (NO MORE fidget offset)
            if (cursorRef.current) {
                cursorRef.current.style.transform =
                    `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0) ` +
                    `translate(-50%, -50%) ` +
                    `rotate(${angle}deg) ` +
                    `scale(${finalStretch}, ${finalSquash})`
            }

            // Ghost cursor — also smoother
            if (ghostRef.current) {
                const ghostSpeed = Math.sqrt(
                    ghostVelocity.current.x * ghostVelocity.current.x +
                        ghostVelocity.current.y * ghostVelocity.current.y
                )
                const ghostAngle =
                    Math.atan2(
                        ghostVelocity.current.y,
                        ghostVelocity.current.x
                    ) *
                    (180 / Math.PI)
                const ghostStretch = Math.min(1 + ghostSpeed * 0.06, 2.8)
                const ghostSquash = Math.max(1 - ghostSpeed * 0.035, 0.5)

                ghostRef.current.style.transform =
                    `translate3d(${ghostPos.current.x}px, ${ghostPos.current.y}px, 0) ` +
                    `translate(-50%, -50%) ` +
                    `rotate(${ghostAngle}deg) ` +
                    `scale(${ghostStretch}, ${ghostSquash})`
            }

            animationRef.current = requestAnimationFrame(animate)
        }
        animate()

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("mousedown", handleMouseDown)
            cancelAnimationFrame(animationRef.current)
            document.body.style.cursor = ""
            styleEl.remove()
        }
    }, [])

    if (!isVisible) return null

    let size = 22
    let bg = props.color
    let border = "none"
    let ghostBorderWidth = 1.5

    if (isHovering) {
        size = 56
        bg = "transparent"
        border = `2.5px solid ${props.color}`
        ghostBorderWidth = 1.2
    }

    return (
        <>
            <div
                ref={ghostRef}
                style={{
                    position: "fixed",
                    left: 0,
                    top: 0,
                    width: size,
                    height: size,
                    backgroundColor: "transparent",
                    border: `${ghostBorderWidth}px solid ${props.color}`,
                    borderRadius: "50%",
                    pointerEvents: "none",
                    zIndex: 99998,
                    opacity: 0.25,
                    transition:
                        "width 0.55s cubic-bezier(0.34, 1.5, 0.5, 1), " +
                        "height 0.55s cubic-bezier(0.34, 1.5, 0.5, 1), " +
                        "border 0.3s ease",
                    mixBlendMode: "difference",
                    willChange: "transform",
                }}
            />
            <div
                ref={cursorRef}
                style={{
                    position: "fixed",
                    left: 0,
                    top: 0,
                    width: size,
                    height: size,
                    backgroundColor: bg,
                    border: border,
                    borderRadius: "50%",
                    pointerEvents: "none",
                    zIndex: 99999,
                    transition:
                        "width 0.55s cubic-bezier(0.34, 1.6, 0.5, 1), " +
                        "height 0.55s cubic-bezier(0.34, 1.6, 0.5, 1), " +
                        "background-color 0.25s ease, " +
                        "border 0.25s ease",
                    mixBlendMode: "difference",
                    willChange: "transform",
                }}
            />
        </>
    )
}

addPropertyControls(CustomCursor, {
    color: {
        type: ControlType.Color,
        title: "Color",
        defaultValue: "#F7F6F2",
    },
})
