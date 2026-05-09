import fitz
doc = fitz.open("AJUSTES PARA O SITE.pdf")
for i, page in enumerate(doc):
    pix = page.get_pixmap()
    pix.save(f"page_{i}.png")
print(f"Extracted {len(doc)} pages as images.")
