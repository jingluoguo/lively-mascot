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


def contains_body_tilt(transform: str | None) -> bool:
    return bool(transform and re.search(r"\b(?:rotate|skew(?:X|Y)?)\s*\(", transform, re.I))


def validate_css(path: Path, has_eyes: bool) -> None:
    if not path.is_file():
        fail(f"CSS file not found: {path}")
    css = path.read_text(encoding="utf-8")
    if "--lively-depth-transform: none" in css:
        fail("custom models must not disable the SDK 3D posture layer")
    if "lively-mascot--2d" not in css or "lively-mascot--3d" not in css:
        fail("CSS must define both model-scoped 2D and 3D artwork rules")
    if len(re.findall(r"\btranslateZ\(\s*(?!0(?:px)?\s*\))[^)]*\)", css)) < 2:
        fail("3D CSS must provide at least two raised SVG artwork layers with nonzero translateZ")
    if "-plane" not in css and "-depth" not in css:
        fail("3D CSS must name independent artwork planes instead of relying on a flat SVG group")
    if "depth-shell" not in css or "depth-plane" not in css:
        fail("3D CSS must include a named visible depth-shell plane")
    if not re.search(r"lively-mascot--3d[^{}]*depth-plane[^{}]*\{[^{}]*(?:display\s*:\s*(?:block|inline)|opacity\s*:\s*[1-9])", css, re.S):
        fail("3D CSS must reveal the depth-shell plane")
    if not has_eyes:
        return
    if not re.search(r"is-emotion-35[^{}]*(?:tear|tears)[^{}]*\{[^{}]*\banimation\s*:", css, re.S):
        fail("crying emotion 35 must animate a local tear accessory")
    if not re.search(r"is-emotion-37[^{}]*sweat[^{}]*\{[^{}]*\banimation\s*:", css, re.S):
        fail("nervous emotion 37 must animate a local sweat accessory")


def main() -> int:
    if len(sys.argv) not in (2, 3):
        print("usage: validate_model.py model.svg [model.css]", file=sys.stderr)
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
    if contains_body_tilt(root.get("transform")):
        fail("SVG root must not rotate or skew")

    markers = {name: 0 for name in ("body", "face", "eye", "pupil", "leaf", "feet")}
    ids = set()
    elements = list(root.iter())
    id_elements = {element.get("id"): element for element in elements if element.get("id")}
    parents = {child: parent for parent in elements for child in list(parent)}
    nested_svg_count = sum(1 for element in elements[1:] if local_name(element.tag).lower() == "svg")
    if nested_svg_count < 2:
        fail("3D-compatible SVG models must contain at least two independent nested SVG artwork planes")
    bad_tags = {tag.lower() for tag in BAD_TAGS}
    bad_attrs = {attr.lower() for attr in BAD_ATTRS}
    for element in elements:
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
        if element.get("data-lively-body") is not None and contains_body_tilt(element.get("transform")):
            fail("data-lively-body must not rotate or skew")
        if element.get("data-lively-pupil") is not None:
            for axis in ("x", "y"):
                raw_max = element.get(f"data-max-{axis}")
                if raw_max is None:
                    fail(f"each data-lively-pupil must declare data-max-{axis}")
                try:
                    max_value = float(raw_max)
                except ValueError:
                    fail(f"data-max-{axis} must be numeric on data-lively-pupil")
                if max_value <= 0 or max_value > 8:
                    fail(f"data-max-{axis} must be greater than 0 and no more than 8")
            # The rig moves this marker itself. Its clipping geometry must be
            # owned by a stable ancestor, otherwise the pupil can leave the eye.
            clip = ""
            ancestor = element
            while not clip and ancestor in parents:
                ancestor = parents[ancestor]
                clip = ancestor.get("clip-path", "")
            match = re.fullmatch(r"url\(\s*#([A-Za-z_][\w:.-]*)\s*\)", clip)
            if not match:
                fail("each data-lively-pupil must be inside a stable ancestor with a local clip-path")
            clip_id = match.group(1)
            clip_element = id_elements.get(clip_id)
            if clip_element is None or local_name(clip_element.tag).lower() != "clippath":
                fail(f"pupil clip-path must reference a local <clipPath>: {clip_id}")
            if not any(local_name(child.tag).lower() in {"ellipse", "circle", "path"} for child in clip_element.iter() if child is not clip_element):
                fail(f"pupil clipPath has no visible opening geometry: {clip_id}")

    if markers["body"] != 1:
        fail("expected exactly one data-lively-body marker")
    if markers["eye"] != markers["pupil"]:
        fail("each data-lively-eye must have a matching data-lively-pupil")
    if markers["eye"] == 0:
        print("WARNING: model has no eyes/pupils; gaze and blink will be unavailable")
    if len(sys.argv) == 3:
        validate_css(Path(sys.argv[2]), markers["eye"] > 0)
    print(f"OK: {path} markers={markers}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
