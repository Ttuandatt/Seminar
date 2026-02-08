import re
import csv
from pathlib import Path

def remove_emojis(text):
    """Remove emoji characters from text"""
    emoji_pattern = re.compile("["
        u"\U0001F600-\U0001F64F"
        u"\U0001F300-\U0001F5FF"
        u"\U0001F680-\U0001F6FF"
        u"\U0001F1E0-\U0001F1FF"
        u"\U00002702-\U000027B0"
        u"\U000024C2-\U0001F251"
        u"\U0001F900-\U0001F9FF"
        u"\U00002600-\U000026FF"
        u"\U00002700-\U000027BF"
        u"\U0001FA00-\U0001FA6F"
        u"\U0001FA70-\U0001FAFF"
        u"\U00002B50"
        u"\U0001F4CB-\U0001F4DD"
        u"\U0001F4A1"
        u"\U00002705"
        u"\U0000274C"
        u"\U00002610"  # checkbox empty
        u"\U00002611"  # checkbox checked
        "]+", flags=re.UNICODE)
    result = emoji_pattern.sub('', text)
    # Also remove common text checkboxes
    result = re.sub(r'☐|☑|✅|❌|✓|✗', '', result)
    return result.strip()

def parse_markdown_to_csv(md_content):
    """Parse markdown content to structured data for CSV"""
    lines = md_content.split('\n')
    data = []
    
    current_h1 = ""
    current_h2 = ""
    current_h3 = ""
    content_buffer = []
    in_table = False
    table_lines = []
    
    def flush_content():
        nonlocal content_buffer
        if content_buffer:
            # Join text content
            text = ' '.join(content_buffer)
            text = remove_emojis(text)
            if text.strip():
                section = current_h3 or current_h2 or current_h1 or "General"
                data.append({
                    'type': 'text',
                    'section': remove_emojis(section),
                    'content': text
                })
            content_buffer = []
    
    def flush_table():
        nonlocal table_lines, in_table
        if table_lines and len(table_lines) > 1:
            section = current_h3 or current_h2 or current_h1 or "General"
            rows = []
            for line in table_lines:
                if re.match(r'^[\|\s\-:]+$', line):
                    continue
                cells = [remove_emojis(cell.strip()) for cell in line.split('|')]
                cells = [c for c in cells if c]
                if cells:
                    rows.append(cells)
            if rows:
                data.append({
                    'type': 'table',
                    'section': remove_emojis(section),
                    'rows': rows
                })
        table_lines = []
        in_table = False
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        # Skip metadata and empty lines
        if stripped.startswith('>') or stripped.startswith('---') or not stripped:
            if in_table:
                flush_table()
            continue
        
        # Headers
        if stripped.startswith('# ') and not stripped.startswith('## '):
            flush_content()
            if in_table:
                flush_table()
            current_h1 = stripped.replace('# ', '')
            current_h2 = ""
            current_h3 = ""
        elif stripped.startswith('## '):
            flush_content()
            if in_table:
                flush_table()
            current_h2 = stripped.replace('## ', '')
            current_h3 = ""
        elif stripped.startswith('### '):
            flush_content()
            if in_table:
                flush_table()
            current_h3 = stripped.replace('### ', '')
        # Table detection
        elif '|' in stripped:
            flush_content()
            if not in_table:
                if i + 1 < len(lines) and '|' in lines[i+1] and '-' in lines[i+1]:
                    in_table = True
                    table_lines = [stripped]
                else:
                    # Single line with |, treat as text
                    content_buffer.append(stripped)
            else:
                table_lines.append(stripped)
        else:
            if in_table:
                flush_table()
            # Regular content (text, lists)
            if stripped.startswith('- ') or stripped.startswith('* '):
                content_buffer.append(stripped[2:])
            elif stripped:
                content_buffer.append(stripped)
    
    # Flush remaining
    flush_content()
    if in_table:
        flush_table()
    
    return data

def create_csv(data, output_path):
    """Create CSV from parsed data"""
    with open(output_path, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        
        current_section = ""
        for item in data:
            # Write section header if changed
            if item['section'] != current_section:
                if current_section:
                    writer.writerow([])  # Empty row between sections
                writer.writerow([item['section']])
                current_section = item['section']
            
            if item['type'] == 'text':
                writer.writerow([item['content']])
            elif item['type'] == 'table':
                for row in item['rows']:
                    writer.writerow(row)
        
    print(f"CSV saved: {output_path}")

def main():
    md_path = Path(r"d:\IT\Projects\Seminar\docs\02_scope_definition.md")
    output_path = md_path.parent / "02_scope_definition.csv"
    
    with open(md_path, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    data = parse_markdown_to_csv(md_content)
    print(f"Found {len(data)} content blocks")
    
    create_csv(data, output_path)
    print("Done!")

if __name__ == "__main__":
    main()
