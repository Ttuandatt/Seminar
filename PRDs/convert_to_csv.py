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
        u"\U00002610"
        u"\U00002611"
        "]+", flags=re.UNICODE)
    result = emoji_pattern.sub('', text)
    result = re.sub(r'☐|☑|✅|❌|✓|✗', '', result)
    return result.strip()

def parse_markdown_to_csv(md_content):
    """Parse markdown content preserving structure"""
    lines = md_content.split('\n')
    data = []
    
    current_h2 = ""
    current_h3 = ""
    current_h4 = ""
    in_table = False
    table_lines = []
    in_code_block = False
    
    def flush_table():
        nonlocal table_lines, in_table
        if table_lines and len(table_lines) > 1:
            rows = []
            for line in table_lines:
                if re.match(r'^[\|\s\-:]+$', line):
                    continue
                cells = [remove_emojis(cell.strip()) for cell in line.split('|')]
                cells = [c for c in cells if c]
                if cells:
                    rows.append(cells)
            if rows:
                data.append({'type': 'table', 'rows': rows})
        table_lines = []
        in_table = False
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        # Track code blocks
        if stripped.startswith('```'):
            if not in_code_block:
                # Starting a code block
                in_code_block = True
                code_block_type = stripped.replace('```', '').strip()  # e.g., 'gherkin', 'python', ''
                code_block_content = []
            else:
                # Ending a code block
                in_code_block = False
                if code_block_type in ['mermaid', 'plantuml', 'diagram']:
                    data.append({'type': 'text', 'content': '[Diagram]'})
                elif code_block_type in ['gherkin', '', 'text']:
                    # Preserve gherkin/plain text content
                    content = '\n'.join(code_block_content)
                    if content.strip():
                        data.append({'type': 'text', 'content': content})
                else:
                    # Other code blocks (python, etc.) - show as code
                    content = '\n'.join(code_block_content)
                    if content.strip():
                        data.append({'type': 'text', 'content': f'[Code: {code_block_type}]\n{content}'})
                code_block_content = []
            continue
        
        if in_code_block:
            code_block_content.append(line)
            continue  # Collect code block content
        
        # Skip metadata
        if stripped.startswith('>') or stripped == '---':
            if in_table:
                flush_table()
            continue
        
        # Empty line
        if not stripped:
            if in_table:
                flush_table()
            continue
        
        # Headers - H2 (## )
        if stripped.startswith('## '):
            if in_table:
                flush_table()
            current_h2 = remove_emojis(stripped.replace('## ', ''))
            current_h3 = ""
            current_h4 = ""
            data.append({'type': 'h2', 'content': current_h2})
            
        # Headers - H3 (### )
        elif stripped.startswith('### '):
            if in_table:
                flush_table()
            current_h3 = remove_emojis(stripped.replace('### ', ''))
            current_h4 = ""
            data.append({'type': 'h3', 'content': current_h3})
            
        # Headers - H4 (#### )
        elif stripped.startswith('#### '):
            if in_table:
                flush_table()
            current_h4 = remove_emojis(stripped.replace('#### ', ''))
            data.append({'type': 'h4', 'content': current_h4})
            
        # Table detection
        elif '|' in stripped:
            if not in_table:
                if i + 1 < len(lines) and '|' in lines[i+1] and '-' in lines[i+1]:
                    in_table = True
                    table_lines = [stripped]
                else:
                    data.append({'type': 'text', 'content': remove_emojis(stripped)})
            else:
                table_lines.append(stripped)
                
        # Bold headers like **Goals:**
        elif stripped.startswith('**') and stripped.endswith(':**'):
            if in_table:
                flush_table()
            header = remove_emojis(stripped.replace('**', '').replace(':', ''))
            data.append({'type': 'subheader', 'content': header})
            
        # Numbered list like 1. 2. 3.
        elif re.match(r'^\d+\.', stripped):
            content = remove_emojis(re.sub(r'^\d+\.\s*', '', stripped))
            data.append({'type': 'numbered', 'content': content})
            
        # Bullet list
        elif stripped.startswith('- ') or stripped.startswith('* '):
            content = remove_emojis(stripped[2:])
            data.append({'type': 'bullet', 'content': content})
            
        # Regular text
        elif stripped:
            data.append({'type': 'text', 'content': remove_emojis(stripped)})
    
    # Flush remaining table
    if in_table:
        flush_table()
    
    return data

def create_csv(data, output_path):
    """Create CSV from parsed data with proper structure"""
    with open(output_path, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        
        for item in data:
            if item['type'] == 'h2':
                writer.writerow([])
                writer.writerow([item['content']])
            elif item['type'] == 'h3':
                writer.writerow([])
                writer.writerow(['  ' + item['content']])
            elif item['type'] == 'h4':
                writer.writerow(['    ' + item['content']])
            elif item['type'] == 'subheader':
                writer.writerow([item['content'] + ':'])
            elif item['type'] == 'bullet':
                writer.writerow(['  - ' + item['content']])
            elif item['type'] == 'numbered':
                writer.writerow(['  ' + item['content']])
            elif item['type'] == 'table':
                for row in item['rows']:
                    writer.writerow(row)
            elif item['type'] == 'text':
                writer.writerow([item['content']])
        
    print(f"CSV saved: {output_path}")

def main():
    files = [
        ("00_requirements_intake", r"d:\IT\Projects\Seminar\PRDs"),
        ("01_executive_summary", r"d:\IT\Projects\Seminar\PRDs"),
        ("02_scope_definition", r"d:\IT\Projects\Seminar\PRDs"),
        ("03_user_personas_roles", r"d:\IT\Projects\Seminar\PRDs"),
        ("04_user_stories", r"d:\IT\Projects\Seminar\PRDs"),
        ("05_functional_requirements", r"d:\IT\Projects\Seminar\PRDs"),
        ("06_acceptance_criteria", r"d:\IT\Projects\Seminar\PRDs"),
        ("07_non_functional_requirements", r"d:\IT\Projects\Seminar\PRDs"),
        ("08_data_requirements", r"d:\IT\Projects\Seminar\PRDs"),
        ("09_api_specifications", r"d:\IT\Projects\Seminar\PRDs"),
        ("10_ui_ux_specifications", r"d:\IT\Projects\Seminar\PRDs"),
        ("11_business_rules", r"d:\IT\Projects\Seminar\PRDs"),
        ("12_technical_constraints", r"d:\IT\Projects\Seminar\PRDs"),
        ("13_dependencies_risks", r"d:\IT\Projects\Seminar\PRDs"),
        ("14_usecase_diagram", r"d:\IT\Projects\Seminar\PRDs"),
        ("15_sequence_diagrams", r"d:\IT\Projects\Seminar\PRDs"),
        ("16_activity_diagrams", r"d:\IT\Projects\Seminar\PRDs"),
        ("17_component_diagram", r"d:\IT\Projects\Seminar\PRDs"),
    ]
    for name, folder in files:
        md_path = Path(folder) / f"{name}.md"
        output_path = Path(r"d:\IT\Projects\Seminar\PRDs") / f"{name}.csv"
    
        with open(md_path, 'r', encoding='utf-8') as f:
            md_content = f.read()
    
        data = parse_markdown_to_csv(md_content)
        print(f"[{name}] Found {len(data)} content blocks")
    
        create_csv(data, output_path)
    print("Done!")

if __name__ == "__main__":
    main()
