#!/usr/bin/env python3
"""Validate the SVG contract emitted by lively-mascot-image-model."""

from __future__ import annotations

import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


BAD_TAGS = {"script", "foreignObject", "iframe", "object", "embed", "form", "input", "button"}
BAD_ATTRS = {"src", "srcset", "action", "formaction", "target", "download"}


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: validate_model.py model.svg", file=sys.stderr)
        return 2
    path = Path(sys.argv[1])
    if not path.is_file():
        fail(f"file not found: {path}")
    try:
        root = ET.parse(path).getroot()
    except ET.ParseError as exc:
        fail(f"invalid XML: {exc}")
    if local_name(root.tag) != "svg":
        fail("root element must be <svg>")
    if root.get("viewBox") != "0 0 100 100":
        fail('root viewBox must be exactly "0 0 100 100"')

    markers = {name: 0 for name in ("body", "face", "eye", "pupil", "leaf", "feet")}
    ids = set()
    bad_tags = {tag.lower() for tag in BAD_TAGS}
    bad_attrs = {attr.lower() for attr in BAD_ATTRS}
    for element in root.iter():
        tag = local_name(element.tag)
        if tag.lower() in bad_tags:
            fail(f"blocked element <{tag}>")
        if element.get("id"):
            if element.get("id") in ids:
                fail(f"duplicate id: {element.get('id')}")
            ids.add(element.get("id"))
        for raw_name, value in element.attrib.items():
            name = local_name(raw_name).lower()
            if name.startswith("on") or name in bad_attrs:
                fail(f"blocked attribute {raw_name}")
            if re.search(r"(?:javascript|vbscript|data:text/html):", value, re.I):
                fail(f"unsafe URL in {raw_name}")
            if re.search(r"url\(\s*(['\"]?)(?!#)", value, re.I):
                fail(f"external url() reference in {raw_name}")
        for marker in markers:
            if element.get(f"data-lively-{marker}") is not None:
                markers[marker] += 1

    if markers["body"] != 1:
        fail("expected exactly one data-lively-body marker")
    if markers["eye"] != markers["pupil"]:
        fail("each data-lively-eye must have a matching data-lively-pupil")
    if markers["eye"] == 0:
        print("WARNING: model has no eyes/pupils; gaze and blink will be unavailable")
    print(f"OK: {path} markers={markers}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
