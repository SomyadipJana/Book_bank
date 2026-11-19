"""
Insert BBMS diagrams into Book_Bank_Lab_Manual_Report.pdf using PyMuPDF.
Diagrams are inserted as image overlays into existing white space.
"""
import pymupdf
import shutil
import os

IMG_DIR = "/tmp/bbms_images/word/media"
PDF_SRC = "/Users/somu/Documents/Book_Management_system/Book_Bank_Lab_Manual_Report.pdf"
PDF_OUT = "/Users/somu/Documents/Book_Management_system/Book_Bank_Lab_Manual_Report.pdf"
PDF_ARTIFACT = "/Users/somu/.gemini/antigravity/brain/f106db8b-839a-4c9b-bfde-22cc619c7b41/Book_Bank_Lab_Manual_Report.pdf"

# Page dimensions (A4): 595.28 x 841.89 pts
# Margins: left=36, right=559, usable width=523
LEFT_MARGIN = 46
RIGHT_MARGIN = 549
PAGE_W = 595.28
PAGE_H = 841.89
HEADER_Y = 50   # header ends ~y=45
FOOTER_Y = 795  # footer starts ~y=799

def img_path(name):
    return os.path.join(IMG_DIR, name)

def insert_image_centered(page, y_top, y_bottom, img_file, caption=None, padding=4):
    """Insert image centered horizontally within y_top..y_bottom space."""
    if not os.path.exists(img_file):
        print(f"  WARNING: image not found: {img_file}")
        return
    available_h = y_bottom - y_top - padding * 2
    available_w = RIGHT_MARGIN - LEFT_MARGIN
    if available_h < 20:
        print(f"  WARNING: not enough vertical space ({available_h}pts) for {img_file}")
        return
    rect = pymupdf.Rect(LEFT_MARGIN, y_top + padding, RIGHT_MARGIN, y_top + padding + available_h)
    page.insert_image(rect, filename=img_file, keep_proportion=True)
    print(f"  Inserted {os.path.basename(img_file)} at y={y_top:.0f}-{y_bottom:.0f} ({available_h:.0f}pts)")

def insert_image_full(page, y_top, y_bottom, img_file, padding=6):
    """Insert image using full width with padding, keeping proportion."""
    if not os.path.exists(img_file):
        print(f"  WARNING: image not found: {img_file}")
        return
    available_h = y_bottom - y_top - padding * 2
    if available_h < 20:
        print(f"  WARNING: not enough space for {img_file}")
        return
    rect = pymupdf.Rect(LEFT_MARGIN, y_top + padding, RIGHT_MARGIN, y_top + padding + available_h)
    page.insert_image(rect, filename=img_file, keep_proportion=True)
    print(f"  Inserted {os.path.basename(img_file)} at y={y_top:.0f}-{y_bottom:.0f} ({available_h:.0f}pts)")

# Open the PDF
doc = pymupdf.open(PDF_SRC)
print(f"Opened PDF: {PDF_SRC} ({len(doc)} pages)")

# =============================================================================
# PAGE 13 (index 12): HLD section
# "Figure 2.1: High-Level Architecture" text at y=448-458
# White space for HLD image: approximately y=300 to y=445
# After the text at y=300 (description ends), before Figure caption at y=448
# =============================================================================
print("\n--- Page 13: Inserting HLD (DFD Level 0 / image1) ---")
page13 = doc[12]
# Description ends around y=300, Figure caption at y=448
# Insert DFD Level 0 image in space between description end and figure caption
# The 3-layer description ends at ~y=300, with big white space to y=448
hld_y_top = 302
hld_y_bot = 446
insert_image_full(page13, hld_y_top, hld_y_bot, img_path("image1.png"))

# =============================================================================
# PAGE 14 (index 13): LLD section
# Content on this page: LLD table ends around y=174, then nothing until footer
# We can add the LLD/DFD Level 2 diagram (image2) in space after the LLD table
# LLD table ends at y=174, next section 2.2.3 continues but page ends at ~y=175
# Actually page 14 is entirely LLD table - ends at y=174, then footer
# Let's add image2 (DFD Level 2 / LLD diagram) in the white space after the table
# =============================================================================
print("\n--- Page 14: Inserting LLD (DFD Level 2 / image2) ---")
page14 = doc[13]
# LLD table ends at y=174, footer at y=799
# Big white space: y=180 to y=795
lld_y_top = 180
lld_y_bot = 790
insert_image_full(page14, lld_y_top, lld_y_bot, img_path("image2.png"))

# =============================================================================
# PAGE 22 (index 21): Task 5 UML Diagrams
# 5.1 Use Case Diagram:
#   - Heading at y=103-117, description ends y=131
#   - Figure caption: y=344-353
#   - White space: y=135 to y=342 → ~207pts for Use Case diagram
# 5.2 Activity Diagram:
#   - Heading at y=358-372, description ends at y=409
#   - Figure caption: y=627-637
#   - White space: y=412 to y=625 → ~213pts for Activity diagram
# 5.3 Class Diagram heading at y=641-655 (rest continues on page 23)
# =============================================================================
print("\n--- Page 22: Inserting Use Case (image3) and Activity (image9) ---")
page22 = doc[21]

# 5.1 Use Case Diagram — space y=135 to y=342
usecase_y_top = 134
usecase_y_bot = 342
insert_image_full(page22, usecase_y_top, usecase_y_bot, img_path("image3.png"))

# 5.2 Activity Diagram — space y=412 to y=625
activity_y_top = 412
activity_y_bot = 625
insert_image_full(page22, activity_y_top, activity_y_bot, img_path("image9.png"))

# =============================================================================
# PAGE 23 (index 22): Task 5 UML Diagrams continued
# 5.3 Class Diagram:
#   - Description from top of page (continues from page 22)
#   - Figure caption: y=225-235
#   - White space: y=HEADER to y=223 → need to find where content starts
#   - Actually the page starts with class diagram space
#   - Page top content: Figure 5.3 at y=225, so space is y=52 to y=223
# 5.4 Sequence Diagram:
#   - Heading at y=240-253, description ends y=279
#   - Figure caption: y=442-452
#   - Space: y=282 to y=440 → ~158pts for Sequence diagram
# 5.5 Component Diagram:
#   - Heading at y=456-470, description ends y=496
#   - Figure caption: y=594-604
#   - Space: y=499 to y=592 → ~93pts for Component diagram
# =============================================================================
print("\n--- Page 23: Inserting Class (image4), Sequence (image7), Component (image10) ---")
page23 = doc[22]

# 5.3 Class Diagram — space from top (y=52) to figure caption (y=223)
class_y_top = 52
class_y_bot = 223
insert_image_full(page23, class_y_top, class_y_bot, img_path("image4.png"))

# 5.4 Sequence Diagram — space y=282 to y=440
seq_y_top = 282
seq_y_bot = 440
insert_image_full(page23, seq_y_top, seq_y_bot, img_path("image7.png"))

# 5.5 Component / Architecture Diagram — space y=499 to y=592
comp_y_top = 499
comp_y_bot = 592
insert_image_full(page23, comp_y_top, comp_y_bot, img_path("image10.png"))

# =============================================================================
# Save the modified PDF
# =============================================================================
PDF_TMP = PDF_OUT + ".tmp.pdf"
print(f"\nSaving to temp: {PDF_TMP}")
doc.save(PDF_TMP, incremental=False, encryption=pymupdf.PDF_ENCRYPT_NONE)
doc.close()
print("Save complete.")
# Replace original with temp
os.replace(PDF_TMP, PDF_OUT)
print(f"Moved temp -> {PDF_OUT}")

# Copy to artifact directory
print(f"Copying to artifact: {PDF_ARTIFACT}")
shutil.copy(PDF_OUT, PDF_ARTIFACT)
print("Done! All diagrams inserted successfully.")
