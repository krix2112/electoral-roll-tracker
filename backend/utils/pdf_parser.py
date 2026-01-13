"""
PDF to CSV Parser for Electoral Roll Data
Owner: Vansh (Backend Developer)
Converts PDF electoral roll files to CSV format compatible with backend
"""

import pandas as pd
import re
from typing import List, Dict, Optional
import sys
import os

# Try to import PDF parsing libraries
try:
    import PyPDF2
    PDF2_AVAILABLE = True
except ImportError:
    PDF2_AVAILABLE = False

try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False

try:
    import tabula
    TABULA_AVAILABLE = True
except ImportError:
    TABULA_AVAILABLE = False


def extract_text_from_pdf_pypdf2(pdf_path: str) -> str:
    """Extract text from PDF using PyPDF2"""
    if not PDF2_AVAILABLE:
        raise ImportError("PyPDF2 is not installed. Install with: pip install PyPDF2")
    
    text = ""
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
    return text


def extract_text_from_pdf_pdfplumber(pdf_path: str) -> str:
    """Extract text from PDF using pdfplumber (better for tables)"""
    if not PDFPLUMBER_AVAILABLE:
        raise ImportError("pdfplumber is not installed. Install with: pip install pdfplumber")
    
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


def extract_tables_from_pdf(pdf_path: str) -> List[pd.DataFrame]:
    """Extract tables from PDF using pdfplumber"""
    if not PDFPLUMBER_AVAILABLE:
        raise ImportError("pdfplumber is not installed. Install with: pip install pdfplumber")
    
    tables = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_tables = page.extract_tables()
            for table in page_tables:
                if table:
                    df = pd.DataFrame(table[1:], columns=table[0] if table else None)
                    tables.append(df)
    return tables


def parse_voter_line(line: str) -> Optional[Dict[str, str]]:
    """
    Parse a line of text to extract voter information
    Handles various formats of electoral roll data
    """
    # Common patterns in electoral roll PDFs
    patterns = [
        # Pattern 1: Voter ID, Name, Age, Address, Date
        r'(\w+)\s+([A-Z][a-zA-Z\s\.]+?)\s+(\d+)\s+(.+?)\s+(\d{4}-\d{2}-\d{2})',
        # Pattern 2: Serial, Name, Father/Husband, Age, Address
        r'(\d+)\s+([A-Z][a-zA-Z\s\.]+?)\s+([A-Z][a-zA-Z\s\.]+?)?\s+(\d+)\s+(.+?)\s+(\d{4}-\d{2}-\d{2})',
        # Pattern 3: EPIC No, Name, Age, Address, Date
        r'([A-Z]{2}\d{7})\s+([A-Z][a-zA-Z\s\.]+?)\s+(\d+)\s+(.+?)\s+(\d{4}-\d{2}-\d{2})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, line)
        if match:
            groups = match.groups()
            if len(groups) >= 5:
                return {
                    'voter_id': groups[0].strip(),
                    'name': groups[1].strip(),
                    'age': groups[2] if len(groups) > 2 else '0',
                    'address': groups[-2].strip() if len(groups) > 3 else '',
                    'registration_date': groups[-1].strip() if len(groups) > 4 else '2020-01-01'
                }
    
    return None


def parse_electoral_roll_pdf(pdf_path: str, method: str = 'pdfplumber') -> pd.DataFrame:
    """
    Parse electoral roll PDF and convert to DataFrame
    
    Args:
        pdf_path: Path to PDF file
        method: 'pdfplumber' (recommended), 'pypdf2', or 'tabula'
    
    Returns:
        DataFrame with columns: voter_id, name, age, address, registration_date
    """
    voters = []
    
    if method == 'pdfplumber' and PDFPLUMBER_AVAILABLE:
        # Try to extract tables first (most accurate)
        try:
            tables = extract_tables_from_pdf(pdf_path)
            for table_df in tables:
                # Try to map table columns to our format
                if len(table_df.columns) >= 3:
                    for _, row in table_df.iterrows():
                        voter = {}
                        row_values = row.values.tolist()
                        
                        # Try to identify columns
                        if len(row_values) >= 5:
                            voter['voter_id'] = str(row_values[0]).strip()
                            voter['name'] = str(row_values[1]).strip()
                            voter['age'] = str(row_values[2]).strip() if len(row_values) > 2 else '0'
                            voter['address'] = str(row_values[3]).strip() if len(row_values) > 3 else ''
                            voter['registration_date'] = str(row_values[4]).strip() if len(row_values) > 4 else '2020-01-01'
                            
                            # Validate required fields
                            if voter['voter_id'] and voter['name']:
                                voters.append(voter)
        except Exception as e:
            print(f"Table extraction failed: {e}, trying text extraction...")
        
        # Fallback to text extraction
        if not voters:
            text = extract_text_from_pdf_pdfplumber(pdf_path)
            for line in text.split('\n'):
                voter = parse_voter_line(line)
                if voter:
                    voters.append(voter)
    
    elif method == 'pypdf2' and PDF2_AVAILABLE:
        text = extract_text_from_pdf_pypdf2(pdf_path)
        for line in text.split('\n'):
            voter = parse_voter_line(line)
            if voter:
                voters.append(voter)
    
    elif method == 'tabula' and TABULA_AVAILABLE:
        try:
            df = tabula.read_pdf(pdf_path, pages='all', multiple_tables=True)
            if isinstance(df, list):
                df = pd.concat(df, ignore_index=True)
            # Map columns to our format
            # This requires manual column mapping based on PDF structure
            voters = df.to_dict('records')
        except Exception as e:
            raise Exception(f"Tabula extraction failed: {e}")
    
    else:
        raise ImportError(f"Required library for method '{method}' is not installed")
    
    if not voters:
        raise ValueError("No voter data could be extracted from PDF")
    
    # Convert to DataFrame
    df = pd.DataFrame(voters)
    
    # Ensure required columns exist
    required_columns = ['voter_id', 'name', 'age', 'address', 'registration_date']
    for col in required_columns:
        if col not in df.columns:
            df[col] = ''
    
    # Clean and validate data
    df = df[df['voter_id'].notna() & (df['voter_id'] != '')]
    df = df[df['name'].notna() & (df['name'] != '')]
    
    # Ensure age is numeric
    df['age'] = pd.to_numeric(df['age'], errors='coerce').fillna(0).astype(int)
    
    # Ensure registration_date is in correct format
    df['registration_date'] = df['registration_date'].apply(
        lambda x: str(x) if pd.notna(x) else '2020-01-01'
    )
    
    return df[required_columns]


def convert_pdf_to_csv(pdf_path: str, output_csv_path: str, method: str = 'pdfplumber') -> str:
    """
    Convert PDF electoral roll to CSV format
    
    Args:
        pdf_path: Path to input PDF file
        output_csv_path: Path to output CSV file
        method: Extraction method ('pdfplumber', 'pypdf2', or 'tabula')
    
    Returns:
        Path to created CSV file
    """
    print(f"Converting PDF to CSV: {pdf_path}")
    print(f"Using method: {method}")
    
    df = parse_electoral_roll_pdf(pdf_path, method)
    
    print(f"Extracted {len(df)} voter records")
    
    # Save to CSV
    df.to_csv(output_csv_path, index=False)
    print(f"CSV saved to: {output_csv_path}")
    
    return output_csv_path


if __name__ == '__main__':
    """
    Command-line usage:
    python utils/pdf_parser.py input.pdf output.csv [method]
    """
    if len(sys.argv) < 3:
        print("Usage: python pdf_parser.py <input.pdf> <output.csv> [method]")
        print("Methods: pdfplumber (recommended), pypdf2, tabula")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    csv_path = sys.argv[2]
    method = sys.argv[3] if len(sys.argv) > 3 else 'pdfplumber'
    
    try:
        convert_pdf_to_csv(pdf_path, csv_path, method)
        print("✅ Conversion successful!")
    except Exception as e:
        print(f"❌ Conversion failed: {e}")
        sys.exit(1)
