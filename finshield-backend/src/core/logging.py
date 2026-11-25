import logging
import re

# VPA such as alice@bank -> keep first 2 chars of the local part.
_VPA_RE = re.compile(r"\b([A-Za-z0-9._-]{2})[A-Za-z0-9._-]*@([A-Za-z][A-Za-z0-9]+)\b")
# OTP / token style key=value or "key": "value" pairs.
_SECRET_RE = re.compile(
    r"""(?P<key>["']?(?:simulated_otp|otp|token)["']?\s*[:=]\s*)(?P<q>["']?)[^\s,"'}]+(?P=q)""",
    re.IGNORECASE,
)


def mask_pii(text: str) -> str:
    """Mask VPAs and OTP/token values in free text."""
    text = _SECRET_RE.sub(lambda m: f"{m['key']}{m['q']}***{m['q']}", text)
    return _VPA_RE.sub(lambda m: f"{m.group(1)}***@{m.group(2)}", text)


class PiiMaskingFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.msg = mask_pii(record.getMessage())
        record.args = None
        return True


def setup_logging(level: int = logging.INFO) -> None:
    handler = logging.StreamHandler()
    handler.addFilter(PiiMaskingFilter())
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s"))
    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(level)
