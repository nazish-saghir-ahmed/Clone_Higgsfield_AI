import os
import sys
import json
import re
from datetime import datetime

def clean_prompt(raw_text):
    if not raw_text:
        return ""
    # Extract from <USER_REQUEST> if present
    match = re.search(r'<USER_REQUEST>\s*(.*?)\s*</USER_REQUEST>', raw_text, re.DOTALL)
    if match:
        text = match.group(1)
    else:
        text = re.sub(r'<ADDITIONAL_METADATA>.*', '', raw_text, flags=re.DOTALL)
        text = re.sub(r'<USER_SETTINGS_CHANGE>.*', '', text, flags=re.DOTALL)
    return text.strip()

def process_transcript(transcript_path, session_id=None, workspace_dir=".", model_name="gemini-3.7-flash", author="Nazish"):
    if not transcript_path or not os.path.exists(transcript_path):
        dir_name = os.path.dirname(transcript_path) if transcript_path else ""
        if dir_name:
            full_path = os.path.join(dir_name, "transcript_full.jsonl")
            if os.path.exists(full_path):
                transcript_path = full_path
    else:
        dir_name = os.path.dirname(transcript_path)
        full_path = os.path.join(dir_name, "transcript_full.jsonl")
        if os.path.exists(full_path):
            transcript_path = full_path

    if not transcript_path or not os.path.exists(transcript_path):
        return

    steps = []
    with open(transcript_path, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    steps.append(json.loads(line))
                except Exception:
                    pass

    if not steps:
        return

    exchanges = []
    current_prompt = None
    current_prompt_time = None
    last_response_text = ""
    last_response_time = ""

    for step in steps:
        step_type = step.get("type")
        source = step.get("source")
        created_at = step.get("created_at", "")

        if source == "USER_EXPLICIT" or step_type == "USER_INPUT":
            if current_prompt is not None:
                exchanges.append({
                    "prompt": current_prompt,
                    "prompt_time": current_prompt_time,
                    "response": last_response_text,
                    "response_time": last_response_time or current_prompt_time
                })
            current_prompt = clean_prompt(step.get("content", ""))
            current_prompt_time = created_at
            last_response_text = ""
            last_response_time = ""
        elif step_type == "PLANNER_RESPONSE" or source == "MODEL":
            content = step.get("content")
            if content and isinstance(content, str) and content.strip():
                if not content.startswith("Created At:") and not content.startswith("Tool is running"):
                    last_response_text = content.strip()
                    last_response_time = created_at

    if current_prompt is not None:
        exchanges.append({
            "prompt": current_prompt,
            "prompt_time": current_prompt_time,
            "response": last_response_text,
            "response_time": last_response_time or current_prompt_time
        })

    if not exchanges:
        return

    if not session_id:
        match = re.search(r'brain[\\/]([a-f0-9\-]+)', transcript_path)
        if match:
            session_id = match.group(1)
        else:
            session_id = "unknown-session"

    short_session_id = session_id[:8]
    first_time = exchanges[0]["prompt_time"] or datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    last_time = exchanges[-1]["prompt_time"] or first_time

    try:
        date_str = first_time[:10]
    except Exception:
        date_str = datetime.utcnow().strftime("%Y-%m-%d")

    try:
        dt = datetime.fromisoformat(first_time.replace("Z", "+00:00"))
        time_fn = dt.strftime("%Y-%m-%d_%H-%M-%S")
    except Exception:
        time_fn = datetime.utcnow().strftime("%Y-%m-%d_%H-%M-%S")

    project_name = os.path.basename(os.path.abspath(workspace_dir)) or "Aether AI"

    lines = []
    lines.append("---")
    lines.append(f"session_id: {session_id}")
    lines.append(f"date: {date_str}")
    lines.append(f"author: {author}")
    lines.append(f"model: {model_name}")
    lines.append("tool: antigravity")
    lines.append(f"total_exchanges: {len(exchanges)}")
    lines.append(f"first_prompt_time: {first_time}")
    lines.append(f"last_prompt_time: {last_time}")
    lines.append("---")
    lines.append("")
    lines.append(f"# Session Log - {date_str}")
    lines.append("")
    lines.append(f"Session: `{short_session_id}` | Project: `{project_name}` | Author: `{author}`")
    lines.append("")
    lines.append("---")
    lines.append("")

    for i, ex in enumerate(exchanges, start=1):
        lines.append(f"[LOG_ENTRY type=PROMPT num={i} session={short_session_id}]")
        lines.append(f"timestamp: {ex['prompt_time']}")
        lines.append(f"model: {model_name}")
        lines.append("")
        lines.append(ex["prompt"])
        lines.append("")
        lines.append("")
        lines.append(f"[LOG_ENTRY type=RESPONSE num={i} session={short_session_id}]")
        lines.append(f"timestamp: {ex['response_time']}")
        lines.append(f"model: {model_name}")
        lines.append("")
        lines.append(ex["response"] if ex["response"] else "(Turn in progress...)")
        lines.append("")
        lines.append("")

    content_str = "\n".join(lines)

    logs_dir = os.path.join(workspace_dir, ".agent-logs")
    os.makedirs(logs_dir, exist_ok=True)

    filename = f"{time_fn}_{session_id}.md"
    file_path = os.path.join(logs_dir, filename)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content_str)

    return file_path

def main():
    payload = {}
    if not sys.stdin.isatty():
        try:
            stdin_data = sys.stdin.read()
            if stdin_data.strip():
                payload = json.loads(stdin_data)
        except Exception:
            pass

    transcript_path = payload.get("transcriptPath")
    workspace_paths = payload.get("workspacePaths", [])
    workspace_dir = workspace_paths[0] if workspace_paths else os.getcwd()
    session_id = payload.get("conversationId")
    model_name = payload.get("modelName") or "gemini-3.7-flash"

    # Default fallback if run directly
    if not transcript_path and session_id:
        transcript_path = os.path.expanduser(f"~/.gemini/antigravity/brain/{session_id}/.system_generated/logs/transcript_full.jsonl")

    if transcript_path:
        process_transcript(transcript_path, session_id=session_id, workspace_dir=workspace_dir, model_name=model_name)

    # Return valid hook response
    print(json.dumps({}))

if __name__ == "__main__":
    main()
