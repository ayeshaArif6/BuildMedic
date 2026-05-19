ERROR_KEYWORDS = [
    "error",
    "failed",
    "failure",
    "exception",
    "traceback",
    "cannot find module",
    "module not found",
    "npm err",
    "build failed",
    "compilation failed",
    "test failed",
    "command failed",
    "exit code"
]

def extract_error_chunks(log_text: str, max_lines: int = 80) -> str:
    lines = log_text.splitlines()
    matched_indexes = []

    for i, line in enumerate(lines):
        lower_line = line.lower()
        if any(keyword in lower_line for keyword in ERROR_KEYWORDS):
            matched_indexes.append(i)

    if not matched_indexes:
        return "\n".join(lines[-max_lines:])

    selected_lines = []
    seen = set()

    for index in matched_indexes:
        start = max(0, index - 5)
        end = min(len(lines), index + 10)

        for line_number in range(start, end):
            if line_number not in seen:
                selected_lines.append(lines[line_number])
                seen.add(line_number)

    return "\n".join(selected_lines[-max_lines:])