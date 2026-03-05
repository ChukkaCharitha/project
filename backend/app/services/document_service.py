import io

def extract_text(contents: bytes, filename: str) -> str:
    fname = filename.lower()

    if fname.endswith(".txt"):
        for enc in ['utf-8', 'latin-1', 'cp1252']:
            try:
                return contents.decode(enc)
            except:
                continue
        return contents.decode('utf-8', errors='ignore')

    elif fname.endswith(".pdf"):
        try:
            import PyPDF2
            reader = PyPDF2.PdfReader(io.BytesIO(contents))
            text = ""
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
            if text.strip():
                return text
        except Exception as e:
            print(f"PyPDF2 error: {e}")
        return ""
    return ""

def split_into_chunks(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    words = text.split()
    if not words:
        return []
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        if chunk.strip():
            chunks.append(chunk)
        start += chunk_size - overlap
    return chunks