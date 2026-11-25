[한국어](pdfmemo-port.md)

# Integrating PDFMemo features into LibreMemo

Since LibreMemo 1.3.0, PDFs use the same reading toolbar, floating annotation tools, sidebar, Settings and Library as HTML and Markdown. It does not include a separate PDF viewer screen or PDFMemo's React and Android UI.

PDFMemo's `mobile/overrides/pdfTextSearch.ts`, `pdfEmbeddedSearchIndex.ts`, `PdfPageRendering.ts`, `pdfViewportWindow.ts` and `mobile/search-cache.ts` were ported to JavaScript. The SHA-256 of each source file and its port target are recorded in [provenance.json](../public/src/pdf/provenance.json). The original PDFMemo project and the shared MemoSuite source were not changed.

- The rendering queue reserves space for the pages visible on screen and prepares low-resolution previews first. It releases off-screen rasters and manages scroll coordinates in long documents with a moving window 900,000 CSS px tall.
- Search normalizes Korean spacing, compatibility characters and ligatures, and keeps the source text index separate from the coordinates of the selected result. A MemoSuite search index embedded in the PDF is used first; for ordinary PDFs, the extracted text is stored on the device by the SHA-256 of the original bytes. The index is derived data and does not replace the original or the annotations.
- The Android-only partial file reading was connected by reading the needed range of a local Blob. No server, extension or native app is required.
- PDF.js 6.4.299 and its worker, CMaps, standard fonts and image decoders are included as local assets. The PDF script execution manager and the QuickJS runtime assets are not included. PDFMemo's React UI and old renderer binaries are not copied.
- Real-browser testing found a Chrome issue where a canvas that was hidden at first is not displayed inside LibreMemo's script-free document iframe. The raster queue and pixel limits are kept, and releasable local Blob images are used for display.

PDF annotations and bookmarks are kept separate from the original and use the existing annotation history, data folder, sync and Trash paths. Text marks record the page number and normalized rectangles, and drawings record coordinates relative to the page. A− and A+ keep the PDF's fixed layout and scale the page and annotations together.

The existing "HTML export" is shared by all three formats. Exporting a PDF puts the original PDF bytes and the current annotations and bookmarks into a single `.html` file. On re-import, it is decoded in parts and the original bytes and metadata are checked. The original PDF is never overwritten or rewritten as ordinary PDF annotations. Recipients also open it with Import files in LibreMemo.

Even if the same original PDF is already in the Library, a newly received share file is imported as a separate document that keeps the annotations and bookmarks it contains. The existing three duplicate choices are shown only when you import a file that is byte-for-byte identical to a share file already imported. The PDF original identifier keeps the same value for search and Device sync.

OCR was not added for scanned images. Existing PDF annotations keep their original appearance, and you edit the annotations newly added in LibreMemo. Password-protected files need an unlocked copy, and PDF form fields, attached programs and Android APK features are not included. Moving to a new edition moves items whose text was confirmed; if duplicate wording makes a position impossible to determine, the item is left out of the result and the original document is kept.

Opening, selection, search, annotations, zoom and share file round trips are verified with synthetic PDFs. Model checks of position calculation for tens of thousands of pages are distinguished from verification with real large PDFs or on real phones. Actual check and publication results are in the [feature history](<기능 추가 history.md#hist-20261031-003>).
