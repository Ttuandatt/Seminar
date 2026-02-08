import re
import csv
from pathlib import Path

def remove_emojis(text):
    """Remove emoji characters from text"""
    emoji_pattern = re.compile("["
        u"\U0001F600-\U0001F64F"  # emoticons
        u"\U0001F300-\U0001F5FF"  # symbols & pictographs
        u"\U0001F680-\U0001F6FF"  # transport & map symbols
        u"\U0001F1E0-\U0001F1FF"  # flags
        u"\U00002702-\U000027B0"  # dingbats
        u"\U000024C2-\U0001F251"  # enclosed characters
        u"\U0001F900-\U0001F9FF"  # supplemental symbols
        u"\U00002600-\U000026FF"  # misc symbols
        u"\U00002700-\U000027BF"  # dingbats
        u"\U0001FA00-\U0001FA6F"  # chess symbols
        u"\U0001FA70-\U0001FAFF"  # symbols extended
        u"\U00002B50"             # star
        u"\U0001F4CB-\U0001F4DD"  # clipboard, memo
        u"\U0001F4A1"             # lightbulb
        "]+", flags=re.UNICODE)
    return emoji_pattern.sub('', text).strip()

def parse_markdown_tables(md_content):
    """Extract all tables from markdown content with their section headers"""
    tables = []
    lines = md_content.split('\n')
    
    current_section = ""
    current_subsection = ""
    current_subsubsection = ""
    table_lines = []
    in_table = False
    
    for i, line in enumerate(lines):
        if line.startswith('## '):
            current_section = remove_emojis(line.replace('## ', '').strip())
            current_subsection = ""
            current_subsubsection = ""
        elif line.startswith('### '):
            current_subsection = remove_emojis(line.replace('### ', '').strip())
            current_subsubsection = ""
        elif line.startswith('#### '):
            current_subsubsection = remove_emojis(line.replace('#### ', '').strip())
        
        if '|' in line and not in_table:
            if i + 1 < len(lines) and '|' in lines[i+1] and '-' in lines[i+1]:
                in_table = True
                table_lines = [line]
        elif in_table:
            if '|' in line:
                table_lines.append(line)
            else:
                if len(table_lines) > 1:
                    section_name = current_subsubsection or current_subsection or current_section
                    tables.append({
                        'section': current_section,
                        'subsection': current_subsection,
                        'subsubsection': current_subsubsection,
                        'name': section_name,
                        'lines': table_lines
                    })
                table_lines = []
                in_table = False
    
    if table_lines and len(table_lines) > 1:
        section_name = current_subsubsection or current_subsection or current_section
        tables.append({
            'section': current_section,
            'subsection': current_subsection,
            'subsubsection': current_subsubsection,
            'name': section_name,
            'lines': table_lines
        })
    
    return tables

def parse_table_to_rows(table_lines):
    """Convert markdown table lines to list of rows"""
    rows = []
    for line in table_lines:
        if re.match(r'^[\|\s\-:]+$', line):
            continue
        cells = [remove_emojis(cell.strip()) for cell in line.split('|')]
        cells = [c for c in cells if c or cells.index(c) not in [0, len(cells)-1]]
        if cells:
            rows.append(cells)
    return rows

def create_csv(tables, output_path):
    """Create single CSV file from all tables"""
    with open(output_path, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        
        for table in tables:
            rows = parse_table_to_rows(table['lines'])
            if not rows:
                continue
            
            section_name = table.get('subsubsection') or table.get('subsection') or table.get('section') or 'General'
            writer.writerow([section_name])
            
            for row in rows:
                writer.writerow(row)
            
            writer.writerow([])
    
    print(f"CSV file saved to: {output_path}")
    return output_path

def main():
    md_path = Path(r"d:\IT\Projects\Seminar\PRDs\00_requirements_intake.md")
    output_path = md_path.parent / "00_requirements_intake.csv"
    
    with open(md_path, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    tables = parse_markdown_tables(md_content)
    print(f"Found {len(tables)} tables")
    
    create_csv(tables, output_path)
    print(f"Done! Total {len(tables)} tables exported to CSV (emojis removed)")

if __name__ == "__main__":
    main()
