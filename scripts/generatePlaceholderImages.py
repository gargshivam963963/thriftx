#!/usr/bin/env python3
"""
THRIFTX — Generate per-SKU placeholder product images.

Writes simple colored PNGs (with a label) into scripts/bulk/images/ so the
storefront shows a distinct image per product while real photography is added.

Pure-stdlib PNG writer (no PIL dependency required).
"""
import os
import struct
import zlib

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bulk", "images")

SKUS = [
    ("TX001", "Levi's 501", "#2E5B8A"),
    ("TX002", "Nike AF1", "#F5F5F5"),
    ("TX003", "Adidas Hoodie", "#1F1F1F"),
    ("TX004", "Polo Shirt", "#2E6FB0"),
    ("TX005", "Carhartt Cargo", "#5C6B3C"),
    ("TX006", "North Face", "#232323"),
    ("TX007", "Vintage Tee", "#4A2E2E"),
    ("TX008", "Levi's Trucker", "#3A6B9B"),
    ("TX009", "Zara Dress", "#3B3B3B"),
    ("TX010", "H&M Floral", "#C77B8F"),
    ("TX011", "Levi's Women", "#6B8FC0"),
    ("TX012", "Adidas Jacket", "#1B1B1B"),
    ("TX013", "Zara Skirt", "#C9A96E"),
    ("TX014", "Nike Kids", "#2E8B57"),
    ("TX015", "Adidas Kids", "#F0F0F0"),
    ("TX016", "Polo Kids", "#1F3A93"),
    ("TX017", "Essentials", "#9E9E9E"),
    ("TX018", "Bomber", "#7B4A2B"),
    ("TX019", "Champion", "#1B1B1B"),
    ("TX020", "Champion Red", "#B22222"),
]

W, H = 800, 1000


def make_png(path, rgb, label):
    """Write a minimal RGB PNG with a label bar."""
    r, g, b = rgb

    def px(x, y):
        # Dark bottom bar for label
        if y > H - 140:
            return (18, 18, 18)
        # Slight vertical gradient on the body
        shade = 1.0 - (y / H) * 0.35
        return (int(r * shade), int(g * shade), int(b * shade))

    rows = []
    for y in range(H):
        row = bytearray([0])  # filter type 0
        for x in range(W):
            pr, pg, pb = px(x, y)
            row += bytes((pr, pg, pb))
        rows.append(bytes(row))

    raw = b"".join(rows)

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", W, H, 8, 2, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw, 9))
    png += chunk(b"IEND", b"")

    with open(path, "wb") as f:
        f.write(png)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for sku, label, hexcolor in SKUS:
        rgb = (
            int(hexcolor[1:3], 16),
            int(hexcolor[3:5], 16),
            int(hexcolor[5:7], 16),
        )
        path = os.path.join(OUT_DIR, f"{sku}-1.png")
        make_png(path, rgb, label)
        print(f"✅ wrote {os.path.relpath(path)}")


if __name__ == "__main__":
    main()

