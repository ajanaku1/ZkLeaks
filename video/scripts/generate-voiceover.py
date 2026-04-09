"""
Generate voiceover segments using Edge TTS (free, no API key),
then assemble into a single track aligned to the video timeline.

Usage:
  cd video && python3 scripts/generate-voiceover.py
"""

import os
import sys
import asyncio
import subprocess
import edge_tts

VOICE = "en-NG-AbeoNeural"  # Nigerian male — warm, authoritative
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "voiceover")
VIDEO_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "out", "zkleaks-demo-v2.mp4")
FINAL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "out", "zkleaks-demo-final.mp4")

FPS = 30
MIN_GAP_FRAMES = 12  # minimum 0.4s gap between segments

# ── Voiceover segments ──
# (start_frame, text, rate_adjustment, scene_end_frame)
# scene_end_frame = hard deadline — segment must not bleed into next scene
# rate: "+10%" = faster, "-10%" = slower
SEGMENTS = [
    # Scene 1: Hook (0-480) — Redacted docs, $47M, consequences
    # Visuals: document fragments floating in, giant red number pulsing
    (20,
     "Forty-seven million dollars, gone, buried in a ledger no one was supposed to open",
     "+15%", 185),
    # Visuals: "You saw something you weren't supposed to see" typing out
    (215,
     "But you opened it, and now you can't unsee it",
     "+15%", 330),
    # Visuals: Fired. Blacklisted. Sued. Endangered. cascading
    (355,
     "Report it and they'll destroy you, stay silent and they'll do it again",
     "+10%", 475),

    # Scene 2: Contrast (480-840) — Headlines, "anonymous" struck through, pivot
    # Visuals: news headlines cascading with red borders, 83% stat
    (505,
     "Eighty-three percent of whistleblowers face retaliation, that's not a risk, that's a guarantee",
     "+20%", 635),
    # Visuals: strike-through on "anonymous reporting"
    (650,
     "Every tip line, every hotline, every so-called safe channel, they all leave a trail",
     "+20%", 760),
    # Visuals: "What if..." typed in gold
    (775,
     "So what if the math could protect you instead",
     "+10%", 835),

    # Scene 3: ProductIntro (840-1200) — Logo glow, tagline, terminal pillars
    # Visuals: zk//LEAKS logo materializing with glow
    (870,
     "zk Leaks",
     "-5%", 935),
    # Visuals: terminal cards with commands typing
    (960,
     "Cryptographic proof that you belong, with zero trace of who you are",
     "+15%", 1065),
    (1085,
     "Not trust, not policy, math",
     "+5%", 1195),

    # Scene 4: FeatureShowcase (1200-1830) — Terminal proof, feed with verified badge
    # Visuals: "EMPLOYEE #4721 SUBMITS A REPORT" label, terminal typing
    (1230,
     "Let's say you're employee forty-seven twenty-one, you connect your wallet",
     "+20%", 1350),
    # Visuals: membership token loading, proof progress bar
    (1370,
     "Your token proves you're inside, but the chain never learns your name",
     "+15%", 1490),
    # Visuals: progress bar hits 100%, [ZK] Proof generated, [TX] CONFIRMED
    (1510,
     "Zero bits of identity revealed, that's not a slogan, that's the cryptography",
     "+15%", 1640),
    # Visuals: report card with ZK VERIFIED badge stamping on, corroboration counter
    (1660,
     "And when three more insiders confirm it, the world listens",
     "+10%", 1825),

    # Scene 5: HowItWorks (1830-2250) — 4-step protocol with flow lines
    # Visuals: step cards animating in with connection arrows
    (1860,
     "The protocol is four steps",
     "+15%", 1945),
    (1965,
     "Register the org, distribute private tokens that never touch the chain",
     "+20%", 2085),
    (2100,
     "When someone speaks up, the wallet does the proving, a nullifier seals the door behind them",
     "+25%", 2210),

    # Scene 6: ArchFlash (2250-2550) — Client vs on-chain with data particles
    # Visuals: animated particles flowing from client to on-chain
    (2280,
     "Leo handles the proofs, Aleo verifies them, your identity never crosses the gap",
     "+20%", 2545),

    # Scene 7: Close (2550-3250) — Outcome, stats, CTA
    # Visuals: "The fraud was exposed" typing, "never identified" in green
    (2585,
     "The money was found",
     "+5%", 2655),
    (2685,
     "The insider was never found",
     "+5%", 2780),
    # Visuals: stats counters, 0 identities leaked glowing green
    (2810,
     "Forty-seven reports on the chain, zero names in the open",
     "+10%", 2985),
    # Visuals: logo with corner brackets, tagline, tech badges
    (3015,
     "zk Leaks, because the truth shouldn't cost you everything",
     "+5%", 3120),
    (3140,
     "Built on Aleo",
     "+5%", 3245),
]


async def generate_segment(text: str, output_path: str, rate: str = "+0%"):
    """Generate a single TTS segment."""
    communicate = edge_tts.Communicate(text, VOICE, rate=rate)
    await communicate.save(output_path)


def get_duration(path: str) -> float:
    """Get audio duration in seconds via ffprobe."""
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
         "-of", "csv=p=0", path],
        capture_output=True, text=True
    )
    return float(result.stdout.strip())


async def generate_all():
    """Generate all segments, then fix overlaps."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"Voice: {VOICE}")
    print(f"Segments: {len(SEGMENTS)}")
    print(f"\nPass 1: Generating audio...\n")

    entries = []
    for i, (start_frame, text, rate, scene_end) in enumerate(SEGMENTS):
        out_file = os.path.join(OUTPUT_DIR, f"seg_{i:02d}.mp3")
        try:
            await generate_segment(text, out_file, rate)
            dur = get_duration(out_file)
            print(f"  [OK] seg_{i:02d} ({dur:.1f}s): \"{text[:55]}...\"")
            entries.append({
                "file": out_file,
                "ideal_start": start_frame,
                "scene_end": scene_end,
                "duration": dur,
                "dur_frames": int(dur * FPS),
            })
        except Exception as e:
            print(f"  [FAIL] seg_{i:02d}: {e}")

    # Pass 2: Fix overlaps — push start frames forward when needed
    print(f"\nPass 2: Fixing overlaps...\n")
    for i in range(len(entries)):
        e = entries[i]
        if i == 0:
            e["actual_start"] = e["ideal_start"]
        else:
            prev = entries[i - 1]
            earliest = prev["actual_start"] + prev["dur_frames"] + MIN_GAP_FRAMES
            e["actual_start"] = max(e["ideal_start"], earliest)

        end_frame = e["actual_start"] + e["dur_frames"]
        shifted = e["actual_start"] - e["ideal_start"]
        flag = ""
        if shifted > 0:
            flag = f" (shifted +{shifted}f)"
        if end_frame > e["scene_end"]:
            flag += f" !! BLEEDS past scene end {e['scene_end']}"
        print(f"  seg_{i:02d}: {e['actual_start']/30:.1f}s -> {end_frame/30:.1f}s{flag}")

    return entries


def assemble_voiceover(entries):
    """Combine individual segments into one audio track using ffmpeg."""
    combined_path = os.path.join(OUTPUT_DIR, "combined.mp3")

    inputs = []
    filter_parts = []
    mix_inputs = ""

    for i, e in enumerate(entries):
        delay_ms = int((e["actual_start"] / FPS) * 1000)
        inputs.extend(["-i", e["file"]])
        filter_parts.append(f"[{i}]adelay={delay_ms}|{delay_ms}[d{i}]")
        mix_inputs += f"[d{i}]"

    n = len(entries)
    filter_parts.append(f"{mix_inputs}amix=inputs={n}:duration=longest:dropout_transition=0[out]")
    filter_str = ";".join(filter_parts)

    cmd = ["ffmpeg", "-y"] + inputs + [
        "-filter_complex", filter_str,
        "-map", "[out]",
        "-ac", "1",
        "-ar", "44100",
        "-b:a", "192k",
        combined_path
    ]

    print(f"\nAssembling {n} segments...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  [ERROR] ffmpeg: {result.stderr[-500:]}")
        sys.exit(1)
    size_kb = os.path.getsize(combined_path) / 1024
    print(f"  [OK] {combined_path} ({size_kb:.0f} KB)")
    return combined_path


def merge_with_video(audio_path):
    """Merge voiceover audio with the rendered video."""
    print(f"\nMerging audio with video...")
    cmd = [
        "ffmpeg", "-y",
        "-i", VIDEO_PATH,
        "-i", audio_path,
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-shortest",
        FINAL_PATH
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  [ERROR] ffmpeg: {result.stderr[-500:]}")
        sys.exit(1)
    size_mb = os.path.getsize(FINAL_PATH) / (1024 * 1024)
    print(f"  [OK] {FINAL_PATH} ({size_mb:.1f} MB)")


def main():
    entries = asyncio.run(generate_all())

    if not entries:
        print("No segments generated.")
        sys.exit(1)

    combined = assemble_voiceover(entries)
    merge_with_video(combined)
    print(f"\nDone! Final video: {FINAL_PATH}")


if __name__ == "__main__":
    main()
