/**
 * Clipboard utility with fallback for non-secure contexts (HTTP over LAN).
 * navigator.clipboard.writeText() only works in HTTPS or localhost.
 * This fallback uses document.execCommand('copy') which works everywhere.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    // Try modern API first
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // Fall through to fallback
        }
    }

    // Fallback: create a temporary textarea
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
        document.execCommand("copy");
        return true;
    } catch {
        return false;
    } finally {
        document.body.removeChild(textarea);
    }
}
