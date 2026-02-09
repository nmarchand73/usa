"""
Convertit le livre DOCX en PDF via docx2pdf (nécessite Microsoft Word sur Windows).
À lancer depuis la racine du projet : python scripts/docx-to-pdf.py
Ou via npm : npm run book:pdf
"""

import os
import sys

try:
    from docx2pdf import convert
except ImportError:
    print("Erreur : installez docx2pdf avec : pip install docx2pdf")
    sys.exit(1)

# Chemins relatifs au dossier du script
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
book_dir = os.path.join(project_root, "book")
docx_path = os.path.join(book_dir, "Livre_Heros_USA_50_Etats.docx")
pdf_path = os.path.join(book_dir, "Livre_Heros_USA_50_Etats.pdf")

if not os.path.exists(docx_path):
    print(f"Fichier introuvable : {docx_path}")
    print("Générez d'abord le livre avec : npm run book")
    sys.exit(1)

print("Conversion DOCX -> PDF en cours...")
convert(docx_path, pdf_path)
print(f"PDF créé : {pdf_path}")
