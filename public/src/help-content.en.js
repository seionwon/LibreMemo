// English help: same topics, ids and structure as help-content.js.
// Shown when the interface language is English.
export const HELP_GROUPS = [
 {
  "id": "tutorial",
  "title": "Step-by-step guides",
  "description": "Walkthroughs by goal: studying, reviewing papers, lecture notes and giving feedback"
 },
 {
  "id": "features",
  "title": "Features",
  "description": "Reading, annotations, search and export in detail"
 },
 {
  "id": "data",
  "title": "Storing and recovering data",
  "description": "Where data is saved, backups, deletion and privacy"
 },
 {
  "id": "trouble",
  "title": "Troubleshooting",
  "description": "When saving, connecting, images or sound don’t work"
 }
];

export const HELP_TOPICS = [
 {
  "id": "first-document",
  "group": "tutorial",
  "title": "Your first document: a walkthrough for new users",
  "summary": "Set up a storage location that suits your device, mark a sentence, then reopen it from your Library.",
  "keywords": "start getting started beginner tutorial how to first time setup install example walkthrough intro",
  "sections": [
   {
    "title": "Getting started on this device",
    "paragraphs": [
     "On a computer or Android, open the app in Google Chrome, which lets you choose a dedicated folder. On iPhone and iPad you can use Safari, Chrome, or the app added to your Home Screen. If a new version is ready, install it or dismiss it, then check your storage location."
    ]
   },
   {
    "title": "Follow these steps",
    "steps": [
     {
      "title": "Set up a storage location.",
      "text": "On a computer or Android, type a name for the dedicated folder, tap Create new storage folder, choose a parent location such as Documents, and allow writing. If you already have a folder from before, choose Connect existing storage folder instead. On iPhone and iPad, the app prepares its own in-app storage automatically. Once your Library opens, go to the next step."
     },
     {
      "title": "Open a document.",
      "text": "In Library → Import files, choose a supported file such as HTML, PDF, e-book, DjVu, Hangul (HWP), Office, image or subtitles. You can also start with Paste text, Paste image or YouTube. For your first try, use a document with text, or the sample document shown in an empty Library. You can also drag files into the app."
     },
     {
      "title": "Highlight a sentence.",
      "text": "In the floating toolbar, open the highlighter, choose text highlight and drag across a sentence. On a phone, drag along the text with your finger or a stylus and lift to mark it. If you have already selected text, just tap the highlighter in the floating toolbar. To move the document while a tool is selected, scroll with two fingers."
     },
     {
      "title": "Write down a thought as a note.",
      "text": "Select another sentence, tap Note in the floating toolbar and type a short thought. It is saved as a note on the selected sentence. If no text is selected, you can use the note tool to draw a box wherever you like."
     },
     {
      "title": "Check that it saved.",
      "text": "Annotations are saved automatically. While there are changes to save, a small dot appears on the document tab, and it disappears when saving is done. If something goes wrong, a status bar slides up at the bottom of the screen. When you close the document tab with ×, it finishes any remaining saves before closing."
     },
     {
      "title": "Reopen it to check.",
      "text": "Tap the same document in your Library. Check that your highlight and note are still there. Next time, just open this document from your Library and keep reading."
     }
    ]
   },
   {
    "title": "After the practice",
    "paragraphs": [
     "Remember one phrase you marked and type it into Sidebar → Annotations → Search my annotations. Tap the result to jump back to that spot. To send a document with its annotations, choose Archive with original (.librememo) from Export at the top. If you only need the quotes and notes, use Copy excerpt notes in the same window."
    ]
   }
  ],
  "related": [
   "review-tutorial",
   "storage-folder",
   "annotations",
   "export-html",
   "backup-restore"
  ]
 },
 {
  "id": "review-tutorial",
  "group": "tutorial",
  "title": "Try the new features",
  "summary": "Find annotations you left in a document, group them by color name, and copy excerpt notes. Also covers repeating a YouTube scene with a moment note and recent changes to reading and writing controls.",
  "keywords": "new features what’s new recent review reading notes find marked sentences excerpt notes markdown search my annotations highlight color names YouTube scene repeat 10 seconds loop UI text size font size rename contents TOC pen dot short stroke reconnect storage folder",
  "sections": [
   {
    "title": "Search my annotations",
    "paragraphs": [
     "Open a document that has text. If you need one to practice with, go to Library → Paste text, type ‘The next meeting is on Friday. What should we bring?’ and tap ‘Save and annotate’.",
     "Apply a text highlight to the first sentence, then type one of its words, such as ‘Friday’, into Sidebar → Annotations → Search my annotations. When the chapter or section with the result expands, tap the sentence. The document moves to the spot you marked.",
     "You can also search by the notes you wrote or by chapter and section titles. For YouTube moment notes, try typing a time like 1:23. Tap × in the search box to clear it."
    ]
   },
   {
    "title": "Gather only your questions with highlight color names",
    "paragraphs": [
     "Choose the highlighter in the floating toolbar, then open Pen & colors. Pick a color in the palette that differs from the one you used on the first sentence. Expand Highlight color names, type ‘Question’ next to that color and tap Save name. Close the window and highlight something you wonder about, such as ‘What should we bring?’.",
     "In Sidebar → Annotations, clear the search box, tap All annotations and choose ‘Question’. Every sentence and area in this document highlighted in that color is gathered here, including ones you highlighted before naming the color. Adding a search term narrows the results, and choosing All annotations again removes the color filter. Names are remembered for each palette."
    ]
   },
   {
    "title": "Copy excerpt notes as Markdown",
    "paragraphs": [
     "Tap Export → Copy excerpt notes in the first row at the top of the document, then paste into your notes app. Under the document title you get your quotes and notes, along with contents headings or PDF page numbers. YouTube moment notes come with a time link that opens that scene.",
     "Even if the sidebar shows only ‘Question’, the notes contain all quotes and notes in the current document. Pen drawings and shapes without text are skipped. If automatic copying is blocked, the excerpt appears selected in the same window. Copy it with ⌘C on Mac, Ctrl+C on Windows, or Copy in the selection menu on a phone."
    ]
   },
   {
    "title": "Repeat a YouTube scene for 10 seconds",
    "paragraphs": [
     "Open a YouTube document and, at a scene you want to watch again, tap Moment note in the video bar. Type a line and tap Save moment note. Scenes that already have a note are easy to find in the moment note list below the video.",
     "Tap ⋯ on the right of the note → Repeat this scene for 10 seconds. For a note left at 1:23, it loops from 1:23 to 1:33. If the end of the video is closer, it repeats the remaining part up to the end. Tap Stop repeating in the video bar or in the same note’s ⋯ to keep watching from the current position."
    ]
   },
   {
    "title": "Adjust text size in the document and sidebar",
    "paragraphs": [
     "While reading, use A+ on the left at the top of the document to make text bigger and A− on the right to make it smaller. Tap A in the middle to return to the default size. For fixed-layout material such as PDFs and images, the content and annotations zoom together.",
     "To enlarge only the contents, go to Settings → UI text size → Adjust sizes and change the sidebar’s Contents value to 125%. You can set it from 60 to 200% in 1% steps. In the same window you can also set sizes for the whole screen, search box, annotation and bookmark lists, Library, tools and Help. Tap ↻ next to an item to follow the parent setting again."
    ]
   },
   {
    "title": "Rename contents entries",
    "paragraphs": [
     "First expand the contents in the sidebar so the heading you want to change is visible. Tap the pencil button at the top (Rename contents entries) and choose a heading. Type the new name and press Enter to save, or Esc to cancel. To change another heading, tap the pencil again. When browsing the contents, tap a heading to go to it in the document; double-clicking or long-pressing keeps you in browsing mode."
    ]
   },
   {
    "title": "Leave dots and short lines with the pen",
    "paragraphs": [
     "Choose the pen in the floating toolbar and tap the document once to leave a dot. Drag briefly and lift to draw a line, then carry on with the next stroke. For handwriting you want to see again later, choose Keep permanently in Pen & colors → Pen display time."
    ]
   },
   {
    "title": "Continue connecting the storage folder later",
    "paragraphs": [
     "On a computer or Android, if connecting the folder takes a long time when you reopen the app, the folder name and a Cancel button appear. If you wait, the connection continues; tap Cancel to go back to the waiting screen. When you are ready, tap Connect storage folder. On the Continue screen, check the existing folder name and tap Continue to open the same Library."
    ]
   }
  ],
  "related": [
   "search-outline",
   "colors",
   "export-html",
   "youtube",
   "reading-view",
   "pen-and-shapes",
   "storage-folder"
  ]
 },
 {
  "id": "web-tutorial",
  "group": "tutorial",
  "title": "Save and annotate articles you read on the web",
  "summary": "How to open a web page and bring in a saved file or copied text.",
  "keywords": "web page website internet article copy paste markdown table code list clip capture import save page mhtml html",
  "sections": [
   {
    "title": "Starting from a web page",
    "steps": [
     {
      "title": "Open the article in your browser.",
      "text": "Type a search term or web address into the address bar at the very top of your Library. Go to the article you want to keep in the browser tab."
     },
     {
      "title": "If you need images and formatting, save a file.",
      "text": "In your browser’s Save page option, choose Webpage, Single File (.mhtml) if it is offered. This keeps images and styles together in one file. The save menu varies by device. You can also import a single HTML file you already have; for formats split into an HTML file and a separate resources folder, importing only the HTML may leave out images."
     },
     {
      "title": "Open the Library folder to keep it in.",
      "text": "Come back to LibreMemo and open the folder in your Library where you want to save it. Choose the file you just saved with “Import files”. If images are missing, tap ⋯ → Document info in the floating toolbar of the open document. Any problems found during import are listed under “Resources that couldn’t be saved”."
     },
     {
      "title": "To keep just the text, paste it.",
      "text": "Copy the article text on the web, then open Library → Paste text. Paste it into “Content” and check the title. To revisit the site later, enter the article’s actual address in “Source address (optional)” and tap “Save and annotate”. Both plain text and Markdown work."
     },
     {
      "title": "Read it again from your Library.",
      "text": "You can add highlights, underlines and notes to the imported document. The original site and the file you imported are never changed automatically."
     }
    ]
   },
   {
    "title": "Reopen the web page import guide",
    "paragraphs": [
     "In your Library, tap “Web page import guide” below the Import files button. You can review how to save a single file, and import a file or paste text directly from the guide window."
    ]
   }
  ],
  "related": [
   "import-files",
   "web-and-paste",
   "missing-resources"
  ]
 },
 {
  "id": "sync-tutorial",
  "group": "tutorial",
  "title": "Connect your Mac and phone to pick up where you left off",
  "summary": "A walkthrough for connecting two devices with a QR code or connection code.",
  "keywords": "sync device sync phone mobile smartphone MacBook QR scan connect pair client server continue reading",
  "sections": [
   {
    "title": "Prepare both devices",
    "paragraphs": [
     "Open your Library with the latest version on both devices. A computer or Android uses the dedicated folder connected on that device, and an iPhone or iPad uses the in-app storage connected automatically. Stay online and keep both screens open until sync finishes. Trash is kept separately on each device."
    ]
   },
   {
    "title": "Connect and check",
    "steps": [
     {
      "title": "On the device showing the QR code, choose the scope.",
      "text": "Open Settings → Device sync → Connect. Under Let another device connect, choose either Whole Library or Share current document only. Share current document only is available when a document is open."
     },
     {
      "title": "Decide whether to match app settings too.",
      "text": "On the device showing the QR code, check Also sync app settings under Whole Library. It is on at first, and the device remembers your last choice. This option is not shown under Connect to another device or Share current document only."
     },
     {
      "title": "Connect the two devices.",
      "text": "Tap Start connection on one device; when the QR code appears, tap Connect to another device → Scan QR on the other. If you can’t use the camera, tap Copy on the first device, paste it into the connection code field on the other device and tap Connect."
     },
     {
      "title": "If app settings differ, choose which to use.",
      "text": "If Also sync app settings is on and the settings differ, choose Use this device’s settings or Use the other device’s settings on the device that receives data first. The chosen settings are applied to both. Canceling stops sync before anything is applied; dedicated folder connections and permissions are never transferred."
     },
     {
      "title": "If annotations or bookmarks differ for a document with the same original and reading view, choose what to do.",
      "text": "Even if only one side changed, choose one of Merge and keep both, Send this device’s to the other device, Bring the other device’s to this device, or Do nothing. Choose once on the device that receives data first and it applies to both. Do nothing skips only this document; closing the window stops the whole sync."
     },
     {
      "title": "Wait for the completion message.",
      "text": "When both show “Transfer complete. You can close this screen.”, tap OK and close it. Open a document in your Library to check its bookmarks and annotations."
     }
    ]
   },
   {
    "title": "Good to know",
    "notice": {
     "tone": "caution",
     "title": "Sync and backup serve different purposes.",
     "text": "Identical originals are recognized by file content; a file is not skipped just because its name matches. Since mistaken edits or deletions can happen on either device, also keep important material as a copy of the dedicated folder or as per-document archive files."
    }
   }
  ],
  "related": [
   "device-sync",
   "sync-conflicts",
   "backup-restore",
   "sync-problems"
  ]
 },
 {
  "id": "backup-tutorial",
  "group": "tutorial",
  "title": "Back up your whole Library and restore it on a new device",
  "summary": "Move the dedicated folder of a computer or Android as a whole, or transfer material from the in-app storage of an iPhone or iPad.",
  "keywords": "backup back up restore recover new device replace switch phone move transfer migrate copy",
  "sections": [
   {
    "title": "On a computer or Android using a dedicated folder",
    "steps": [
     {
      "title": "Make sure saving is complete.",
      "text": "Wait until open documents finish saving and Saved to folder is shown. While saving is in progress or has failed, your latest changes may not be in the folder yet."
     },
     {
      "title": "Copy the entire dedicated folder.",
      "text": "Copy the folder you first connected, such as Documents/LibreMemo, as a whole to an external drive or another backup location. Include all management files and subfolders inside it. If you copy only a few original HTML files, annotations and history may be left out."
     },
     {
      "title": "Label your copies.",
      "text": "Use the outer folder name to tell them apart, for example LibreMemo-backup-date. Rather than cutting your only original folder, copy it first, check that the copied data works, and then tidy up older backups."
     }
    ]
   },
   {
    "title": "Restoring on a new computer or Android",
    "steps": [
     {
      "title": "Bring over the copied folder.",
      "text": "Place the whole folder under Documents on the new device. The outer folder name may differ from device to device."
     },
     {
      "title": "Choose it with Connect existing storage folder.",
      "text": "During first-time setup, tap Connect existing storage folder. If you are already using the app, choose the moved dedicated folder in Settings → Data folder → Manage. Allow folder access and writing."
     },
     {
      "title": "Review the restored data.",
      "text": "Check your Library, Trash, bookmarks, annotations and annotation history. A restored copy that conflicts with your existing Library may be kept as a separate copy, so tidy up after checking the result."
     }
    ]
   },
   {
    "title": "Moving to or from an iPhone or iPad",
    "paragraphs": [
     "On a device that uses in-app storage, choose Whole Library in Settings → Device sync. Regular documents, annotations, bookmarks and history are exchanged in both directions, and app settings can be synced too if you like. Restore any Trash documents you want on the new device to your Library first.",
     "To keep just one document, save a .librememo file with Export → Archive with original (.librememo) at the top. Open it on another device with Library → Import files to continue with that document’s original, current annotations, bookmarks and reading position."
    ]
   }
  ],
  "related": [
   "backup-restore",
   "storage-folder",
   "storage-differences",
   "sync-tutorial",
   "save-problems"
  ]
 },
 {
  "id": "tut-study-colors",
  "group": "tutorial",
  "title": "Study textbooks and papers by color",
  "summary": "Highlight key points, evidence and questions with named colors, review just the questions, then move them into your notes.",
  "keywords": "study learn exam test textbook paper research summary review color coding highlighter highlight color names key point evidence question filter notes organize tutorial",
  "sections": [
   {
    "title": "When to use this",
    "paragraphs": [
     "Use this when you read textbooks, papers or reports and want to tell important sentences, their evidence and passages you don’t understand yet apart at a glance. When you finish reading, review just the questions and move the marked sentences into your notes app."
    ]
   },
   {
    "title": "Preparation",
    "paragraphs": [
     "Bring the document you are studying into your Library. Choose a PDF, EPUB, HWP, DOCX or other file in Library → Import files, or use Paste text for text copied from the web."
    ]
   },
   {
    "title": "Follow along",
    "steps": [
     {
      "title": "Name three colors.",
      "text": "Open the document, choose the highlighter in the floating toolbar, then open Pen & colors (the three-line button). Expand Highlight color names, type ‘Key’ for yellow, ‘Evidence’ for green and ‘Question’ for an eye-catching color such as pink, tapping Save name for each. Names are remembered for the palette you currently have selected."
     },
     {
      "title": "Highlight key points as you read the first chapter.",
      "text": "Pick the ‘Key’ color in Pen & colors and close the window. Check that the highlighter is in text highlight mode, then drag across sentences that state the chapter’s claims or definitions. It is saved the moment you lift your finger."
     },
     {
      "title": "Use a different color for evidence and examples.",
      "text": "Switch to the ‘Evidence’ color in Pen & colors and highlight sentences that support the claims, such as figures, cases and quotations. You only change the color, so there’s no need to pick the tool again."
     },
     {
      "title": "Leave questions where you’re stuck.",
      "text": "Highlight the passage in the ‘Question’ color, then, with the same sentence selected, tap Note in the floating toolbar and write one line about what you want to know. The note is attached to the selected sentence."
     },
     {
      "title": "Gather just the questions.",
      "text": "Open the annotations view from ☰ at the far left of the document toolbar or from the sidebar. Clear the search box, tap All annotations below it and choose ‘Question’; only sentences in that color remain, grouped by chapter and section. Tap an item to go to that spot in the document."
     },
     {
      "title": "Change the color once you find the answer.",
      "text": "For a question you’ve answered, tap its highlight with the select tool in the floating toolbar and choose the ‘Key’ swatch in the annotation editor. Add the answer to the note, and it drops out of the question list naturally."
     },
     {
      "title": "Move them into your notes.",
      "text": "Tap Export → Copy excerpt notes at the top of the document and paste into a notes app or Markdown editor. The highlighted sentences and notes are arranged under chapter and section headings (page numbers for PDFs)."
     }
    ]
   },
   {
    "title": "Tips",
    "bullets": [
     "You can also type a color name such as ‘Evidence’ into Search my annotations to find marks in that color.",
     "Giving several colors the same name gathers them into one list. For example, both light yellow and dark yellow can be ‘Key’.",
     "Even when the sidebar shows only ‘Question’, excerpt notes include the marks from the whole document.",
     "Right before an exam, use Save current position in the bookmarks view to leave a bookmark like ‘Review from here’."
    ]
   }
  ],
  "related": [
   "colors",
   "annotations",
   "search-outline",
   "export-html",
   "review-tutorial"
  ]
 },
 {
  "id": "tut-pdf-paper",
  "group": "tutorial",
  "title": "Read a PDF paper and share it as an annotated PDF",
  "summary": "Find and mark the sentences you want in a PDF, then send it as an annotated PDF that other PDF apps can show.",
  "keywords": "PDF paper report review comments feedback share annotated PDF search whole book go to page proofread markup tutorial",
  "sections": [
   {
    "title": "When to use this",
    "paragraphs": [
     "Use this when you review a paper, contract or report in PDF, mark sentences and write comments, and want to send it so the other person can read it in an ordinary PDF viewer even without LibreMemo."
    ]
   },
   {
    "title": "Follow along",
    "steps": [
     {
      "title": "Import the PDF.",
      "text": "Open the Library folder to keep it in, then choose the PDF with Import files or drag it into the app window. If the PDF has a table of contents, it appears in the sidebar contents; otherwise a page list appears."
     },
     {
      "title": "Search the whole document for words to check.",
      "text": "In the sidebar’s search view, type a word such as ‘limitation’ into Search whole book. When page numbers and surrounding sentences appear, tap a result to go to that text on its page."
     },
     {
      "title": "Mark important sentences.",
      "text": "Choose the highlighter or underline in the floating toolbar and drag across a sentence. For wording that needs fixing, use ⋯ (document tools) at the end of the floating toolbar → Strikethrough. Where text is hard to select, such as figures or equations, tap the highlighter again, choose area highlight and draw a rectangle around it."
     },
     {
      "title": "Leave comments as notes.",
      "text": "Select the sentence you want to comment on, tap Note in the floating toolbar and type your comment. To write in the margin instead, clear the selection, tap the note button again, choose note box and tap the margin to type."
     },
     {
      "title": "Check that nothing is missing.",
      "text": "Open the annotations view in the sidebar to see your marks and notes grouped by page and contents. Tap items to recheck them one by one, and remove mistaken annotations with that item’s Delete or with the eraser."
     },
     {
      "title": "Export as an annotated PDF.",
      "text": "Tap Export at the top of the document, choose Annotated PDF, and set the save location and file name. The original pages, links and contents stay as they are, and highlights, underlines, strikethroughs, handwriting, shapes, notes and bookmarks are added as standard PDF annotations."
     },
     {
      "title": "Send the file.",
      "text": "Send the saved PDF by email or messenger. The recipient can open it in their usual PDF viewer. Annotation editing features vary by viewer."
     }
    ]
   },
   {
    "title": "When another format is better",
    "bullets": [
     "If the other person will keep editing annotations in LibreMemo, Archive with original (.librememo) is more accurate.",
     "If an annotation can’t fit on a single PDF page, such as a drawing that extends beyond the page, you’ll see an error. In that case choose Archive with original.",
     "For PDFs with a digital signature, you’ll be pointed to the archive file so the signature isn’t broken.",
     "For scanned PDFs where text can’t be selected, mark with area highlight and the pen instead of search and text highlights."
    ]
   }
  ],
  "related": [
   "pdf-documents",
   "export-html",
   "annotations",
   "pen-and-shapes",
   "search-outline"
  ]
 },
 {
  "id": "tut-ebook-comfort",
  "group": "tutorial",
  "title": "Read e-books in a layout that suits your eyes",
  "summary": "Adjust margins, line spacing and page turning for e-books such as EPUB, and save those settings under a name to reuse on your next book.",
  "keywords": "e-book ebook EPUB MOBI AZW3 FB2 novel reading layout margins line spacing page turn pages paginated footnotes time left view settings saved presets auto scroll tutorial",
  "sections": [
   {
    "title": "When to use this",
    "paragraphs": [
     "Use this when you read novels or nonfiction for a long time and want comfortable text size, margins and line spacing, and want to turn pages like a printed book or scroll slowly without using your hands."
    ]
   },
   {
    "title": "Follow along",
    "steps": [
     {
      "title": "Import the book.",
      "text": "Choose an EPUB, MOBI, AZW3 or FB2 file in Library → Import files. DRM-protected books and KFX can’t be opened, so use an unprotected copy."
     },
     {
      "title": "Choose text size and font.",
      "text": "Use A+ in the document toolbar to make text bigger and A− to make it smaller. A in the middle is the default size. In the font picker next to it, choose a family such as serif or sans-serif, or a specific font name."
     },
     {
      "title": "Adjust margins and line spacing.",
      "text": "In the toolbar’s View settings (▤) → View tab, adjust text width, side margins, line spacing, paragraph spacing, alignment and first-line indent. Changes show in the document right away."
     },
     {
      "title": "Try page turning.",
      "text": "In the same tab, set the reading mode to pages. Turn pages with the arrow keys, PageUp, PageDown, Space, by tapping the left or right edge of the screen, or by swiping. Each new chapter starts on a new page, and lines are never cut off."
     },
     {
      "title": "Read footnotes in place.",
      "text": "With the select tool active, tap a footnote number in the text and a footnote card opens right where you are reading. No need to go to the end of the book and back."
     },
     {
      "title": "Check how much is left.",
      "text": "See the estimated reading time left in View settings → Navigate tab. Release the position slider to jump to that percentage, and use ↶ (Back) to return to where you were before."
     },
     {
      "title": "Save this layout.",
      "text": "In View settings → Saved settings, save it under a name like ‘Night reading’. To read your next book the same way, tap “Default for this format” on that setting. It is then applied automatically to e-books you open for the first time."
     }
    ]
   },
   {
    "title": "Reading hands-free",
    "paragraphs": [
     "Leave the reading mode on continuous scroll and tap View settings → Navigate → Start auto scroll. In the bar at the bottom of the screen, set the speed with Slower and Faster (9 steps), and use Pause, Resume and Stop. Scrolling yourself or tapping the text pauses it briefly; tap Resume to continue."
    ]
   },
   {
    "title": "Good to know",
    "bullets": [
     "Page numbers are calculated from the current text size and window size, so they change when you change settings. Bookmarks and annotations are tied to positions in the text and follow along.",
     "Fixed-layout EPUBs and CBZ comics keep their original page shape, and this layout does not apply.",
     "If your eyes get tired, choose Dark in Settings → Appearance."
    ]
   }
  ],
  "related": [
   "ebook-documents",
   "reading-settings",
   "reading-view",
   "search-outline",
   "design-themes"
  ]
 },
 {
  "id": "tut-youtube-lecture",
  "group": "tutorial",
  "title": "Take notes on subtitles while watching a lecture",
  "summary": "Open a YouTube lecture with subtitles and take notes with highlights and notes while following the line being spoken.",
  "keywords": "YouTube lecture video online course class subtitles captions note taking notes follow chapters contents video size keyboard shortcuts excerpts time links tutorial",
  "sections": [
   {
    "title": "When to use this",
    "paragraphs": [
     "Use this when you watch an online lecture or talk and, instead of writing down what matters, want to mark and annotate the subtitles directly so you can return to that scene later."
    ]
   },
   {
    "title": "Preparation",
    "paragraphs": [
     "Download the lecture’s subtitle file (SRT, VTT, etc.) in advance. LibreMemo does not download YouTube subtitles itself. You’ll find how to get them under How to get subtitle files in the Library → YouTube window. If there are no subtitles, follow ‘Collect key scenes from a video as moment notes’ in the related topics."
    ]
   },
   {
    "title": "Follow along",
    "steps": [
     {
      "title": "Create a video document.",
      "text": "Open Library → YouTube and choose Annotate subtitles. Paste the video address, select your downloaded subtitles with Choose subtitle file, and tap Create."
     },
     {
      "title": "Build contents from the chapters in the description.",
      "text": "Copy the time and title lines, such as “0:00 Introduction”, from the YouTube video description, paste them into Contents in the video bar and save. The subtitles are split by chapter and appear in the sidebar contents; tapping a time in the contents also moves the video to that point."
     },
     {
      "title": "Split the space between video and subtitles.",
      "text": "Tap −/+ in the video bar or drag the strip just below the bar up or down to set the video height. Keep the video small when taking lots of notes, and large when the on-screen material matters. At least one line of subtitles always stays visible."
     },
     {
      "title": "Play with Follow turned on.",
      "text": "When Follow is on in the video bar, the view keeps the line currently being spoken in the middle of the subtitle area. The line being played is marked with a red bar."
     },
     {
      "title": "Mark things as you listen.",
      "text": "Drag across an important line to highlight it, or select it and tap Note to write your thoughts. A paused video won’t start playing by itself while you mark. Scrolling the subtitles by hand pauses Follow for a moment so you can look back."
     },
     {
      "title": "Control the video from the keyboard.",
      "text": "Even while reading subtitles, use Space or K to play/pause, ←/→ to move 5 seconds, and J/L to move 10 seconds. Change speed with </>, and press ? for the full list of shortcuts."
     },
     {
      "title": "Go back to scenes you want to see again.",
      "text": "Tap the time at the start of a subtitle line with the select tool to play from that scene. You can also search your notes in Sidebar → Annotations and tap one to go to that line."
     },
     {
      "title": "Make lecture notes.",
      "text": "When the lecture ends, tap Export → Copy excerpt notes at the top of the document and paste into your notes app. The marked lines and notes are arranged by chapter, and subtitle marks with a known time get a link that opens that scene."
     }
    ]
   },
   {
    "title": "Good to know",
    "bullets": [
     "Playing the video needs an internet connection, but subtitles and notes can be read offline.",
     "For videos that block external playback, watch with Open in YouTube and keep taking subtitle notes in LibreMemo.",
     "Double-tap the video or press F to make the video full screen."
    ]
   }
  ],
  "related": [
   "tut-youtube-moments",
   "youtube",
   "subtitle-documents",
   "annotations",
   "export-html",
   "keyboard"
  ]
 },
 {
  "id": "tut-youtube-moments",
  "group": "tutorial",
  "title": "Collect key scenes from a video as moment notes",
  "summary": "Even without subtitles, leave a video time and a one-line note, then find the scenes you need and repeat them 10 seconds at a time.",
  "keywords": "YouTube moment notes timestamp time stamp scene bookmark cooking workout exercise instrument practice repeat loop 10 seconds search by time tutorial",
  "sections": [
   {
    "title": "When to use this",
    "paragraphs": [
     "Use this for videos where you only need to rewatch a few scenes, such as cooking, workout or instrument practice videos. You can collect just the scene times and notes without preparing subtitles."
    ]
   },
   {
    "title": "Follow along",
    "steps": [
     {
      "title": "Start with a moment note.",
      "text": "When you open Library → YouTube, Moment note comes first. Paste the video address, enter a time like 1:23 under Time and a line like ‘Check dough consistency’ under Note, then save. If you paste a share link that includes a time, the time is filled in automatically."
     },
     {
      "title": "Add scenes as you watch.",
      "text": "Play the new video document and tap Moment note in the video bar at the moment you want to keep. The video pauses and the time is filled in, so just type a note and save. Saving does not restart playback."
     },
     {
      "title": "Review your notes.",
      "text": "Notes collect in time order in the list below the video. Tap a time to play from that scene, and use ⋯ on the right of a note to edit its time and text or delete it."
     },
     {
      "title": "Repeat tricky scenes.",
      "text": "Tap ⋯ on the note you want to practice → Repeat this scene for 10 seconds. It loops the 10 seconds from that time. After trying it yourself, tap Stop repeating in the video bar to keep watching."
     },
     {
      "title": "Slow it down for a closer look.",
      "text": "Lower the playback speed in the video bar to 0.75× or 0.5×, or press <. While paused, press , and . to step one frame back or forward."
     },
     {
      "title": "Find them later by time or word.",
      "text": "Type a word from your note, such as ‘dough’, or a time like 2:10 into Search my annotations under Sidebar → Annotations. Tap a result to play from that scene."
     }
    ]
   },
   {
    "title": "Good to know",
    "bullets": [
     "If the same folder already has a document for that video, the moment note is added to the existing document instead of creating a new one.",
     "If a note already exists within 3 seconds of the time you chose, the nearest note opens so you can add to it instead of creating a new one.",
     "If you get a subtitle file later, you can add it with Attach subtitles in the video bar, and your moment notes stay as they are.",
     "This does not save the video itself or cut out scenes."
    ]
   }
  ],
  "related": [
   "youtube",
   "review-tutorial",
   "search-outline",
   "export-html"
  ]
 },
 {
  "id": "tut-language-practice",
  "group": "tutorial",
  "title": "Practice a foreign language by listening and repeating with videos",
  "summary": "Mark unfamiliar expressions while watching foreign-language subtitles, and repeat scenes or listen slowly while speaking along.",
  "keywords": "foreign language English Japanese Chinese Spanish conversation listening shadowing dictation expressions phrases vocabulary word list repeat loop playback speed subtitles tutorial",
  "sections": [
   {
    "title": "When to use this",
    "paragraphs": [
     "Use this when you practice listening and speaking with foreign-language videos or dramas. Gather unfamiliar expressions by color, and listen to the same sentence several times while speaking along."
    ]
   },
   {
    "title": "Preparation",
    "paragraphs": [
     "Get a subtitle file in the language you are learning and create a video document with Library → YouTube → Annotate subtitles. If you already have the video document, use Attach subtitles in the video bar."
    ]
   },
   {
    "title": "Follow along",
    "steps": [
     {
      "title": "Choose a color for unfamiliar expressions.",
      "text": "In Pen & colors, name one highlight color ‘Unknown’ and another ‘To memorize’, and tap Save name."
     },
     {
      "title": "First, listen all the way through with subtitles.",
      "text": "Turn on Follow and play. When an unfamiliar word or expression comes up, pause with Space and highlight it in the ‘Unknown’ color. Once you look up the meaning, keep it selected, tap Note and write it down."
     },
     {
      "title": "Repeat after each sentence.",
      "text": "Tap the time at the start of a subtitle line to play from that line. Press ← to go back 5 seconds and listen again. Try saying the sentence aloud after hearing it."
     },
     {
      "title": "Loop the hard scenes.",
      "text": "Leave a note like ‘Pronunciation practice’ on that scene with Moment note in the video bar, then tap the note’s ⋯ → Repeat this scene for 10 seconds. Repeat until it feels natural, then exit with Stop repeating."
     },
     {
      "title": "Adjust the speed.",
      "text": "Start by pressing < to listen at 0.75×, and once you’re comfortable, raise it to 1× or more with >. You can also choose it from playback speed in the video bar."
     },
     {
      "title": "Review just the expressions.",
      "text": "In Sidebar → Annotations, tap All annotations and choose ‘Unknown’ to gather only the lines highlighted in that color. Tap an item to return to that scene."
     },
     {
      "title": "Move them into a word list.",
      "text": "Copy your marked lines and notes with Export → Copy excerpt notes and paste them into a vocabulary app. Each expression comes with a link that opens its scene."
     }
    ]
   },
   {
    "title": "Listening to subtitles without the video",
    "paragraphs": [
     "You can also open just the subtitle file with Import files to read and mark the lines. Turn on Read aloud with the speaker button and it skips the timestamps and reads only the lines. Choose a voice for the language you are learning under the gear icon."
    ]
   }
  ],
  "related": [
   "youtube",
   "subtitle-documents",
   "colors",
   "speech",
   "export-html"
  ]
 },
 {
  "id": "tut-screenshot-feedback",
  "group": "tutorial",
  "title": "Mark up a screenshot and send feedback",
  "summary": "Capture the screen, paste it, mark what needs fixing with rectangles, arrows and text, then send it.",
  "keywords": "screenshot screen capture screen grab feedback design review bug error markup arrow rectangle text image paste image share tutorial",
  "sections": [
   {
    "title": "When to use this",
    "paragraphs": [
     "Use this when you want to point out fixes on a website or app screen, a screen showing an error, or comments on a design mockup by marking directly on the image."
    ]
   },
   {
    "title": "Follow along",
    "steps": [
     {
      "title": "Copy the screen.",
      "text": "On Mac, press Control+Shift+⌘+4; on Windows, press Win+Shift+S, select an area and copy it to the clipboard. For phone screenshots, save them as files and open them with Import files."
     },
     {
      "title": "Paste it into your Library.",
      "text": "Open a folder such as ‘Feedback’ in your Library and tap Paste image → Paste from clipboard. You can also press ⌘V or Ctrl+V outside any input field. An image document named with the date and time opens in a new tab."
     },
     {
      "title": "Draw a rectangle around what needs fixing.",
      "text": "Choose the rectangle in the floating toolbar and drag over the area to fix. Tap the rectangle twice to choose with or without fill. To make it stand out, pick red in Pen & colors and increase the thickness."
     },
     {
      "title": "Point with an arrow.",
      "text": "Choose the arrow from ⋯ (document tools) at the end of the floating toolbar and drag from the start point to the end point."
     },
     {
      "title": "Add an explanation.",
      "text": "Tap the note button, choose free text or note box, then tap next to your mark and type something like ‘The button label is cut off’. Choosing a look like a yellow sticky note in Pen & colors → Text box styles makes it easier to see."
     },
     {
      "title": "Check all your marks once more.",
      "text": "Remove mistakes with Undo (Ctrl/⌘ Z) or the eraser. Drag marks with the select tool to reposition them. If the image looks small, use A+ to enlarge the image and marks together."
     },
     {
      "title": "Send it.",
      "text": "From Export at the top of the document, choose Reading copy (HTML) if the recipient will just view it in a browser, or Archive with original (.librememo) if they will keep editing the marks in LibreMemo."
     }
    ]
   },
   {
    "title": "Good to know",
    "bullets": [
     "The original image is kept as is, and your marks are saved separately.",
     "Text inside images can’t be selected or searched (no OCR). Use a note to describe the content.",
     "HEIC, TIFF, PSD and RAW are not supported, so convert them to PNG or JPEG before importing."
    ]
   }
  ],
  "related": [
   "image-documents",
   "pen-and-shapes",
   "text-styles",
   "export-html",
   "colors"
  ]
 },
 {
  "id": "tut-meeting-notes",
  "group": "tutorial",
  "title": "Paste meeting notes and pull out the action items",
  "summary": "Paste text from a notes app or messenger to make a document, mark decisions and to-dos, and gather them again.",
  "keywords": "meeting notes minutes meeting memo to-do todo action items decisions tasks work organize paste text markdown checklist bookmark excerpts tutorial",
  "sections": [
   {
    "title": "When to use this",
    "paragraphs": [
     "Use this to organize content that’s already written down, such as meeting notes, lecture notes or messenger chats. Marking decisions and to-dos lets you check them quickly before the next meeting."
    ]
   },
   {
    "title": "Follow along",
    "steps": [
     {
      "title": "Paste the text to make a document.",
      "text": "Copy the whole set of meeting notes, then click outside any input field in your Library and press Ctrl+Shift+V (⌘+Shift+V on Mac), or open Paste text. Paste into “Content”, enter a title like ‘November planning meeting’, and tap Save and annotate."
     },
     {
      "title": "Markdown is formatted as is.",
      "text": "Text written with # headings, - lists, - [ ] checklists, tables and code blocks appears formatted in the reading view. Meeting notes that use # headings show each agenda item in the sidebar contents."
     },
     {
      "title": "Give colors work names.",
      "text": "In Highlight color names under Pen & colors, save one color as ‘Decision’ and another as ‘To-do’."
     },
     {
      "title": "Mark as you read.",
      "text": "Highlight decisions in the ‘Decision’ color and tasks someone needs to do in the ‘To-do’ color. Select the sentence and add the owner or deadline as a note."
     },
     {
      "title": "Gather just the to-dos.",
      "text": "Choose ‘To-do’ in Sidebar → Annotations → All annotations to see only the to-dos. Type an owner’s name into Search my annotations to narrow it down to that person’s tasks."
     },
     {
      "title": "Bookmark the spot to check at the next meeting.",
      "text": "In the sidebar’s bookmarks view, tap Save current position and name it something like ‘Check at next meeting’."
     },
     {
      "title": "Share the summary.",
      "text": "Copy the marked sentences and notes as Markdown with Export → Copy excerpt notes and paste them into your team messenger or document."
     }
    ]
   },
   {
    "title": "Good to know",
    "bullets": [
     "You can paste up to 200,000 characters.",
     "If the text has an original address, enter it in Source address (optional). An Open original link is added at the end of the document.",
     "For completed to-dos, tap the mark with the select tool to change it to another color, or strike it through."
    ]
   }
  ],
  "related": [
   "web-and-paste",
   "colors",
   "search-outline",
   "export-html",
   "annotations"
  ]
 },
 {
  "id": "tut-office-review",
  "group": "tutorial",
  "title": "Review Excel spreadsheets and presentation slides",
  "summary": "Open XLSX and PPTX files, move between sheets and slides, mark numbers and wording, and send them back with the original.",
  "keywords": "Excel spreadsheet XLSX XLS CSV ODS table sheet PowerPoint PPTX ODP slides presentation deck review check numbers cell comments typos tutorial",
  "sections": [
   {
    "title": "When to use this",
    "paragraphs": [
     "Use this when you want to review a performance report or presentation you received without changing it. You can read and mark it even on a device without Office installed."
    ]
   },
   {
    "title": "Reviewing spreadsheets",
    "steps": [
     {
      "title": "Open the file.",
      "text": "Choose an XLSX, XLS, CSV or ODS file in Library → Import files. Sheet names appear in the sidebar contents. Hidden sheets are listed too, labeled “Hidden sheet”."
     },
     {
      "title": "Move between sheets.",
      "text": "Tap a sheet name in the contents. Scroll wide tables left and right inside the table. If a cell has an “Original comment”, tap it to expand and read it."
     },
     {
      "title": "Find the numbers to check.",
      "text": "Type an account name or number into the sidebar’s search. Even in wide tables, the scroll inside the table moves too so the match stays visible."
     },
     {
      "title": "Mark suspicious cells.",
      "text": "Drag across a cell’s text to highlight it, or tap the highlighter again, choose area highlight and draw a rectangle around several cells. Write the reason in a note."
     }
    ]
   },
   {
    "title": "Reviewing slides",
    "steps": [
     {
      "title": "Open the slides.",
      "text": "When you import a PPTX or ODP, slide numbers and titles appear in the contents. Tap a number to go to that slide."
     },
     {
      "title": "Mark wording and images.",
      "text": "Underline or strike through typos and awkward sentences, and point to charts or images with the pen, rectangle or arrow. Write suggested changes in a note box beside them."
     },
     {
      "title": "Send back your review.",
      "text": "Choose Export → Archive with original (.librememo) to bundle the Office original with your marks and notes. If the recipient opens it in LibreMemo, they can pick up right where you left off. To show only the marked-up view, choose Reading copy (HTML)."
     }
    ]
   },
   {
    "title": "Good to know",
    "bullets": [
     "It is read-only, so the original cells and slide content never change.",
     "Interactive chart and pivot features, slide animations and videos are not shown. Formulas without saved results appear as text.",
     "Save older DOC and PPT files as DOCX and PPTX in their original app before importing."
    ]
   }
  ],
  "related": [
   "office-documents",
   "annotations",
   "pen-and-shapes",
   "search-outline",
   "export-html"
  ]
 },
 {
  "id": "tut-hwp-review",
  "group": "tutorial",
  "title": "Review Hangul (HWP) documents and reports page by page",
  "summary": "Open HWP files without the Hangul word processor, mark them as you move between pages, and send your review comments with the original.",
  "keywords": "Hangul HWP HWPX HML Korean word processor official letter report approval draft review comments go to page table proofread markup tutorial",
  "sections": [
   {
    "title": "When to use this",
    "paragraphs": [
     "Use this when you receive an HWP or HWPX official letter, report or application on a computer or phone without the Hangul word processor, and want to read it and leave review comments."
    ]
   },
   {
    "title": "Follow along",
    "steps": [
     {
      "title": "Open the file.",
      "text": "Choose an HWP, HWPX or HML file in Library → Import files, or drag it into the app. Processing happens on your device, and you don’t need to install the Hangul app."
     },
     {
      "title": "Move between pages.",
      "text": "Tap a page number such as “Page 3” in the sidebar contents, or use Previous section and Next section in the toolbar to see the pages before and after."
     },
     {
      "title": "If the text is small, enlarge everything together.",
      "text": "Tap A+ to enlarge text, images and marks together while keeping the original page layout. Scroll left and right on wider pages."
     },
     {
      "title": "Mark sentences that need fixing.",
      "text": "Drag across text in the body to highlight or underline it, and use the pen or rectangle over table cells or images. Write the changes you suggest in a note."
     },
     {
      "title": "Find and check dates or amounts.",
      "text": "Type what you want to check, such as ‘2026’ or ‘won’, into the sidebar’s search and tap the results one by one."
     },
     {
      "title": "Send your review comments.",
      "text": "Export → Archive with original (.librememo) bundles the Hangul original with your marks. If the recipient doesn’t use LibreMemo, send the marked-up view as a Reading copy (HTML)."
     }
    ]
   },
   {
    "title": "Good to know",
    "bullets": [
     "Hangul fonts that aren’t on your device are shown with substitute fonts included in the app. Special fonts or complex layouts may look different from the original app.",
     "For password-protected documents, save a copy without the password in the Hangul word processor, then import it.",
     "This does not edit the original content. Send the changes you want as notes."
    ]
   }
  ],
  "related": [
   "hangul-documents",
   "annotations",
   "search-outline",
   "export-html"
  ]
 },
 {
  "id": "tut-scan-handwriting",
  "group": "tutorial",
  "title": "Handwrite on scanned documents and images",
  "summary": "Write on scanned PDFs, DjVu and comics where text can’t be selected using the pen and area marks, and use a disappearing pen when presenting.",
  "keywords": "scan scanned PDF DjVu comics manga CBZ handwriting handwritten notes pen tablet stylus Apple Pencil area highlight temporary pen laser pointer presentation screen sharing tutorial",
  "sections": [
   {
    "title": "When to use this",
    "paragraphs": [
     "Use this when you want to write directly on material where text can’t be selected, such as PDFs or DjVu scanned from paper, photos of documents, or comics. With a tablet and stylus, you can write as if on paper."
    ]
   },
   {
    "title": "Follow along",
    "steps": [
     {
      "title": "Open the material.",
      "text": "Open a scanned PDF, DjVu, CBZ or photo with Import files. For documents with several pages, move using the page numbers in the sidebar contents."
     },
     {
      "title": "Mark paragraphs with area highlight.",
      "text": "Tap the highlighter in the floating toolbar once more to choose area highlight, then drag a rectangle over the lines or paragraph to mark. That part is highlighted even if the text can’t be selected."
     },
     {
      "title": "Write with the pen.",
      "text": "Choose the pen and write in the margin. Lift between strokes and keep writing. Tapping once and lifting leaves a dot. Choose the thickness and color in Pen & colors."
     },
     {
      "title": "Move the document while writing.",
      "text": "On a phone or tablet, place two fingers and move them together to scroll the document. The line you were drawing is canceled, so lift all fingers and then write again with one finger or the stylus. Two-finger scrolling on a Mac trackpad works too."
     },
     {
      "title": "Emphasize key spots with shapes.",
      "text": "Point to important parts of images and tables with the rectangle, or with the circle or arrow in document tools."
     },
     {
      "title": "Check that handwriting you want to keep is saved permanently.",
      "text": "Your handwriting stays only if Pen & colors → Pen display time is set to Keep permanently. You can find saved handwriting under ‘Pen drawing’ in Sidebar → Annotations."
     }
    ]
   },
   {
    "title": "A disappearing pen for presentations",
    "paragraphs": [
     "When explaining while sharing your screen, set Pen display time to 3, 10 or 30 seconds. Lines appear briefly, then fade away and are not saved in the document. When you’re done, switch it back to Keep permanently."
    ]
   },
   {
    "title": "Good to know",
    "bullets": [
     "If a scanned PDF or DjVu also stores text information, you can select, search and use Read aloud (selection) on it. Image-only pages don’t support text recognition (OCR).",
     "Remove mistaken strokes with Undo or the eraser. Thin lines can be picked up by tapping right next to them."
    ]
   }
  ],
  "related": [
   "pen-and-shapes",
   "djvu-documents",
   "pdf-documents",
   "ebook-documents",
   "erase-undo"
  ]
 },
 {
  "id": "tut-listen-commute",
  "group": "tutorial",
  "title": "Listen to documents while on the go",
  "summary": "Listen to long texts with Read aloud, adjust speed and voice, and resume from the sentence you want.",
  "keywords": "TTS text to speech read aloud listen commute travel audiobook narration speed voice resume listening read selection tutorial",
  "sections": [
   {
    "title": "When to use this",
    "paragraphs": [
     "Use this when you want to take in a report, article or book by ear instead of by eye, on your commute or while exercising. You can listen to just part of it, or resume from where you stopped."
    ]
   },
   {
    "title": "Follow along",
    "steps": [
     {
      "title": "Go to where you want to listen.",
      "text": "Open the document and use the contents or scroll to put the part you want to hear at the top of the screen."
     },
     {
      "title": "Start reading aloud.",
      "text": "Tap the speaker to the left of the text size buttons in the document toolbar to open the Read aloud toolbar, then tap ▶. It reads from the start of the sentence containing the top visible line. Fixed header lines and the contents are skipped."
     },
     {
      "title": "Choose a voice and speed.",
      "text": "Choose the language and voice under the gear icon. Each tap of the speed button, shown like 1×, switches between 0.8, 1, 1.25, 1.5 and 2×, starting from the next sentence."
     },
     {
      "title": "Move between sentences.",
      "text": "Use ⏮ and ⏭ to hear the previous or next sentence, and ⏹ to stop. In continuous scroll, the sentence being read is underlined so you can follow along with your eyes."
     },
     {
      "title": "After pausing, resume from the sentence you want.",
      "text": "While paused, tap once on the text of the sentence where you want to start, then tap ▶. If you tap ▶ without tapping anything, it rereads from the start of the sentence where it stopped."
     },
     {
      "title": "Select text to hear just one part.",
      "text": "Drag over the paragraph you want to hear and tap Read aloud in the selection menu; it reads only the selected range and stops."
     }
    ]
   },
   {
    "title": "Listening offline",
    "paragraphs": [
     "Check in your device’s speech settings beforehand that a voice usable offline is installed. Some voices may need the internet, so for sensitive text, check your device and browser speech service settings before listening."
    ]
   },
   {
    "title": "Good to know",
    "bullets": [
     "In e-books read page by page, pages turn as it follows the sentences.",
     "In books that load chapters one after another, it stops at the end of the loaded part. Open the next chapter and tap ▶.",
     "If there is no sound, check the device volume and output device, and the voice under the gear icon."
    ]
   }
  ],
  "related": [
   "speech",
   "speech-problems",
   "reading-settings",
   "offline",
   "privacy"
  ]
 },
 {
  "id": "tut-research-library",
  "group": "tutorial",
  "title": "Build and organize a Library by topic",
  "summary": "Create folders to collect material, pin what you use often with a star, and find things quickly across your whole Library.",
  "keywords": "Library organize folders by topic project research material collect star pin favorites find search sort cards list move tutorial",
  "sections": [
   {
    "title": "When to use this",
    "paragraphs": [
     "Use this when you keep collecting material on one topic, such as a thesis, a job search or travel plans. Splitting it into folders and pinning frequently used material to the top lets you open the document you want right away."
    ]
   },
   {
    "title": "Follow along",
    "steps": [
     {
      "title": "Create a topic folder.",
      "text": "Tap the book-shaped Library button at the top, tap New folder and enter a name like ‘Thesis material’. Inside it, use New folder again to make subfolders such as ‘Prior research’ and ‘Data’."
     },
     {
      "title": "Import material from inside the folder.",
      "text": "Open the folder you want to add material to first, then use Import files, Paste text or Paste image, and it is saved in that folder. You can choose several files at once."
     },
     {
      "title": "Move material you put in the wrong place.",
      "text": "Choose ⋯ → Move to folder on a document, or drag the document with the mouse onto another folder or a path above. For a folder itself, use ⋯ → Move to another folder."
     },
     {
      "title": "Pin key material with a star.",
      "text": "Tap the star (☆) on the right of a card or list row. Starred documents and folders gather at the top, with the most recently starred first."
     },
     {
      "title": "Choose a view.",
      "text": "Compare similar documents in card view, which shows previews of the first page, images or thumbnails and the annotation count, or in list view, which shows the file name next to the title. Under Sort, choose by date modified, date saved or title."
     },
     {
      "title": "Find things wherever they are.",
      "text": "Type a search term into “Search by title, file name, address or folder” to search your whole Library, including subfolders. In a result’s ⋯, you can check the path of the folder containing that document."
     },
     {
      "title": "Tidy up material you’re done with.",
      "text": "Move documents you no longer need with ⋯ → Move to Trash. Their annotations and history are kept with them, so you can restore them anytime. Remove emptied folders with ⋯ → Delete empty folder."
     }
    ]
   },
   {
    "title": "Good to know",
    "bullets": [
     "Library search looks at titles, file names, addresses and folders. To search document text or your notes, open the document and use the sidebar’s search or Search my annotations.",
     "Just moving files into the dedicated folder with your computer’s file manager does not add them to your Library. Choose them with Import files."
    ]
   }
  ],
  "related": [
   "library",
   "import-files",
   "trash",
   "storage-folder",
   "search-outline"
  ]
 },
 {
  "id": "tut-share-annotations",
  "group": "tutorial",
  "title": "Send your annotations to a friend and read together",
  "summary": "Send the original and its annotations as one file; the recipient opens it in their own Library, adds marks, and sends it back.",
  "keywords": "share send forward friend colleague coworker study group read together send annotations receive librememo archive file import duplicate open as new tutorial",
  "sections": [
   {
    "title": "When to use this",
    "paragraphs": [
     "Use this when you want to hand a book or document you’ve marked to a study partner or colleague as it is, and get it back with their comments added."
    ]
   },
   {
    "title": "Sender",
    "steps": [
     {
      "title": "Check the annotations you’ll send.",
      "text": "Open the document and look through Sidebar → Annotations and bookmarks. All current annotations and bookmarks are included, so delete any personal notes first."
     },
     {
      "title": "Export as an archive file.",
      "text": "Tap Export at the top of the document, leave Archive with original (.librememo) selected as the default, and tap Export. A .librememo file is saved."
     },
     {
      "title": "Send the file along with the app address.",
      "text": "Send the file by messenger or email. If the recipient is new to the app, also share its address with Settings → Launch and share app → Copy URL."
     }
    ]
   },
   {
    "title": "Recipient",
    "steps": [
     {
      "title": "Import the file you received.",
      "text": "In LibreMemo, choose the .librememo file in Library → Import files or drag it into the window. On first import, the sender’s annotations and bookmarks open with it."
     },
     {
      "title": "Add your comments.",
      "text": "Add your own thoughts with a different highlight color or notes. To tell them apart easily, you can name your color something like ‘Alex’s comments’ in Pen & colors."
     },
     {
      "title": "Send it back.",
      "text": "Save it the same way with Export → Archive with original (.librememo) and send it."
     }
    ]
   },
   {
    "title": "When you open the returned file",
    "bullets": [
     "A .librememo returned with added annotations is a different file from the one you sent, so it opens as a new document with the other person’s annotations. Your original document stays as it is, so open both in tabs side by side to compare.",
     "If you import exactly the same archive file again, choose from Go to existing annotation file (opens the document already imported), Open as new (a new copy with no annotations), or Cancel.",
     "When you finish comparing, move the one you no longer need to Trash."
    ]
   },
   {
    "title": "Good to know",
    "paragraphs": [
     "Copies you send can’t be recalled remotely. This is not a feature for two people editing the same Library together in real time. To keep your Library in step across your own devices, use Device sync."
    ]
   }
  ],
  "related": [
   "export-html",
   "import-files",
   "privacy",
   "sync-tutorial",
   "colors"
  ]
 },
 {
  "id": "tut-ai-reading",
  "group": "tutorial",
  "title": "Read with help from AI on difficult sentences",
  "summary": "When you hit an unfamiliar concept, send the sentence to an AI service for an explanation, then keep what you learned as a note.",
  "keywords": "AI search ChatGPT Claude Gemini Perplexity ask question explain explanation translate summarize difficult sentence concept understand note tutorial",
  "sections": [
   {
    "title": "When to use this",
    "paragraphs": [
     "Use this when you get stuck reading text full of technical terms, a book in a foreign language, or a difficult theory book. You can send the selected sentence straight to the web page of the AI service you use and ask about it."
    ]
   },
   {
    "title": "One-time setup",
    "steps": [
     {
      "title": "Choose the services to use.",
      "text": "Open Settings → AI search → Manage at the top. ChatGPT, Claude, Gemini and Perplexity are already listed. Check only the services you’ll use. If only one is checked, it opens right away; if several are, you choose each time you send."
     },
     {
      "title": "Sign in to the service.",
      "text": "Sign in to that service’s website in your browser. You don’t need to enter an API key in LibreMemo."
     }
    ]
   },
   {
    "title": "Asking as you read",
    "steps": [
     {
      "title": "Select the sentence you’re stuck on.",
      "text": "Drag across the sentence or term you don’t understand."
     },
     {
      "title": "Tap AI search.",
      "text": "Tap AI search in the selection menu and the service page opens in a new tab. For services that accept text in the address, your question is already filled in; for others, the text has been copied, so paste it into the input box."
     },
     {
      "title": "Ask the way you want.",
      "text": "Follow up with questions like ‘Explain this in plain words’, ‘Give me an example’ or ‘Translate this into English’."
     },
     {
      "title": "Keep what you learned as a note.",
      "text": "Come back to LibreMemo, select the same sentence, tap Note and summarize it in your own words. The AI’s answer is not saved in LibreMemo automatically."
     },
     {
      "title": "Mark places to revisit.",
      "text": "Highlight concepts to check again later with the ‘Question’ color so you can gather them in the sidebar."
     }
    ]
   },
   {
    "title": "Good to know",
    "bullets": [
     "Up to the first 2,000 characters can be sent in the address. For longer text, it tries to copy the whole text and tells you the result.",
     "The text you send is processed by the service you chose. Don’t send sentences containing personal information or company secrets.",
     "Tapping Web search searches the same text in a regular Chrome tab."
    ]
   }
  ],
  "related": [
   "ai-search",
   "annotations",
   "privacy",
   "tut-study-colors"
  ]
 },
 {
  "id": "tut-new-edition-move",
  "group": "tutorial",
  "title": "Move annotations to a new edition of a book",
  "summary": "Move the marks, notes and bookmarks from an old edition to the same sentences in the new edition, and check the result.",
  "keywords": "new edition revised edition new version update move annotations transfer migrate move bookmarks old book updated file tutorial",
  "sections": [
   {
    "title": "When to use this",
    "paragraphs": [
     "Use this when you get a revised edition or new version of a book or manual you were studying and don’t want to redo all the marks and notes from the old edition."
    ]
   },
   {
    "title": "Follow along",
    "steps": [
     {
      "title": "Open the old edition.",
      "text": "Open the old document that has the annotations and bookmarks."
     },
     {
      "title": "Start the move.",
      "text": "Tap ⋯ (document tools) in the floating toolbar → Move annotations/bookmarks to a new edition. You can also open the old document’s menu in your Library."
     },
     {
      "title": "Choose the new edition file.",
      "text": "Select the new edition file you received. Large books may take a while because it searches for matching sentences."
     },
     {
      "title": "Read the result.",
      "text": "You see how many annotations and bookmarks can be moved and how many can’t. Bookmarks are split into those whose exact position was found and those moved to the start of a chapter, and contents entries you renamed are moved too."
     },
     {
      "title": "Open the new edition.",
      "text": "When you’ve checked, tap Open new edition. The new edition opens as a new document and the old book stays as it is. If you cancel, nothing is moved."
     },
     {
      "title": "Fill in what couldn’t be moved.",
      "text": "Look at the list of items that couldn’t be moved in the result window, find that content in the new edition and mark it again yourself. Annotations on sentences that were removed are not moved."
     },
     {
      "title": "Tidy up.",
      "text": "After confirming the annotations look right in the new edition, move the old edition to Trash if you no longer need it."
     }
    ]
   },
   {
    "title": "Good to know",
    "bullets": [
     "Even if spacing, line breaks or paragraph structure change, or content moves to another chapter, it finds matches using the surrounding context.",
     "Items without text to anchor them, such as margin bookmarks on scanned pages or pen drawings over images, are not moved.",
     "Even if the new edition is a PDF, sentences are found the same way and placed on the new pages."
    ]
   }
  ],
  "related": [
   "new-edition",
   "annotation-history",
   "trash",
   "search-outline"
  ]
 },
 {
  "id": "tut-undo-recover",
  "group": "tutorial",
  "title": "Recover annotations and documents you deleted by mistake",
  "summary": "Reverse a mistake you just made with Undo, go back to an earlier state with annotation history, and bring back deleted documents from Trash.",
  "keywords": "recover restore undo revert mistake deleted erased removed annotation history previous version earlier state Trash restore clear all annotations tutorial",
  "sections": [
   {
    "title": "When to use this",
    "paragraphs": [
     "Here’s what to check, in order, when you’ve deleted an annotation by mistake, tapped Clear all annotations, or moved a document to Trash."
    ]
   },
   {
    "title": "If you just made the mistake",
    "steps": [
     {
      "title": "Tap Undo.",
      "text": "Tap Undo in the floating toolbar or press Ctrl/⌘ Z. If you went back too far, go forward with Redo (Ctrl/⌘ Shift Z). You can also undo right after Clear all annotations."
     }
    ]
   },
   {
    "title": "If some time has passed",
    "steps": [
     {
      "title": "Open annotation history.",
      "text": "Open the document and tap ⋯ (document tools) in the floating toolbar → Annotation history."
     },
     {
      "title": "Find the day.",
      "text": "Choose the year, month and day, or use Previous date and Next date to move between days with records. If a day has many records, page through them 50 at a time."
     },
     {
      "title": "Preview and restore.",
      "text": "Tap a point in time to see the annotation and bookmark counts and a preview from then. If it’s the right one, tap Restore to this point. The state just before restoring is also kept in history, so you can go back again if you chose wrong."
     }
    ]
   },
   {
    "title": "If you deleted a document",
    "steps": [
     {
      "title": "Open Trash.",
      "text": "Open Trash in your Library and tap Restore in the menu of the document to bring back. It returns to its original folder if that folder still exists, otherwise to the top level."
     },
     {
      "title": "Check that its annotations came back too.",
      "text": "Open the restored document and check its annotations and bookmarks. Documents moved to Trash keep their annotations, bookmarks and history intact."
     }
    ]
   },
   {
    "title": "When it can’t be undone",
    "paragraphs": [
     "Delete permanently and Empty Trash in Trash can’t be undone. The × on a tab doesn’t delete the document; it only closes the open tab, so just reopen it from your Library. As a safeguard, on a computer or Android, copy the entire dedicated folder from time to time."
    ]
   }
  ],
  "related": [
   "erase-undo",
   "annotation-history",
   "trash",
   "backup-restore",
   "backup-tutorial"
  ]
 },
 {
  "id": "tut-focus-reading",
  "group": "tutorial",
  "title": "Read for a long time without distractions",
  "summary": "Use full screen, a dark theme and a comfortable text size to rest your eyes, and bring out tools only when you need them.",
  "keywords": "focus immersive distraction free full screen dark theme dark mode night mode eye strain text size font size UI size move toolbar sidebar width reading environment tutorial",
  "sections": [
   {
    "title": "When to use this",
    "paragraphs": [
     "When you read a long text in one sitting and want to focus on the text without other parts of the screen pulling your eyes away."
    ]
   },
   {
    "title": "Step by step",
    "steps": [
     {
      "title": "Choose the brightness.",
      "text": "In Settings at the top, pick Dark under Appearance, or pick System to follow your device’s brightness setting. You can also open Design theme → Choose theme and pick a theme with a background and font that are easy on your eyes."
     },
     {
      "title": "Adjust the body text.",
      "text": "Use A+ and A− on the document toolbar to set the text size, and choose an easy-to-read font in the font picker. Each document remembers its own settings."
     },
     {
      "title": "Adjust the tool text too.",
      "text": "If the contents or menu text is too small, go to Settings → UI text size → Adjust size and enlarge the whole screen or just the sidebar contents. Choose anything from 60 to 200%."
     },
     {
      "title": "Enter full screen.",
      "text": "Double-click or double-tap an empty spot in the text. On a keyboard, press F. The sidebar closes and the text fits the screen width, while the tabs at the top, the document toolbar and the annotation toolbar stay available."
     },
     {
      "title": "Move the toolbar to the edge.",
      "text": "Drag the floating toolbar by its handle to a spot where it doesn’t cover the text."
     },
     {
      "title": "Do the same thing to leave.",
      "text": "Double-click the empty spot again or press Esc to return to your previous zoom and sidebar state."
     }
    ]
   },
   {
    "title": "Using the sidebar at the same time",
    "paragraphs": [
     "To keep the contents beside the text, drag the right edge of the sidebar to make it narrower. Double-click the edge to go back to the default width. If you closed the sidebar with ✕, reopen it with ☰ at the far left of the document toolbar."
    ]
   }
  ],
  "related": [
   "reading-view",
   "design-themes",
   "reading-settings",
   "search-outline",
   "keyboard"
  ]
 },
 {
  "id": "tut-phone-reading",
  "group": "tutorial",
  "title": "Read and mark up comfortably on your phone",
  "summary": "Put the app on your phone’s home screen, highlight with your finger, and find the tools even on a narrow screen.",
  "keywords": "phone mobile smartphone iPhone Android touch finger highlighter highlight two-finger scroll add to home screen install app swipe toolbar tutorial",
  "sections": [
   {
    "title": "When to use this",
    "paragraphs": [
     "When you read and mark up material on your phone, on the subway or in bed. You get the same tools as on a computer, even on a small screen."
    ]
   },
   {
    "title": "Step by step",
    "steps": [
     {
      "title": "Put the app on your home screen.",
      "text": "Go to Settings → Launch and app delivery → Install app. On iPhone and iPad, choose Share → Add to Home Screen in Safari or Chrome. From then on, open it straight from the icon. The home screen app and a browser tab may have different Libraries, so pick one and stick with it."
     },
     {
      "title": "Highlight with your finger.",
      "text": "Choose the highlighter on the floating toolbar, check that it is set to text highlight, then drag your finger along the text you want to mark and lift it."
     },
     {
      "title": "Scroll with two fingers while marking.",
      "text": "While a tool such as the highlighter or pen is selected, one finger draws a mark. To move the document, place two fingers and swipe, or go back to the select tool and scroll with one finger."
     },
     {
      "title": "Find hidden tools.",
      "text": "Swipe the button area of the floating toolbar to the left to reveal the tools at the right end. If the toolbar covers the text, drag it by its handle. The document toolbar also scrolls sideways so you can reach the buttons on the right."
     },
     {
      "title": "Open and close the sidebar.",
      "text": "Tap ☰ at the far left of the document toolbar to open the contents, search and annotations. Tap the text once to close a sidebar that is open over it."
     },
     {
      "title": "Lower the keyboard to review long notes.",
      "text": "When you finish writing a note, lower the keyboard to see more of the document. Note text grows along with A+ and A−."
     }
    ]
   },
   {
    "title": "Good to know",
    "bullets": [
     "Android Chrome may ask again for permission to use the storage folder when you reopen the app. Tap Continue on the Continue where you left off screen to open the same Library.",
     "iPhone and iPad use in-app storage. Before clearing site data, sync with another device or export important documents as archive files.",
     "If you use both a phone and a computer, keep your Library in step with “Connect your Mac and phone and pick up where you left off.”"
    ]
   }
  ],
  "related": [
   "keyboard",
   "reading-view",
   "offline",
   "storage-folder",
   "sync-tutorial"
  ]
 },
 {
  "id": "tut-personal-style",
  "group": "tutorial",
  "title": "Personalize your Library and writing tools",
  "summary": "Pick a design theme, build a palette from your favorite pen colors, and save note box styles.",
  "keywords": "customize personalize design theme palette pen color custom colors text box styles sticky note post-it favorites texture font appearance tutorial",
  "sections": [
   {
    "title": "When to use this",
    "paragraphs": [
     "When you want the app you use every day to match your taste, and want to stop picking colors every time you take notes."
    ]
   },
   {
    "title": "Change the look of your Library",
    "steps": [
     {
      "title": "Preview themes.",
      "text": "Open Settings at the top → Design theme → Choose theme. Each card shows sample fonts, background and accent colors, and tapping a card applies it right away. Choose Light, Dark or System under Brightness and the cards are shown again in that brightness."
     },
     {
      "title": "Find the mood you want.",
      "text": "Type a name or mood such as “manuscript paper” or “aurora” in the search box, or browse with Show all 80 and the 10 categories. Suggest a mood picks another theme and applies it for you."
     },
     {
      "title": "Star the ones you like.",
      "text": "Tap the star at the top right of a card to collect it under ★ Favorites."
     },
     {
      "title": "Fine-tune the details.",
      "text": "In the custom detail style combination, change the corner shape, background texture, app font and accent color. To reset just one item, tap Theme default in that list."
     }
    ]
   },
   {
    "title": "Build your own pen palette",
    "steps": [
     {
      "title": "Collect the colors you use most.",
      "text": "Open Pen & colors on the floating toolbar, choose a color, then tap + Add color under Custom colors. Collect three or four."
     },
     {
      "title": "Save them as a palette.",
      "text": "Type a name such as “Study” in New palette name and tap + Save palette. Next time, choose it from Custom palettes under Palette presets."
     },
     {
      "title": "Give your colors meanings.",
      "text": "In the same palette, expand Highlight color names and give each color a name such as “Key point” or “Question.” Names are remembered separately for each palette."
     }
    ]
   },
   {
    "title": "Save a note box style",
    "steps": [
     {
      "title": "Choose a style.",
      "text": "In Pen & colors → Text box styles, pick Yellow sticky note, Chalkboard, Large heading and so on, or set the text size, bold, text color, background and border yourself."
     },
     {
      "title": "Save it as your own style.",
      "text": "Type a name in + Save as my style. You can save up to 30 and use them right away for your next note."
     }
    ]
   },
   {
    "title": "To use them on other devices",
    "paragraphs": [
     "Turn on Sync app settings too in Device sync, and your design theme, UI text size, highlight color names and more stay in step. To keep only your settings, use Save settings file under Settings → Use a previous settings JSON file."
    ]
   }
  ],
  "related": [
   "design-themes",
   "colors",
   "text-styles",
   "device-sync",
   "storage-differences"
  ]
 },
 {
  "id": "import-files",
  "group": "features",
  "title": "Importing documents and duplicates",
  "summary": "Explains supported files, opening several files at once, and choices for files you already have.",
  "keywords": "open import load add file upload html htm mhtml mht librememo duplicate copy supported formats file types",
  "sections": [
   {
    "title": "How to open files",
    "paragraphs": [
     "In Library, first open the folder where you want to keep the file, then tap “Import files.” If you choose several files together, they are stored in the selected folder one after another and each opens in its own document tab. You can also drag files onto the app or onto the document you are reading. To read an imported file again later, tap its title in the Library."
    ]
   },
   {
    "title": "Supported files at a glance",
    "table": {
     "headings": [
      "Type",
      "Extensions"
     ],
     "rows": [
      [
       "Web documents and PDF",
       "HTML, HTM, MHTML, MHT, PDF"
      ],
      [
       "E-books and comics",
       "EPUB, EPUB3, MOBI, AZW, AZW3, FB2, FBZ, FB2.ZIP, CBZ"
      ],
      [
       "Scanned documents",
       "DJVU, DJV"
      ],
      [
       "Hangul (HWP)",
       "HWP, HWPX, HML"
      ],
      [
       "Word and OpenDocument documents",
       "DOCX, ODT, OTT"
      ],
      [
       "Tables and spreadsheets",
       "XLSX, XLSM, XLS, CSV, TSV, ODS, OTS"
      ],
      [
       "Slides",
       "PPTX, ODP, OTP"
      ],
      [
       "Markdown, text and data",
       "MD, MARKDOWN, TXT, JSON"
      ],
      [
       "Images and screenshots",
       "PNG, APNG, JPG, JPEG, JPE, JFIF, WebP, AVIF, GIF, BMP, SVG"
      ],
      [
       "Subtitles",
       "SRT, VTT, SMI, SAMI, ASS, SSA"
      ],
      [
       "Archive files with annotations",
       "LIBREMEMO"
      ]
     ]
    }
   },
   {
    "title": "If the same file is already there",
    "paragraphs": [
     "If you choose a file whose original content is the same as one you already have, you see “This document is already imported.” Documents with the same file name but different content are kept separately. If you have several copies made from the same file, look at the title, annotation count and last modified time in the “Existing annotation files” list and pick the copy you want."
    ],
    "bullets": [
     "Go to existing annotation file: continue with the annotations and bookmarks in the selected copy.",
     "Open as new: make a new copy of the same text with no annotations or bookmarks.",
     "Cancel: stop this import."
    ]
   },
   {
    "title": "To keep images and resources together",
    "paragraphs": [
     "Files that include their resources, such as single-file HTML or MHTML, work best. Images, styles, fonts and other resources inside an MHTML file are unpacked and stored, but resources that weren’t included when the file was saved can’t be recovered. The original file you import is never changed or deleted automatically."
    ]
   },
   {
    "title": "Starting from images and YouTube",
    "paragraphs": [
     "Bring in a copied screenshot with Library → Paste image, or press Ctrl/⌘ V outside any input field. Open a video address with Library → YouTube. Choose a YouTube subtitle ZIP with Choose subtitle file in that window; regular Import files does not unpack an arbitrary ZIP into your Library.",
     "Text recognition (OCR) for image-only material and removing DRM or password protection are not provided. A file being large doesn’t mean every device can open it; if you hit limits on display size, processing time or device memory, import it in parts. See the Help topic for each format for details."
    ]
   }
  ],
  "related": [
   "library",
   "pdf-documents",
   "hangul-documents",
   "office-documents",
   "ebook-documents",
   "image-documents",
   "subtitle-documents",
   "djvu-documents",
   "web-and-paste",
   "export-html"
  ]
 },
 {
  "id": "djvu-documents",
  "group": "features",
  "title": "Reading DjVu scanned documents",
  "summary": "Read and search DjVu files in the same view, and add annotations and bookmarks.",
  "keywords": "DjVu DJV scan scanned document e-book djvu-rs read-only OCR text layer",
  "sections": [
   {
    "title": "How to open",
    "paragraphs": [
     "Choose a .djvu or .djv file in Library → Import files, or drag it onto the app. Single-page files and bundled DjVu files that combine many pages are supported. No separate program, extension or conversion server is needed, and once the app is ready for offline use, you can import without an internet connection."
    ]
   },
   {
    "title": "Marking up scans and finding text",
    "paragraphs": [
     "When you first open a multi-page document, you see how many pages are being prepared. Tap a page number in the sidebar contents to go there. On top of a scan you can use the pen, shapes, area highlight and notes.",
     "On pages that store text positions, you can select text on the scan to underline it, search it or use TTS. On pages that store only the text content, select the text shown under “Text on this page” below the scan. Image-only pages don’t support text recognition (OCR). For books with many pages, the resolution of the reading images is adjusted, and the original scans are kept in the dedicated folder."
    ]
   },
   {
    "title": "Keeping and sharing the original",
    "paragraphs": [
     "The DjVu original is kept byte for byte with its extension, and the reading view, annotations and bookmarks are saved separately. To send everything together, use Export → Archive with original (.librememo). The Reading copy (HTML) contains the converted scan pages and annotations."
    ]
   },
   {
    "title": "Support and errors",
    "paragraphs": [
     "An indirect DjVu split across several files must first be saved as a single file containing all pages. Linked external files are not downloaded automatically. The original’s built-in contents, links and notes are not run or imported; LibreMemo uses its own page contents and your new annotations and bookmarks.",
     "Limits: 2GB per file, up to 10,000 pages, 40 million pixels and 32,768 pixels per side per page, 2GB of reading view and 10 minutes for the initial processing. If a file is damaged, over a limit or fails to convert, it is not added to the Library and you are told why. Import large books in parts. Once the reading view is saved, it is not converted again."
    ]
   }
  ],
  "related": [
   "import-files",
   "reading-view",
   "annotations",
   "search-outline",
   "export-html"
  ]
 },
 {
  "id": "ebook-documents",
  "group": "features",
  "title": "Reading EPUB, Kindle, FB2 and CBZ e-books",
  "summary": "Read e-books with the same contents, search, annotation, bookmark and TTS tools.",
  "keywords": "e-book ebook book foliate EPUB EPUB3 MOBI AZW AZW3 KF8 FB2 FBZ FB2.ZIP CBZ comic manga Kindle DRM read-only",
  "sections": [
   {
    "title": "Supported files and how to open",
    "paragraphs": [
     "In Library → Import files, choose EPUB or EPUB3, MOBI, AZW or AZW3 (KF8), FB2, FBZ or FB2.ZIP, or CBZ, or drag the file onto the app. An FBZ or FB2.ZIP must contain one FB2 document. No separate app, server or extension is needed, and once the app is ready for offline use, you can import without an internet connection."
    ]
   },
   {
    "title": "Same tools and contents",
    "paragraphs": [
     "You get the same tabs, top reading tools, floating annotation toolbar and sidebar as for HTML. The book’s own contents hierarchy and links between chapters are kept, and you can move with the contents or the previous and next section buttons. You can search, highlight selections, underline, add notes, draw with the pen and shapes, add bookmarks and use TTS; the original text is never edited. Fixed-layout EPUBs zoom pages and annotations together.",
     "CBZ shows images in file name order (numbers included), and the contents take you to each image. You can use the pen, shapes, notes and bookmarks, but selecting, searching or reading aloud text inside images needs OCR, which is not included."
    ]
   },
   {
    "title": "Keeping files and sharing annotations",
    "paragraphs": [
     "The imported original is copied to the dedicated folder with its content and extension unchanged. The reading view, annotations and bookmarks are autosaved separately and handled the same way in sync, folder restore and Trash. To send the original and annotations together, choose Export → Archive with original (.librememo). The other person opens it with Import files in LibreMemo. To share only the reading view, choose Reading copy (HTML)."
    ]
   },
   {
    "title": "Page layout and page turning",
    "paragraphs": [
     "Reflowable books such as EPUB, MOBI, AZW3 and FB2 get a default layout with side margins and a text width. In View settings (▤) on the toolbar, you can change the margins, text width, line spacing, paragraph spacing, alignment and hyphenation, or turn the layout off to see the book’s original look. Settings are saved per book, and you can also save them as the default for all new books.",
     "Continuous scrolling is the default reading mode, and you can switch to pages. In page mode, lines are never cut in half and each new chapter starts on a new page. Turn pages with the arrow keys, PageUp, PageDown, Space, the mouse wheel, by tapping the left or right edge of the screen, or by swiping. Page numbers depend on the current text size and window size, so they change when you change those settings. Annotations, pen drawings and bookmarks are tied to positions in the text, so they follow along when you change the layout.",
     "With the select tool, tap a footnote number or superscript link to open a footnote card right where you are reading. Fixed-layout EPUBs and comics (CBZ) keep their original page look, and View settings opens only the Saved settings tab for them."
    ]
   },
   {
    "title": "Saved view settings and moving around",
    "paragraphs": [
     "To keep your current reading look, give it a name in View settings (▤) → Saved settings. In the Navigate tab for reflowable books, release the position slider to jump to that percentage. Press Home or End to go to the start or end, or use Back (↶) to return to where you were before using the slider. The time left is an estimate based on your average reading speed. If the file has author or publisher information, it is shown in the same tab."
    ]
   },
   {
    "title": "Display limits and errors",
    "paragraphs": [
     "E-books protected by DRM or a password, and KFX files, are not supported. Import an unprotected copy in a supported format. Scripts, audio and video in the book are not run, and external images, fonts and styles are not downloaded. Missing resources, complex layouts or special fonts may look different from the original e-book app.",
     "Limits: 2GB per file, up to 10,000 parts, 2GB of reading view and 10 minutes of processing. Files are checked for damage, external entities, archive paths and excessive decompressed size, and failed imports are not added to the Library. Import large books in parts."
    ]
   }
  ],
  "related": [
   "import-files",
   "reading-settings",
   "reading-view",
   "annotations",
   "search-outline",
   "export-html"
  ]
 },
 {
  "id": "hangul-documents",
  "group": "features",
  "title": "Reading Hangul HWP, HWPX and HML",
  "summary": "Read and search Hangul documents in the same view, and add annotations.",
  "keywords": "Hangul Hancom Hangul Word Processor Korean word processor rhwp HWP HWPX HML HWPML read-only fallback font Noto",
  "sections": [
   {
    "title": "How to open",
    "paragraphs": [
     "Choose an HWP, HWPX or HML file in Library → Import files, or drag it onto the app. Documents are processed on your device, with no separate server, extension or Hangul app needed. Once the app is ready for offline use, you can import new Hangul files without an internet connection."
    ]
   },
   {
    "title": "Finding and marking pages",
    "paragraphs": [
     "Pick a page number such as “Page 3” in the sidebar contents. Use the previous and next section buttons to see the pages before and after. Drag over text to highlight or underline it, search it or have it read aloud. Add pen drawings, shapes and notes on table cells or images. A+ and A− zoom text, images and annotations in or out together to match the original page layout. Scroll sideways to read pages that have become wider."
    ]
   },
   {
    "title": "Keeping and sharing the original",
    "paragraphs": [
     "The original file is kept in the dedicated folder with its extension and content unchanged, and the reading view, annotations and bookmarks are saved separately. To send annotations together with the Hangul original, choose Archive with original. Use Reading copy (HTML) to share the converted view."
    ]
   },
   {
    "title": "Support and errors",
    "paragraphs": [
     "Support follows what rhwp 0.8.7 supports. HML shows the supported elements of HWPML 2.9/2.91, and images, external resources and some objects may be missing. If anything was left out, a notice appears above the text. Hangul fonts not on your device are replaced by the bundled Noto Sans KR and Noto Serif KR fallback fonts. Special fonts and complex layouts may look different from the original app.",
     "For files with a password or DRM, save an unprotected copy in the original app and import that. Damaged files, external entity declarations and invalid archive paths are rejected, and external resources and macros are never run. Files must be 2GB or less and 10,000 pages or less; complex documents may reach the display size or 10-minute processing limit sooner. In that case, import the document in parts. Documents that fail are not added to the Library."
    ]
   }
  ],
  "related": [
   "import-files",
   "office-documents",
   "export-html"
  ]
 },
 {
  "id": "office-documents",
  "group": "features",
  "title": "Opening Office, OpenDocument and text files read-only",
  "summary": "Read documents, spreadsheets and slides with the same Library, search and annotation tools.",
  "keywords": "GenOffice Microsoft Office Word DOCX ODT OTT Excel spreadsheet XLSX XLSM XLS CSV TSV ODS OTS PowerPoint presentation slides PPTX ODP OTP LibreOffice Markdown MD TXT JSON plain text read-only",
  "sections": [
   {
    "title": "Supported files and how to open",
    "paragraphs": [
     "Choose a document in Library → Import files. You can read Word documents (DOCX, ODT, OTT), spreadsheets (XLSX, XLSM, XLS, CSV, TSV, ODS, OTS) and slides (PPTX, ODP, OTP). For old DOC and PPT files, save them as DOCX or PPTX in the original app and import those.",
     "MD and MARKDOWN files open with headings, lists, tables and code formatted, and TXT and JSON files open as text with line breaks and spacing kept. CSV and TSV files are shown as tables split into cells."
    ]
   },
   {
    "title": "Finding your way in documents, sheets and slides",
    "bullets": [
     "For Word documents, pick a heading in the contents. If the original has footnotes or endnotes, read them in the Footnotes and endnotes section after the text.",
     "For spreadsheets, pick a sheet name in the contents, and scroll wide tables sideways inside the table. If a cell has an “Original comment,” tap to expand it. Hidden sheets are shown too, marked “Hidden sheet” in their title.",
     "For presentations, tap a slide number and title in the contents to go there. Use the highlighter and underline on text, and the pen and shapes on charts and images. Marks and notes are saved as LibreMemo annotations."
    ]
   },
   {
    "title": "Keeping the original and sharing annotations",
    "paragraphs": [
     "The original file is copied byte for byte with its extension to the dedicated folder. The reading view, annotations and bookmarks are autosaved separately and are carried along in Device sync and folder restore. If the same original already exists, choose Open existing document, Open as new or Cancel. To send the original and annotations to someone else, choose Export → Archive with original (.librememo). It contains the editable Office original plus the current annotations, bookmarks and reading view. A Reading copy (HTML) shares the converted reading view and current annotations, but it doesn’t keep the original’s editable structure."
    ]
   },
   {
    "title": "Display limits and errors",
    "paragraphs": [
     "Files are processed only in the browser and never uploaded to a server. After you install the app and its cache is ready, you can import offline too. Page layout, special fonts, advanced shapes, SmartArt and so on may differ from the original app. Slides are a static reading view, without animations or video playback. Spreadsheets show cells, merges and saved calculation results, but not the interactive parts of charts, images or pivot tables. Formulas without a saved result are shown as text. Macros and scripts are never run, and external resources are never downloaded automatically. Also check the notices inside the document for objects that couldn’t be shown.",
     "Limits: 2GB per file; 200,000 rows, 4,096 columns and 2,000,000 cells per sheet; 4,000,000 cells and 1,024 sheets per workbook; and 10,000 slides. Documents whose unpacked contents are too large, or that have a password, damage or external entity declarations, show an error and are not added to the Library. Remove the password, or split the document and save it again in the original app, then import that copy."
    ]
   }
  ],
  "related": [
   "import-files",
   "pdf-documents",
   "image-documents",
   "web-and-paste",
   "export-html",
   "storage-folder"
  ]
 },
 {
  "id": "subtitle-documents",
  "group": "features",
  "title": "Reading and annotating subtitle files",
  "summary": "Read times, lines and speakers as a document, and search or take notes.",
  "keywords": "subtitles captions transcript script SRT VTT WebVTT SMI SAMI ASS SSA encoding speaker timestamps time",
  "sections": [
   {
    "title": "Supported formats and importing",
    "paragraphs": [
     "In Library → Import files, choose SRT, VTT (WebVTT), SMI or SAMI, ASS or SSA, or drag the file onto the app. The encoding is detected and read, including UTF-8, UTF-16 and Korean EUC-KR/CP949. The original is kept as is, and the view for reading lines and your annotations are saved separately. Files must be 2GB or less with 1,000,000 lines or fewer, and there is a separate limit on the length of text to parse. Depending on device memory and processing time, large subtitle files may need to be imported in parts."
    ]
   },
   {
    "title": "Reading and taking notes by time",
    "paragraphs": [
     "The text is shown as a document with start and end times beside each line. The contents list 5-minute time ranges, showing only ranges that have lines. Move with the contents, select lines to add highlights, underlines, strikethroughs and notes, or save a place to come back to with a bookmark. Search and reading the selection aloud work the same as in other documents. TTS skips the timestamps and reads the lines and speakers.",
     "Speaker information in VTT, speaker names in ASS and SSA, and multiple language tracks in SAMI are kept. Subtitle fonts, positioning, motion and karaoke effects are not reproduced; everything is shown in the common reading view. A notice appears for skipped ASS vector drawings and items with damaged times. If there are no lines to read, an error appears and nothing is imported. Importing this way does not link a video automatically, and editing subtitle timing is not provided. TTML/DFXP and image-based subtitles are not supported."
    ]
   },
   {
    "title": "Keeping and sending annotations",
    "paragraphs": [
     "You use the same toolbar, sidebar, storage folder, sync and Trash as always. To send your annotations and bookmarks too, choose Export → Archive with original (.librememo) or Reading copy (HTML). If you send only the original subtitle file, your LibreMemo annotations are not included."
    ]
   },
   {
    "title": "To link a YouTube video",
    "paragraphs": [
     "Subtitles opened with Import files are a document you read without the video. To watch with the video, go to Library → YouTube → Annotate subtitles, enter the video address and tap Choose subtitle file. For a video document you already made, use Attach subtitles or Replace subtitles on the video bar. To save only a scene’s time and a short note, start right away with Moment note in the YouTube window."
    ]
   }
  ],
  "related": [
   "import-files",
   "youtube",
   "annotations",
   "search-outline",
   "speech",
   "export-html"
  ]
 },
 {
  "id": "youtube",
  "group": "features",
  "title": "YouTube moment notes and subtitle annotations",
  "summary": "Keep just the time and a note for a particular scene, or annotate subtitles while you watch.",
  "keywords": "YouTube video moment note timestamp time link scene 10 seconds loop repeat playlist subtitles captions SRT chapters contents translation thumbnail bookmark follow scene resize size full screen",
  "sections": [
   {
    "title": "Moment notes without subtitles",
    "paragraphs": [
     "Library → YouTube starts with Moment note. Paste a video address, type a time and a note, and save. If a shared link contains a time, it is filled in for you. For the time you can enter 1:23, 1:02:03, a number of seconds, or a time link for the same video. If the same video is already in the current folder, the new moment note is added to that document. If there is a note within 3 seconds before or after the time you enter, the closest note opens with its saved time shown; if two are equally close, the earlier one opens. Add to or edit the existing text and tap Save changes. If the same folder has several documents for the same video, choose which one to save to. Videos in other folders are kept separately.",
     "Tapping Moment note on the player or Note at current time in the note list pauses the video and fills in that time. Saving or canceling doesn’t start playback again. Notes are collected in time order, and tapping a time plays from that scene. Open ⋯ to the right of a note to edit its time and text or delete it. Undo and Redo work too.",
     "Type note text or a time such as 1:23 in Search my annotations under Sidebar → Annotations, then tap a result to play from that scene. The video ID and the time in seconds are recorded, so notes stay put even if you attach or replace subtitles later. They are kept in the storage folder, annotation history, Device sync and Archive with original, and the Reading copy (HTML) includes the notes and a YouTube link to each moment. This does not save the video itself or cut out the scene."
    ]
   },
   {
    "title": "Opening a video with subtitles",
    "paragraphs": [
     "In Library → YouTube, choose Annotate subtitles and enter a video or playlist address. With Choose subtitle file, choose SRT, VTT, SMI, SAMI, ASS, SSA or a ZIP containing subtitles, then tap Create. You can also create it without subtitles first and add them later with Attach subtitles on the video bar. Each subtitle file must be 64MiB or less, and ZIP files also have limits on unpacked size and number of files.",
     "LibreMemo does not download or translate YouTube subtitles itself. Use subtitle files you already have. How to get subtitle files includes optional instructions that use a third-party Chrome extension on Mac. You don’t need to install an extension to read videos and subtitles in the app. You can also move subtitles prepared on another device as files and choose them."
    ]
   },
   {
    "title": "Repeat a scene for 10 seconds",
    "paragraphs": [
     "Tap ⋯ → Loop this scene for 10 seconds on the moment note you want to watch again. It plays 10 seconds from the time in the note and then goes back to the same spot. If there are fewer than 10 seconds left in the video, it repeats what remains. To pause briefly, tap Pause. When you play again, the same section repeats.",
     "To keep watching, tap Stop loop on the video bar or in the same note menu. Tapping another note’s time or a subtitle time ends the loop and plays from that scene. Switching to another document tab ends the loop and pauses the video."
    ]
   },
   {
    "title": "Tapping the video",
    "paragraphs": [
     "Tap the middle of the video once to play or pause, and the left or right edge to skip back or forward. Choose how far to skip in the options of Library → YouTube → Annotate subtitles: set Skip back and forward to 5, 10 or 15 seconds. Double-tap the video or press F to switch to video full screen, and do it again to return. The YouTube progress bar and menus below the video still work.",
     "The video bar has Follow, current position / total time, playback speed, Moment note, Bookmark, Contents, Attach subtitles or Replace subtitles, Collapse video and Open in YouTube. Previous and next video buttons for a playlist appear when there is a video to move to. When you reopen it, the video is ready at the moment you last watched, and you start playback yourself."
    ]
   },
   {
    "title": "Following subtitles and adding annotations",
    "paragraphs": [
     "Subtitles place each line on one row next to its start time in seconds, and long lines wrap. The line being played is marked with a red bar. Turn on Follow and the current line moves to the middle of the subtitle area; scrolling by hand pauses this for a moment.",
     "With the select tool, tap the time next to a line to play from that scene. Tapping a time in the contents also moves the video. Selecting text, highlighting, underlining or writing notes never starts a paused video. Bookmark on the video bar saves the current scene’s time and part of its line as the name. Use A+, A and A− to adjust the size of the subtitles and notes."
    ]
   },
   {
    "title": "Resizing the video",
    "paragraphs": [
     "Drag the resize strip just below the video bar up or down. Double-tap the strip to return to the default size. You can also Tab to the strip, adjust the size with ↑/↓, and reset with Home or Enter. The size you choose is used for the next video too. It only grows as far as the top of the video stays visible with at least one subtitle line showing below, and on a narrow screen it fits the width. Collapse video folds the view and is separate from video full screen."
    ]
   },
   {
    "title": "Contents and chapters",
    "paragraphs": [
     "Copy two or more time and title lines, such as “0:00 Intro,” from the video description and paste them into the Chapters box in the YouTube window or into Contents on the video bar. The subtitles are split by chapter and shown in the sidebar. Without chapters, a time-based contents is made: every 1/10 of the length for videos longer than 10 minutes, and every minute for videos of 10 minutes or less, each with the first line of that section. Clear the Chapters box and save to go back to the time-based contents."
    ]
   },
   {
    "title": "Playlists and replacing subtitles",
    "paragraphs": [
     "For a playlist, keep the option to create a folder and a document for each video turned on. The videos the YouTube player returns for a public or unlisted playlist are imported. Private or restricted videos, or part of a large playlist, may not be imported. If you choose several subtitle files or a ZIP, they are matched using the video ID or title in the file name; for subtitles that can’t be matched, open that video and attach them yourself. If you enter an address you already saved, the chosen subtitles are attached instead of creating a new document.",
     "Replace subtitles swaps the subtitles in the same document and moves annotations and bookmarks to the same sentences in the new subtitles. Items that can’t be matched stay in the list and you are told the result. If the document had annotations or bookmarks, a copy of how it looked before the replacement is kept in Trash."
    ]
   },
   {
    "title": "Keyboard and offline",
    "paragraphs": [
     "Space or K plays or pauses, ←/→ moves 5 seconds and J/L moves 10 seconds. , and . step one frame while paused, < and > change speed, 0–9, Home and End jump to a position, ↑/↓ change volume, M mutes, C toggles YouTube captions, F toggles video full screen, and Shift+N/P go to the next or previous video in a playlist. Press ? to open the list. When an input field, button or the resize strip has focus, that control’s own keys come first.",
     "The storage folder and exports contain the video information, thumbnail, imported subtitles, annotations and bookmarks, but not the video file itself. Subtitles and notes can be read offline, but playing the video needs the internet. If embedded playback is restricted, use Open in YouTube and keep taking subtitle notes in LibreMemo."
    ]
   }
  ],
  "related": [
   "review-tutorial",
   "subtitle-documents",
   "annotations",
   "text-styles",
   "search-outline",
   "library",
   "offline"
  ]
 },
 {
  "id": "image-documents",
  "group": "features",
  "title": "Annotating screenshots and images",
  "summary": "Paste a copied screenshot right away, or open an image file and take notes on it.",
  "keywords": "screenshot screen capture image picture photo drawing clipboard paste PNG JPEG JPG WebP AVIF GIF BMP SVG APNG",
  "sections": [
   {
    "title": "Keep a screenshot in your Library",
    "steps": [
     {
      "title": "Copy the screen.",
      "text": "On Mac, press Control+Shift+⌘+4; on Windows, press Win+Shift+S, then select an area. For screenshots saved as files on a phone, choose them in Library → Import files."
     },
     {
      "title": "Paste it in the folder where you want it.",
      "text": "Open the folder you want in Library, then tap “Paste image” → “Paste from clipboard.” If permission is not granted, tap the dotted area in the same window and press ⌘V or Ctrl+V, or choose “Import files.”"
     },
     {
      "title": "Mark up the image.",
      "text": "The pasted image opens in a new tab with a name that includes the date and time. Even while reading a document, pressing ⌘V or Ctrl+V outside an input field creates a new image document in the current Library folder. You can also drag an image file onto an open document."
     }
    ]
   },
   {
    "title": "Supported formats and annotations",
    "paragraphs": [
     "PNG and APNG, JPEG (JPG, JPEG, JPE, JFIF), WebP, AVIF, GIF, BMP and SVG are supported. Use the usual reading tools, floating toolbar and sidebar to add pen drawings, area highlights, rectangles, circles, arrows, notes, text annotations and bookmarks. Zooming and A+/A− scale the image and annotations together. Selecting, searching or reading aloud text inside an image needs OCR, which is not currently included.",
     "The original resolution is kept, and for animated GIF, APNG, WebP and AVIF files you annotate the first frame of the reading copy. The original is kept as is. Each file can be up to 2GB, 40 million pixels and 32,768 pixels per side. Damaged images and unsupported formats are reported and not imported. SVG is shown as an image, so scripts and external resources are never run or loaded. HEIC, TIFF, PSD and RAW are not supported at this time."
    ]
   },
   {
    "title": "Sending a marked-up image to someone",
    "paragraphs": [
     "Open the image and tap Export at the top. To send the original image with editable annotations and bookmarks, choose “Archive with original”; to send a reading view that opens in a browser, choose “Reading copy (HTML).” The annotations you add day to day are saved in the Library separately from the original image."
    ]
   }
  ],
  "related": [
   "import-files",
   "annotations",
   "reading-view",
   "export-html",
   "storage-folder"
  ]
 },
 {
  "id": "pdf-documents",
  "group": "features",
  "title": "Using PDFs with the same reading and annotation tools",
  "summary": "Read and annotate PDFs in the same Library, toolbar and sidebar.",
  "keywords": "PDF PDFMemo Acrobat page pages contents outline search annotation bookmark import export",
  "sections": [
   {
    "title": "Opening a PDF",
    "paragraphs": [
     "Choose a PDF in Library → Import files, or drag it onto the app. You use the same tabs, reading tools, floating annotation tools and sidebar as for HTML and Markdown. If the PDF has its own contents, they are shown; if not, you get a list of pages. Move with the previous and next section buttons and the contents, and return with the Back button. Internal links in the document and external web links open too."
    ]
   },
   {
    "title": "Marks and annotations",
    "paragraphs": [
     "Select text, or trace it with a finger or stylus, to add highlights, underlines and strikethroughs. The pen, shapes, area highlights and notes use the same tools. Choose an annotation with the select tool to move it or change its color, and undo it with the eraser or Undo. The PDF’s original layout is kept, and A+ and A− enlarge or shrink the text, images and annotations together. Zoom, fit to width and screen modes are in the same place. When you zoom or move around, the visible part is redrawn sharply to match your screen’s pixel density."
    ]
   },
   {
    "title": "Going to the sentence you want in a PDF",
    "paragraphs": [
     "Type a word in “Search whole book” under Sidebar → Search to see the page numbers and the surrounding sentences. Tap a result to go to that text on its page. Text extracted the first time you search is reused when you open the same PDF again, and PDFMemo’s built-in search index can be read too. If there are more than 2,000 results, type a longer search term.",
     "To search only the pages loaded right now, type in “Find in loaded part” just below and tap the up and down arrows. Drag over a passage and tap “Read aloud” to read from there to the end of the selection."
    ]
   },
   {
    "title": "Autosave and sharing",
    "paragraphs": [
     "The PDF original is copied to the dedicated storage folder, and new annotations, bookmarks, the page you were reading, settings and history are autosaved separately. Positions are recorded within the page, so you can return to them after zooming or reopening. Device sync, moving between Library folders, Trash and restore, and annotation history work from the same screens. To send it to someone, tap Export. Archive with original contains the PDF original and your current editable annotations and bookmarks. Annotated PDF adds standard PDF annotations and bookmarks so it works in any PDF viewer. Reading copy (HTML) bundles the PDF original with an offline converter to show the annotated PDF, and it can be imported back into LibreMemo to edit. Even if the same PDF original is already in your Library, the annotations and bookmarks in a shared file you receive are kept in a separate document. When you import the same shared file again, the usual duplicate choices appear. Moving to a new edition checks the text to find new positions, lists items it couldn’t confirm in the result, and keeps the original document."
    ]
   },
   {
    "title": "Scanned or password-protected PDFs",
    "paragraphs": [
     "Pages photographed from print can be zoomed and marked with the pen, shapes and area highlights. Selecting, searching and reading aloud text only work if the scan also stores a text layer. If you can make the PDF yourself, export it from the original program with searchable text included.",
     "For a PDF that asks for a password, remove the password in the original program and import that copy. Annotations already in the original PDF are shown as part of the original, and annotations you add in LibreMemo can be edited again with the select tool. When sending a signed original, use “Archive with original.”"
    ]
   }
  ],
  "related": [
   "reading-view",
   "annotations",
   "search-outline",
   "export-html",
   "storage-folder"
  ]
 },
 {
  "id": "library",
  "group": "features",
  "title": "Finding, starring and organizing folders in your Library",
  "summary": "Recognize material from card previews, and pin favorite documents and folders to the top.",
  "keywords": "Library cards list thumbnail preview star favorite pin order sort date saved date modified title file name folder search path drag move organize",
  "sections": [
   {
    "title": "Browsing with cards and list",
    "paragraphs": [
     "Tap the book-shaped “Library” at the top. In “Cards,” you see the original file name, date and time, number of annotations and number of bookmarks under the title. In “List,” the file name appears to the right of the title, making it easy to compare similar documents line by line.",
     "Card previews show the first page of a PDF, a screenshot or photo, a slide or scanned page, an image from the document, or a video thumbnail. Documents without images show the title and part of the text. Previews are made on your device, starting with the cards on screen, and reused; cards that can’t get a preview show a file type icon."
    ]
   },
   {
    "title": "Searching and sorting across all folders",
    "paragraphs": [
     "Type in “Find by title, file name, address or folder” to search your whole Library, including subfolders. Open ⋯ on a result to see that document’s folder path. In sorting, “Date saved” is when it was first stored and “Date modified” is when it was last changed. Titles can be sorted alphabetically or in reverse."
    ]
   },
   {
    "title": "Pin frequent documents and folders with a star",
    "paragraphs": [
     "Tap the star (☆) on the right of a card or list item, or choose ⋯ → Add star. Pinned documents and folders gather together at the top, with the most recently starred first. Matching starred items also come first while you search. Tap it again or choose ⋯ → Remove star to return it to the normal sort order."
    ]
   },
   {
    "title": "Organizing with folders",
    "paragraphs": [
     "Tap “New folder” where you are. Open the destination from the path at the top or the folder list, and go back to the parent folder with the left arrow. For a document, tap ⋯ → Move to folder; for a folder, tap ⋯ → Move to another folder. With a mouse, you can also drag an item onto another folder or onto the path at the top.",
     "From a folder’s ⋯ menu, you can rename it or choose “Delete empty folder.” If the delete button is disabled, move the documents and subfolders inside it first. The info button next to the path explains how to use folders."
    ]
   },
   {
    "title": "Adding files to your Library",
    "paragraphs": [
     "Documents made with Import files, Paste text or Paste image go into the Library folder you have open. If you only moved files into the dedicated folder with your computer’s file manager, register them by choosing them in Library → Import files."
    ]
   }
  ],
  "related": [
   "import-files",
   "document-tabs",
   "web-and-paste",
   "image-documents",
   "trash",
   "storage-folder"
  ]
 },
 {
  "id": "document-tabs",
  "group": "features",
  "title": "Multiple document tabs and reading position",
  "summary": "Keep your annotations and place even when you switch or close documents.",
  "keywords": "tabs close switch resume reading continue where I left off last position scroll ×",
  "sections": [
   {
    "title": "Finding open documents",
    "paragraphs": [
     "Tap a tab title at the top to switch documents. As you open more tabs, they get narrower; when they overflow the row, swipe sideways or scroll the mouse wheel over the tabs to see the others. Hover over a cut-off title to see the document title and original file name.",
     "Tap the book icon at the top to go back to Library while keeping your tabs open. Tapping an already open document in the Library takes you to its tab. Documents you closed with a tab’s × can be reopened from the Library."
    ]
   },
   {
    "title": "Saving your last position",
    "paragraphs": [
     "Your reading position and zoom level are kept automatically. They are saved a moment after you stop scrolling, and your last position is also recorded when you close a tab. If a real save error happens, the tab stays open so you can try again."
    ]
   },
   {
    "title": "Large documents left open for a long time",
    "paragraphs": [
     "Large documents you haven’t looked at for a long time are saved and then briefly unloaded from the screen to reduce memory use. The tab stays, and when you tap it again, your annotations and reading position are restored after a loading screen. This does not delete the document from the tab or the Library."
    ]
   },
   {
    "title": "Using tabs with the keyboard",
    "paragraphs": [
     "When a tab has focus, move with the left and right arrow keys, Home and End, and close it with Delete. Press Ctrl/⌘ L to go to the address field, and Esc to return to the tabs."
    ]
   }
  ],
  "related": [
   "automatic-save",
   "keyboard",
   "reading-view"
  ]
 },
 {
  "id": "annotations",
  "group": "features",
  "title": "Organizing what you read with highlights, underlines and notes",
  "summary": "Mark sentences or leave your thoughts in a note box.",
  "keywords": "annotation annotations highlighter highlight underline note notes comment memo text selection mark up",
  "sections": [
   {
    "title": "Marking along the text",
    "steps": [
     {
      "title": "Select the text you want.",
      "text": "Drag with the mouse or use the selection handles on your phone to set the range, then tap the highlighter or underline on the floating toolbar. On a phone, you can also choose text highlight or text underline first and drag along the text with your finger or stylus. The mark is saved when you lift it, and placing two fingers cancels the mark in progress and scrolls."
     },
     {
      "title": "Switch to the style you want.",
      "text": "After choosing the highlighter or underline, tap the same button again to choose a style. On a keyboard, focus the button and press ↓. Use text highlight or text underline to mark along sentences, and area highlight or area underline where text is hard to select, such as tables or scanned images."
     },
     {
      "title": "Write down your thoughts too.",
      "text": "With text selected, tap Note on the floating toolbar to make a note linked to the selected sentence. To write straight in the margin, clear the selection, tap the note button again, choose note box or free text, and type where you want."
     }
    ]
   },
   {
    "title": "Editing or moving",
    "paragraphs": [
     "Choose Select on the floating toolbar and tap an annotation to open the annotation editor. Change that annotation’s color with a swatch or a HEX code, or delete it. Note boxes and free text also have an edit content button. To change the position, drag the annotation. Note boxes and free text can be dragged right away even while you are using another tool such as the pen or highlighter. Changing the text size (A+, A, A−) also changes the note text and box. Choose the look in Pen & colors → Text box styles. If you make a mistake, tap Undo. From the annotation list you can also go to a position or delete a specific annotation."
    ]
   },
   {
    "title": "The menu that appears when you select text",
    "paragraphs": [
     "The selection menu has Read aloud, AI search and Web search. Annotation work such as highlights, underlines and notes is done from the floating toolbar. Read aloud reads the selected text right away with the same TTS player, and Web search searches the selected text in a regular Chrome tab.",
     "AI search sends the selected text to the web page of the LLMs you checked in Settings → AI search. If you checked several, a list appears to choose from; if only one, it opens directly. It uses the account you are signed in with in your browser, and no API key is needed. If the address contains {text}, the text is sent in the address (up to 2,000 characters); if not, the text is copied and the page opens so you can paste it. Text sent in the address or pasted on that page is processed by the service you chose. For long text and copy failure messages, see “AI search with selected text.”"
    ]
   },
   {
    "title": "The text and your annotations are separate",
    "paragraphs": [
     "Marks and notes are autosaved to the document in your Library. To send them so the other person can keep editing the annotations, save an Archive with original from Export at the top and share that. You can also choose Reading copy (HTML), and if the original is a PDF, you can send an Annotated PDF."
    ]
   }
  ],
  "related": [
   "pen-and-shapes",
   "colors",
   "text-styles",
   "ai-search",
   "erase-undo",
   "search-outline",
   "export-html"
  ]
 },
 {
  "id": "text-styles",
  "group": "features",
  "title": "Styling and moving note boxes and free text",
  "summary": "Choose the text, background and border for notes, and save styles you use often.",
  "keywords": "text box styles my styles presets text color background border bold free text note box move drag sticky note",
  "sections": [
   {
    "title": "Choosing a style",
    "paragraphs": [
     "Open Pen & colors on the floating toolbar and scroll down to Text box styles. Pick Default note, Yellow sticky note, Chalkboard, Large heading and so on, or set the text size, bold, text color, background and border yourself. Background and border can be set to None, and choosing Pen color uses the annotation’s pen color. Default for type returns note boxes and free text to their own default looks."
    ]
   },
   {
    "title": "New notes and the selected note",
    "paragraphs": [
     "The style you choose applies to note boxes and free text you create afterward. To change the look of one existing note, tap it with the select tool and tap Done in the annotation editor. If you then change Pen & colors → Text box styles, it applies to the selected note and to notes you write from now on. Type a name in + Save as my style to reuse up to 30 styles. The × on a saved style deletes only that style, not any notes you already wrote."
    ]
   },
   {
    "title": "Position and size",
    "paragraphs": [
     "Note boxes and free text can be dragged without changing your current tool. Move other annotations with the select tool. Note text and boxes scale together with A+, A, A− and screen zoom. Undo reverses accidental moves or style changes. Drag the Pen & colors window by its title, and scroll inside the window when its content is longer than the screen."
    ]
   }
  ],
  "related": [
   "annotations",
   "colors",
   "erase-undo",
   "reading-view"
  ]
 },
 {
  "id": "pen-and-shapes",
  "group": "features",
  "title": "Pen, shapes, area marks and temporary pen",
  "summary": "Mark directly on images, tables and margins without selecting text.",
  "keywords": "pen freehand drawing handwriting ink dot short stroke continuous writing rectangle circle ellipse arrow area strikethrough temporary pen laser pointer",
  "sections": [
   {
    "title": "Dots and continuous writing",
    "paragraphs": [
     "Choose the pen on the floating toolbar. Press and release once to make a dot, or press and move to draw a line up to where you lift. When writing, lift after each stroke and keep drawing the next one. Dots and lines kept with Keep permanently can be found as “Pen drawing” in Sidebar → Annotations."
    ]
   },
   {
    "title": "Scrolling the document while drawing",
    "paragraphs": [
     "On a phone or tablet, place two fingers on the document and move them together. The line or annotation move in progress is canceled and the document scrolls. Lift all your fingers, and then you can draw again with one finger. Two-finger scrolling on a Mac trackpad also works without changing tools."
    ]
   },
   {
    "title": "Making the shape you want",
    "paragraphs": [
     "Tap the rectangle button twice to choose no fill or fill. The circle and ellipse in document tools follow this fill choice too, and the fill uses the highlighter/fill opacity. Choose the arrow from ⋯ (document tools) at the end of the floating toolbar and drag from the start point to the end point. To strike through a sentence, choose Document tools → Strikethrough. For a whole table or image, you can use area highlight or area underline.",
     "Adjust the thickness and highlighter/fill opacity in Pen & colors. With the select tool chosen, drag an annotation to move it. Thin lines can be selected or erased by tapping near the line. If you moved or drew something by mistake, tap Undo."
    ]
   },
   {
    "title": "Using the temporary pen",
    "notice": {
     "tone": "caution",
     "title": "Keep important marks as regular annotations.",
     "text": "If you set Pen display time in Pen & colors to 3, 10 or 30 seconds, marks show briefly and then disappear without being saved. For pen drawings you want to keep, set it to Keep permanently before drawing. Highlights and notes are kept as regular annotations."
    }
   }
  ],
  "related": [
   "colors",
   "erase-undo",
   "annotations"
  ]
 },
 {
  "id": "colors",
  "group": "features",
  "title": "Colors, palettes, thickness and opacity",
  "summary": "Choose tool settings that suit your reading and note-taking.",
  "keywords": "Pen & colors palette color colour thickness stroke width size opacity transparency display time three lines highlight color names key point evidence question HEX RGB HSV",
  "sections": [
   {
    "title": "Opening Pen & colors",
    "paragraphs": [
     "Tap the Pen & colors button, the one with three lines, on the floating toolbar. If you choose a color while the highlighter is selected, the highlighter color changes and is remembered separately from the regular pen color. You can pick a color from the palette, or by HEX, RGB or the color area. The first preset is Textbook and paper marking."
    ]
   },
   {
    "title": "Thickness and opacity",
    "paragraphs": [
     "At the top of the palette, adjust the thickness, highlighter/fill opacity and pen display time. These settings are used for annotations you create afterward. To change the color of an annotation you already drew, tap it with the select tool and change it in the annotation editor."
    ]
   },
   {
    "title": "Collecting colors you use often",
    "paragraphs": [
     "After choosing a color, tap + Add color under Custom colors. To make a palette from the colors you collected, type a New palette name and tap + Save palette. If Custom colors is empty, the palette is made from the current color and the colors of the selected preset. Choose a saved palette again from Custom palettes under Palette presets."
    ]
   },
   {
    "title": "Naming highlight colors",
    "paragraphs": [
     "In Pen & colors, pick the palette to use and expand Highlight color names. Type names such as “Key point” for yellow or “Evidence” for green, and tap Save names. Clear a name and save to remove it. Names are remembered per palette, so when you switch presets, that preset’s names are shown.",
     "Color names appear on highlight items in Sidebar → Annotations. Choosing “Evidence” under All annotations gathers every sentence and area you ever highlighted in that color. If you name several colors “Evidence,” they gather in one list. You can also type a color name in Search my annotations."
    ]
   },
   {
    "title": "Reading the three lines on the button",
    "paragraphs": [
     "The top line is the regular pen’s color and thickness, the middle line is the highlighter color, and the bottom line previews the highlighter color with opacity applied. The length of the bottom line is the pen display time: longest means Keep permanently, and the shorter the time, the shorter the line."
    ]
   },
   {
    "title": "If the window covers the text",
    "paragraphs": [
     "Drag the palette by its title to move it. You can also drag the floating toolbar by its handle. Close just the settings with the close button and keep reading."
    ]
   }
  ],
  "related": [
   "review-tutorial",
   "annotations",
   "pen-and-shapes",
   "text-styles",
   "reading-view"
  ]
 },
 {
  "id": "erase-undo",
  "group": "features",
  "title": "Eraser, Undo and clearing all annotations",
  "summary": "Reverse mistaken annotations right away, and keep the records you need.",
  "keywords": "delete remove erase eraser undo redo restore clear all annotations",
  "sections": [
   {
    "title": "Erasing just some",
    "paragraphs": [
     "Choose the eraser on the floating toolbar and tap an annotation to erase that one annotation. Thin lines are caught even if you tap just beside them. To pick exactly one of several overlapping annotations, find the note or quote in Sidebar → Annotations and tap that item’s delete button."
    ]
   },
   {
    "title": "Undoing",
    "paragraphs": [
     "If you make a mistake while working, tap Undo or press Ctrl/⌘ Z. Redo is Ctrl/⌘ Shift Z. This reverses work in the document you have open; for older saved states, look in annotation history."
    ]
   },
   {
    "title": "Clearing everything at once",
    "notice": {
     "tone": "caution",
     "title": "Read the clear-all confirmation.",
     "text": "With the eraser selected, tap it again and choose Clear all annotations. Check the number to be cleared in the confirmation window and tap Clear all to remove the annotations in the current document. Bookmarks stay available. Right after a mistake, you can reverse it with Undo. To keep an important version for a long time, also save an Archive with original or a folder backup before you start. This is different from permanently deleting in Trash."
    }
   }
  ],
  "related": [
   "annotation-history",
   "trash",
   "backup-restore"
  ]
 },
 {
  "id": "search-outline",
  "group": "features",
  "title": "Text search, contents, annotation list and bookmarks",
  "summary": "Find things in a document and return to where you were reading.",
  "keywords": "find search text contents table of contents TOC outline sidebar bookmark save position annotation list search my annotations color name filter",
  "sections": [
   {
    "title": "Finding text",
    "paragraphs": [
     "If you closed the sidebar with ✕, tap ☰ (Contents) at the far left of the document toolbar to open it again. You can also open it with ⋯ → Open sidebar on the annotation toolbar. Use the sidebar’s search button or Ctrl/⌘ F. In documents that offer Search whole book, chapters that haven’t loaded yet are searched too; look at the context of each result and tap it to go there. Find in loaded part, below it, searches the content currently loaded. The up and down arrows stop at the first and last result, and × clears the search term and marks. In the Find in loaded part field, Enter goes to the next result and Shift and Enter to the previous one. Search whole book in a PDF checks every page, while Find in loaded part searches the pages that are ready now. In a PDF, scanned pages where text can’t be selected are also hard to search. Long documents reuse search data that is already prepared. In wide tables, the scroll inside the table moves too so the selected match is visible. This is different from searching titles and file names in the Library or searching Help."
    ]
   },
   {
    "title": "Contents and annotation list",
    "paragraphs": [
     "Switch between the contents, search, annotations and bookmarks views with the sidebar icons. Annotations and bookmarks show their total count and can be expanded or collapsed by the book’s parts, chapters and sections. Parts with no records are left out of the list. Even if the exact section can’t be found, the part or chapter that can be confirmed is shown. Tap an item to go there."
    ]
   },
   {
    "title": "Search my annotations",
    "paragraphs": [
     "Open Annotations in the sidebar and type a word or sentence in Search my annotations. It searches note text, marked text, contents names and annotation types in the current document. YouTube moment notes can also be found by typing a time such as 1:23. With several search terms, items containing all of them are shown. Groups with results expand, and tapping an item takes you to the mark in the text or the moment in the video.",
     "If you name the highlight colors of the current preset in Pen & colors, a color choice appears below the search box. Choose a name and only text and area highlights that match both the search term and that color remain. The number next to the icon is the total number of annotations in the document, and the number below the search box is the number of matches. Clear the search term with × and choose All annotations to return to the full list."
    ]
   },
   {
    "title": "Renaming contents items",
    "paragraphs": [
     "Expand the contents so the item you want to change is visible, then tap the pencil button at the top (Edit contents names). Choose one heading and type a new name. Press Enter or tap outside the field to save, or press Esc to cancel. Before choosing an item, you can cancel by tapping the pencil again or tapping outside the sidebar. To rename another heading, tap the pencil again. In plain documents without headings, the pencil is dimmed.",
     "Renamed items are saved separately along with your annotations. Typing the original title again removes that change. Move annotations/bookmarks to a new edition also carries over contents names whose position it confirmed."
    ]
   },
   {
    "title": "Collapsing and sidebar width",
    "paragraphs": [
     "When you are already viewing the contents, tapping the contents button again collapses everything. For annotations and bookmarks too, tapping that view again collapses the expanded list. Coming from another view does not collapse it. When you first open a document, the contents are fully collapsed. Tapping a contents label also expands or collapses its children, and the linked text is shown aligned to the top of the reading area. The triangle only expands or collapses without moving the text. The current position of the selected heading is marked. The contents’ expanded state is kept when you switch views or document tabs. Search, annotations and bookmarks work even in files without contents. Drag the right edge of the left sidebar to adjust its width. All formats share the same width setting, and it can be narrowed down to 8px. With the edge focused, ←/→ adjust it by 16px, or 40px with Shift; Home sets the minimum width, End the maximum width, and Enter or a double-click the default width. Space collapses and expands it again."
    ]
   },
   {
    "title": "Adding a bookmark",
    "steps": [
     {
      "title": "Go to the place you want to remember.",
      "text": "In the sidebar’s bookmarks view, tap Save current position. Where there is text, the sentence you were reading at the top of the screen and the text around it are recorded, so the spot can be found even if the text size or line breaks change. For PDFs, the page number and the position on the page are recorded together. Where there is no text to refer to, such as wide margins or scanned pages, the saved screen position is used."
     },
     {
      "title": "Give it a name you’ll recognize.",
      "text": "For example, “explanation to reread” or “continue tomorrow.” Tap the name in the list to return to that spot."
     },
     {
      "title": "Delete it from the list when you no longer need it.",
      "text": "Deleting a bookmark doesn’t delete the text or any other annotations. Bookmarks are also included in autosave, sync and annotation history."
     }
    ]
   }
  ],
  "related": [
   "review-tutorial",
   "reading-view",
   "annotations",
   "annotation-history"
  ]
 },
 {
  "id": "reading-view",
  "group": "features",
  "title": "Text, fonts, zoom, full screen and toolbar position",
  "summary": "How to fit the screen size and focus on your document.",
  "keywords": "zoom in zoom out magnify full screen focus mode F fit width horizontal scroll toolbar font sans serif reset A+ A− UI font size sidebar text size",
  "sections": [
   {
    "title": "Making it comfortable to view",
    "paragraphs": [
     "Tap the zoom level at the top of the document to zoom in or out, type a percentage, fit to screen width, or return to 100% actual size. If you zoomed in a lot, scroll sideways to see the part you need. Annotations stay aligned with their positions in the document."
    ]
   },
   {
    "title": "Text size and font",
    "paragraphs": [
     "A+ on the left enlarges the text, A in the middle returns to the default size, and A− on the right makes it smaller. For fixed-page material such as PDF, Hangul, slides and images, the document and annotations zoom together. In documents where the font can be changed, choose Default, Sans-serif (Gothic), Serif (Myeongjo), Dotum, Monospace or a specific font name in the picker next to it. Fonts not on your device may appear as a fallback font, and the original fonts of PDFs and images are not changed."
    ]
   },
   {
    "title": "Common reading tools for every format",
    "paragraphs": [
     "HTML without its own reading toolbar, PDF, Hangul, Office, OpenDocument, e-books, Markdown and text get a toolbar with the same layout and size as MemoSuite book HTML. A site’s title or search form is never mistaken for a reading toolbar. TXT and JSON are read with the same TTS player too.",
     "Plain text and Markdown also start with the sidebar’s contents view. Even if the contents are empty because there are no headings, the search, annotations and bookmarks views work. If you chose search, annotations or bookmarks yourself, that view stays when you come back from another tab. The top reading toolbar has open contents, back, previous/next section, current position, TTS, A+, A, A−, font, screen mode, zoom level and View settings. Features that don’t apply to the document are disabled or hidden. ‹ and › go to the previous and next heading, and ↶ returns to where you were before moving. The move buttons are dimmed at the start and end. Text size, font and screen mode are remembered per document. On narrow screens, swipe the toolbar sideways to reach the buttons on the right. HTML that already has its own top bar reuses that document’s buttons. The toolbar and sidebar inside book HTML are also sized to the screen so they don’t shrink with the text zoom, and in every format the sidebar appears below the toolbar."
    ]
   },
   {
    "title": "Focusing on your document in full screen",
    "paragraphs": [
     "Double-click an empty spot in the text, or double-tap on a touch screen. On a keyboard, press F. The sidebar closes and the text fits the screen width, while the tabs at the top, the document toolbar and the annotation toolbar remain available. Double-tapping a word in the text selects it.",
     "Leave with the same action or Esc to return to your previous zoom and sidebar state. Even when the browser doesn’t allow full screen, you can use the focus view inside the app. In YouTube documents, F opens video full screen."
    ]
   },
   {
    "title": "When tools cover the text",
    "paragraphs": [
     "Drag the floating toolbar by its handle to reposition it, and drag the palette window by its title. Close settings windows you don’t need to see more of the document."
    ]
   },
   {
    "title": "When you can’t see all the tools on a phone",
    "paragraphs": [
     "Swipe the button area of the floating toolbar left or right to find hidden tools. Swipe left to see the tools at the right end, and right to go back to the earlier ones. The handle moves the whole toolbar. If the screen is too short to show all the settings, scroll up and down inside the settings window."
    ]
   },
   {
    "title": "Sidebar and app UI text size",
    "paragraphs": [
     "In Settings → UI text size → Adjust size, change the size of the whole screen from 60 to 200% in 1% steps. Move the slider or type a number. In the sidebar, you can adjust the contents, search, annotations, bookmarks and the counts at the top separately. Library titles and file information, document tabs, the reading toolbar and Help can be adjusted separately too.",
     "Tap ↻ next to an item to make it follow the parent setting again, and tap “Reset all to defaults” to return everything to 100%. Values are saved automatically in the app settings. Adjust the document’s body text size with A+ and A− at the top."
    ]
   },
   {
    "title": "Light, dark and system themes",
    "paragraphs": [
     "Choose the brightness of the Library and tools under Appearance in Settings. System follows your device’s brightness setting. The colors and formatting of the document text may vary depending on the original document."
    ]
   }
  ],
  "related": [
   "reading-settings",
   "document-tabs",
   "colors",
   "keyboard",
   "youtube"
  ]
 },
 {
  "id": "reading-settings",
  "group": "features",
  "title": "Saved view settings, page turning and auto-scroll",
  "summary": "Save reading looks you use often and choose how to read e-books.",
  "keywords": "View settings saved settings presets favorites defaults layout margins letter spacing indent page turning pages paginated auto-scroll autoscroll speed navigate time left",
  "sections": [
   {
    "title": "Saving with a name",
    "paragraphs": [
     "In View settings (▤) → Saved settings on the document toolbar, give your current settings a name. Choose which of layout, text size, font and screen mode to save, among those this document allows. You can save up to 100, search them by name, format or content, and sort them by Applicable first, Recently used, Name or Recently saved. Favorite, Rename, Duplicate, Overwrite with current settings, Delete and Undo last apply are also available."
    ]
   },
   {
    "title": "Applying to match the format",
    "paragraphs": [
     "Each saved setting shows whether it applies fully, partly or not at all to the current document. For example, text size and screen mode can be applied to a PDF, and screen mode to images and CBZ. If it applies partly, the items left out for this document are shown too.",
     "To apply it automatically when you first open a document of the same format, tap “Make default for this format.” Book HTML with its own reading toolbar uses that book’s text and screen settings. LibreMemo’s View settings (▤) can be opened in documents where the app provides the common reading toolbar."
    ]
   },
   {
    "title": "Page layout and navigation for e-books",
    "paragraphs": [
     "Reflowable EPUB, MOBI, AZW3 and FB2 books also get View and Navigate tabs. Adjust margins, text width, line and paragraph spacing, alignment, letter spacing, first-line indent, weight and hyphenation, and choose continuous scrolling or pages. Page numbers change with text size and window size. In Navigate, jump straight to a position and see an estimate of the reading time left. This e-book layout is not applied to fixed-layout EPUB, CBZ or PDF."
    ]
   },
   {
    "title": "Auto-scroll",
    "paragraphs": [
     "In continuous scrolling for an e-book, tap View settings → Navigate → Start auto-scroll. In the bar at the bottom of the screen, choose Pause/Resume, Slower/Faster (9 steps) or Stop. Scrolling yourself, tapping the text or using a page-turn key pauses it briefly, and Resume continues. It also pauses when you switch to another document tab, and it stops when it reaches the end. This is separate from Follow in YouTube, which tracks video playback."
    ]
   }
  ],
  "related": [
   "reading-view",
   "ebook-documents",
   "document-tabs",
   "youtube"
  ]
 },
 {
  "id": "speech",
  "group": "features",
  "title": "Read aloud (TTS)",
  "summary": "Listen to the document or a selected passage, and choose the voice and speed.",
  "keywords": "TTS tts read aloud speech text to speech narration listen play voice speed rate playback language pause last line margin selection read selection speaker",
  "sections": [
   {
    "title": "Playing",
    "steps": [
     {
      "title": "To listen to the document, press the speaker button.",
      "text": "The speaker to the left of the text size button at the top of the document opens the read-aloud toolbar. Press ▶ to skip the fixed title bar and contents and start reading from the beginning of the sentence containing the first body line visible at the top of the screen."
     },
     {
      "title": "To hear only selected text, press Read aloud.",
      "text": "Select text, then choose Read aloud in the selection menu. The same player reads the selection right away and stops at its end. To listen in another chapter, select text there again."
     },
     {
      "title": "Choose the speed and voice.",
      "text": "Each press of the speed button on the toolbar (shown as 1×) changes the speed (0.8, 1, 1.25, 1.5 or 2×). A speed changed during playback applies from the next sentence. Use the gear to choose the language and voice. ⏮ and ⏭ go to the previous and next sentence, ⏹ stops, and ✕ closes the player."
     }
    ]
   },
   {
    "title": "Choosing where to resume after pausing",
    "paragraphs": [
     "If you press ▶ again while reading is paused, it reads from the beginning of the sentence where it stopped. If you scroll or jump through the contents and then press ▶, it reads from the first sentence visible at the top of the new screen. To start from a particular sentence, tap a word in that sentence once while paused, then press ▶."
    ]
   },
   {
    "title": "The sentence being read and one line at the bottom",
    "paragraphs": [
     "In continuous scrolling, the sentence being read is underlined and the current view stays put. If the sentence reaches the bottom line, the view moves up to leave about one line of space at the bottom for the read-aloud toolbar. You can also move the toolbar by dragging its handle on the left. In paginated ebooks, pages turn to follow the sentence."
    ]
   },
   {
    "title": "Offline use and privacy",
    "notice": {
     "tone": "caution",
     "title": "Some voices may need an internet connection.",
     "text": "Read aloud uses the speech features of your device or browser. Voices installed on the device and voices from online services may work differently. Before listening to sensitive text, check your device’s speech service settings and whether local voices are available. Offline playback is not guaranteed for every voice."
    }
   }
  ],
  "related": [
   "speech-problems",
   "offline",
   "privacy"
  ],
  "references": [
   {
    "label": "How browsers tell local and remote speech voices apart",
    "url": "https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService"
   }
  ]
 },
 {
  "id": "ai-search",
  "group": "features",
  "title": "AI search with selected text",
  "summary": "Opens the web page of an AI service you registered and sends it the selected text.",
  "keywords": "AI search LLM ChatGPT Claude Gemini Perplexity ask AI chatbot selected text selection copy paste URL address settings 2000 2,000",
  "sections": [
   {
    "title": "Choosing services",
    "paragraphs": [
     "In Settings → AI search → Manage, check the services you want to use. ChatGPT, Claude, Gemini and Perplexity are registered at first. You can change names and addresses or add other services, up to 20 in total. Enter a service page address that starts with http or https. If you check only one, AI search opens it directly; if you check several, you pick one each time you send text."
    ]
   },
   {
    "title": "Sending text",
    "paragraphs": [
     "Select text in the document and press AI search in the selection menu. If the address contains {text}, the selected text is put in its place and a Chrome tab opens. Only the first 2,000 characters can be sent in the address; if the text is longer, LibreMemo also tries to copy the full text to the clipboard and tells you the result. For an address without {text}, the text is copied and the service page opens. Paste it into that page yourself. If copying is blocked, you can copy directly from the document."
    ]
   },
   {
    "title": "Service sign-in and what is sent",
    "paragraphs": [
     "You don’t enter an API key in LibreMemo. Depending on the service, that website’s sign-in or terms of use apply. Text sent in the address or pasted by you is processed by the service you chose. You read the answer on that web page; it isn’t saved to your LibreMemo document automatically. If a service doesn’t support text in the address, remove {text} from the address and use the paste method."
    ]
   }
  ],
  "related": [
   "annotations",
   "web-and-paste",
   "privacy"
  ]
 },
 {
  "id": "web-and-paste",
  "group": "features",
  "title": "Opening web addresses, pasting text and saving directly",
  "summary": "How to bring material from external pages into LibreMemo.",
  "keywords": "web internet search address bar URL paste clipboard web page website CORS external tab Markdown save page",
  "sections": [
   {
    "title": "Reopening a web tab sent from LibreMemo",
    "paragraphs": [
     "Type a search term or web address in the address bar at the top of the Library, and the external page opens in a browser tab. Select the web tab created in LibreMemo, or press “Switch to browser” on that screen, to go to the linked tab. If you closed the window, use “Reopen in browser” to open the last address you sent.",
     "If you clicked a search result or moved to another page in the browser, copy the new address of the article you want to keep from there. When you come back to LibreMemo, press whichever you need: “Paste text and annotate” or “Import files”."
    ]
   },
   {
    "title": "Pasting Markdown or plain text",
    "paragraphs": [
     "In Library → Paste text, put your text in “Content”. You can also open it by pressing Ctrl+Shift+V or ⌘+Shift+V outside an input field. You can paste up to 200,000 characters. If the title is “Pasted text”, the first Markdown heading becomes the document title; a title you typed yourself is kept as is.",
     "Markdown headings (#), emphasis (**), lists, checklists, quotes, tables, code blocks and links are shown in the reading view. If you fill in “Source URL (optional)”, an “Open original” link is added at the end of the finished document. Press “Save and annotate”.",
     "To keep a copied web page’s images and original formatting, save it in the browser as Webpage, Single File (.mhtml) and import it. External images in Markdown are shown as address links; image data embedded in the text is stored with it."
    ]
   },
   {
    "title": "Saving directly from the sent address",
    "paragraphs": [
     "In LibreMemo’s web tab, expand “Sent address · Import directly” to see the last address you sent. For an ordinary page, press “Save directly from this address”. If the site allows reading, a reading document is added to your Library. The button is disabled on search result pages. For articles that need sign-in, save them as a single file from a browser tab where you can see them, or copy and paste the text."
    ]
   }
  ],
  "related": [
   "web-tutorial",
   "import-files",
   "missing-resources"
  ]
 },
 {
  "id": "export-html",
  "group": "features",
  "title": "Export: Archive with original · Reading copy (HTML) · PDF",
  "summary": "Send a document and its annotations as a file, or copy your marked passages and notes.",
  "keywords": "export share send librememo .librememo ZIP original annotations bookmarks HTML PDF annotated PDF archive backup excerpt notes copy Markdown",
  "sections": [
   {
    "title": "How to export",
    "steps": [
     {
      "title": "Open the document you want to send.",
      "text": "Check the current annotations and bookmarks, then press Export at the top. On the web browsing screen, Save page is a button that first brings the document into your Library."
     },
     {
      "title": "Choose one of three formats.",
      "text": "The default is Archive with original. It suits recipients who will keep reading and editing in LibreMemo. Choose HTML for a reading copy, or Annotated PDF to view an original PDF in other PDF apps."
     },
     {
      "title": "Press Export and save as a new file.",
      "text": "Choose a location and file name. Where a save dialog isn’t supported, the file arrives as a browser download. If you’re told it’s the same file as the original, choose a different name or location. You can cancel while saving, and if an error appears you can try again in the same window. If you add annotations after exporting, export a fresh copy before sending it."
     }
    ]
   },
   {
    "title": "Copy excerpt notes",
    "paragraphs": [
     "Open a document, press Export → Copy excerpt notes at the top, and paste into a notes app or Markdown editor. Even if a search term or color filter is set in the sidebar, it copies all the marked passages and notes in the whole document. Quotes and notes are placed under their chapter or section, or PDF page number. YouTube moment notes and subtitle marks with a confirmed time get a link that opens that scene.",
     "Pen drawings and shapes without text are left out of excerpts. If there’s no text to copy, the button is disabled. If the browser doesn’t allow clipboard copying, the excerpt appears selected in the same window. Use your device’s copy command."
    ]
   },
   {
    "title": "Archive with original (.librememo)",
    "paragraphs": [
     "Every supported format is sent as the same kind of archive. It keeps the original bytes, the original file name and extension, and the current annotations, bookmarks and reading position. For Office, Hangul and ebooks it also keeps the converted reading view so you can keep your place even after the reader is updated. For older documents whose original wasn’t kept, you’re told that the current reading copy will be archived instead.",
     "The recipient chooses the .librememo file in Library → Import files, or drags it onto the window. On the first import, the annotations and bookmarks in the archive open too. When importing the same file again, choose between going to the existing annotated file, opening it fresh, or canceling. Opening fresh starts an independent copy with no annotations or bookmarks. It’s an ordinary ZIP, so you can also extract the original from original/ with an archive tool."
    ]
   },
   {
    "title": "Reading copy (HTML) (.html)",
    "paragraphs": [
     "Sends the current reading view with annotation and bookmark information as one HTML file. If you need the editing structure of Office files or ebooks, or the complete original bytes, choose Archive with original. If you import the file into LibreMemo again, you can keep using the existing HTML annotations.",
     "A PDF HTML contains the original PDF, the annotation information and an offline PDF converter. When opened in a browser, it builds a standard annotated PDF on the device and shows it. If the PDF doesn’t appear, use Open PDF or Save PDF to view it in the device’s PDF viewer. No app or server sign-in is needed. Large PDFs depend on processing time and device memory. PDF archive HTML files from earlier versions can still be imported."
    ]
   },
   {
    "title": "Annotated PDF (.pdf)",
    "paragraphs": [
     "Use this for documents whose original is a PDF. It keeps the original pages, links and existing contents, and adds highlights, underlines, strikethroughs, handwriting, shapes, Korean notes and LibreMemo bookmarks as standard PDF annotations and contents entries. Editing features vary between PDF viewers. To restore the exact editing state saved by LibreMemo, use .librememo.",
     "Annotations that can’t be placed exactly on one PDF page, such as a drawing extending off the page, are not silently dropped while reporting success. If that error appears, choose Archive with original, which keeps every annotation. For PDFs with digital signature fields, you’re directed to the archive so the original signature isn’t broken."
    ]
   },
   {
    "title": "Backing up the whole Library",
    "paragraphs": [
     "Export sends one selected document. On computers and Android, copying the whole dedicated folder moves your other documents, app settings, Trash and annotation history as well. For in-app storage on iPhone and iPad, sync the whole Library with another device to move it. Restore any documents you want to keep from the Trash first, and turn on Also sync app settings if you want to move your settings too. Archives must be under 4GB; damaged files, invalid paths and unsupported versions are rejected before they’re added."
    ]
   },
   {
    "title": "Check your personal notes",
    "notice": {
     "tone": "caution",
     "title": "Current annotations and bookmarks are sent too.",
     "text": "Check your personal notes and bookmarks before sharing. A copy sent to someone can’t be recalled remotely."
    }
   }
  ],
  "related": [
   "review-tutorial",
   "search-outline",
   "storage-differences",
   "backup-restore",
   "privacy",
   "import-files"
  ]
 },
 {
  "id": "annotation-history",
  "group": "features",
  "title": "Restoring an earlier state from annotation history",
  "summary": "Restore annotations, bookmarks and contents names you renamed to a point in time you choose.",
  "keywords": "annotation history versions previous version revert undo restore roll back date year month day timeline",
  "sections": [
   {
    "title": "Browsing the history",
    "paragraphs": [
     "Open a document and press ⋯ (Document tools) → Annotation history on the floating toolbar. If you open it from a document’s menu in the Library, that document’s history appears. Choose a year, month and day, or use Previous date and Next date to move between days that have records. Recent history goes back to the last saved date. If a day has many records, page through them 50 at a time. Dates follow this device’s time zone."
    ]
   },
   {
    "title": "How is it recorded?",
    "paragraphs": [
     "When you annotate, your current work is autosaved. A separate history entry is recorded when annotations, bookmarks or contents names change. Changes are grouped until whichever comes first: about 5 minutes after the first change, or about 1 minute after you stop typing. Remaining changes are also recorded when you close the document tab."
    ]
   },
   {
    "title": "Restoring",
    "paragraphs": [
     "Press a point in the list to see the number of annotations and bookmarks and a preview of the annotations. The preview shows up to 100 annotations. Back to history list returns to the date picker, and Restore to this point applies all the annotations, bookmarks and renamed contents names from that time to the current document. The state just before restoring is also kept in the history, so you can choose it again."
    ]
   }
  ],
  "related": [
   "erase-undo",
   "backup-restore",
   "storage-differences"
  ]
 },
 {
  "id": "new-edition",
  "group": "features",
  "title": "Moving annotations/bookmarks to a new edition of a book",
  "summary": "Finds the same text in the new edition and moves your annotations, bookmarks and renamed contents names.",
  "keywords": "new edition revised edition updated version book move annotations move bookmarks transfer migrate carry over",
  "sections": [
   {
    "title": "How to move them",
    "steps": [
     {
      "title": "Open the old book.",
      "text": "In the old document that has annotations, bookmarks or renamed contents names, press ⋯ (Document tools) → Move annotations/bookmarks to a new edition on the floating toolbar. You can also use the same feature from the old document’s menu in the Library."
     },
     {
      "title": "Choose the new edition file.",
      "text": "Choose the supported document file you received as the new edition, and LibreMemo looks for the same places and for sentences that have moved. Large books may take a while as chapters are checked."
     },
     {
      "title": "Check the results.",
      "text": "Check how many annotations and bookmarks can be moved and how many can’t, separately. For bookmarks, it distinguishes those whose text position was found from those that will be moved to the start of their chapter. If you renamed contents entries, you also see how many of those can be moved. When you’re done checking, press Open new edition. If you cancel, nothing is moved."
     }
    ]
   },
   {
    "title": "How bookmark positions are found",
    "paragraphs": [
     "When you create a bookmark, the text you were reading and the surrounding context are saved with it. In the new edition, LibreMemo finds that text and moves the bookmark down to the character position, searching even if spaces, line breaks or paragraph structure changed or the content moved to another chapter. If the same sentence repeats, the surrounding context is compared. This position information is also included in autosave, device sync, Archive with original and Reading copy (HTML).",
     "Older bookmarks that saved only screen coordinates are filled in with position information from the currently loaded text. Bookmarks already moved to a chapter start no longer have their original exact position, so find the original spot in the old book, create the bookmark again, and then move it. If the text was deleted or several positions can’t be told apart, the bookmark isn’t reported as moved to an exact position. In books that load chapter by chapter, once the same chapter is confirmed the bookmark is moved to the start of that chapter, and you’re told so in the results window and when you jump to it. Bookmarks whose chapter can’t be found, or whose chapter in the new edition can’t be opened, aren’t moved."
    ]
   },
   {
    "title": "When the new edition is a PDF",
    "paragraphs": [
     "LibreMemo finds the sentences you selected or the text saved in your bookmarks inside the PDF and places them on the new pages. If the same sentence appears several times, the surrounding context is checked too. Items with no text to refer to, such as margin bookmarks in scanned PDFs or pen marks over images, and items where one of several spots can’t be settled on, are listed under items not moved in the results window."
    ]
   },
   {
    "title": "The old document stays",
    "paragraphs": [
     "The new edition opens as a new document. The old book and its annotations and bookmarks are kept as they are, so tidy up after checking the results. Annotations and bookmarks already in the new edition are kept too, not erased. Annotations on sentences deleted from the new edition and items whose position couldn’t be confirmed aren’t moved; you can see them listed in the results window."
    ]
   }
  ],
  "related": [
   "annotation-history",
   "backup-restore",
   "import-files"
  ]
 },
 {
  "id": "device-sync",
  "group": "features",
  "title": "What Device sync covers and skipping originals",
  "summary": "Explains what is exchanged and how identical files are skipped.",
  "keywords": "device sync synchronize sync scope include originals transfer skip same file identical duplicate QR WebRTC connection code app settings 1GB 2GB 2GiB 16MiB",
  "sections": [
   {
    "title": "Choosing the scope",
    "paragraphs": [
     "Whole Library merges, in both directions, the text, annotations, bookmarks, reading positions, history and relative folder structure of regular documents, excluding the Trash. When you start from a document, you can also choose Share current document only. By default that sends just that one document; if there are annotation and bookmark choices for a document with the same original and reading view, only those results are sent back to the other device and applied on both sides. Choose the scope with the Whole Library and Share current document only buttons; you can’t select both at once. Sharing only the current document doesn’t change app settings."
    ]
   },
   {
    "title": "Automatic handling of original files",
    "paragraphs": [
     "If a file with exactly the same content already exists on the other device, the app automatically skips sending the original. The file name, document ID and dedicated storage folder name may differ. Only files that are missing or have different content are sent, so there’s no separate include-originals option to choose."
    ]
   },
   {
    "title": "Also sync app settings",
    "paragraphs": [
     "With Whole Library and Other device connects to this one selected, turning on Also sync app settings compares settings such as Design theme, UI text size, highlight color names, saved View settings, Library view and Read aloud. If the settings actually in use are the same, you aren’t asked. If they differ, before original files are sent, the device receiving data first sees a list of differences and chooses which device’s settings to use. The chosen settings are applied to both; if you uncheck the box on the device showing the QR code, each device keeps its own settings. Each device remembers the last checkbox state, which starts out on. This option isn’t shown for Connect to another device or Share current document only. Each device remembers its own checkbox state, and syncing settings doesn’t overwrite it with the other device’s state.",
     "Cancel in the settings choice window stops the sync before any document or app settings are applied. If settings change in another window while you’re choosing, you’re asked to reconnect. The dedicated storage folder’s name, link and file access permission aren’t synced."
    ]
   },
   {
    "title": "When syncing again",
    "paragraphs": [
     "If annotations or bookmarks differ for a document with the same original and reading view, you choose one of four options, even if only one side changed. Merge doesn’t duplicate identical content, and if the same item was edited differently, both versions are kept. Items deleted on one device but still present on the other come back when you merge. To match deletions on one side exactly, choose the option that uses that device’s version. The same original isn’t sent or saved again.",
     "The choice is made once on the device that receives data first, and the previous annotations and bookmarks from both sides are kept in annotation history. “This device” and “the other device” refer to the device where the choice window appears. Do nothing keeps the current content of that document on each device, and syncing of other documents continues. Use the latest version on both devices."
    ]
   },
   {
    "title": "Re-sync speed when only annotations changed",
    "paragraphs": [
     "During the same session, originals whose content has already been verified aren’t re-read and re-hashed when annotations, bookmarks or reading positions change. If you replace an original or receive a new original from another device, it’s checked separately; a file isn’t skipped just because its name or size matches. After you reopen the app, or for documents dropped from the cache, verification runs again on the first check. Time for setting up a new device-to-device connection and for processing annotations and history still remains."
    ]
   },
   {
    "title": "Saving and completion",
    "paragraphs": [
     "Original verification, annotation change comparison, app saving and dedicated storage folder updates are shown as separate stages. While waiting for a document choice, saving isn’t in progress, so finish or cancel the choice shown. After both sides show the completion message, press OK and close. The originals in one transfer list may total 2GiB, and lists of annotations, history and so on may be up to 16MiB. If you exceed this, split the documents up and send them with Share current document only."
    ]
   },
   {
    "title": "Trash and deletion state",
    "paragraphs": [
     "Documents in the Trash aren’t sent or received, even with Whole Library. Moving to Trash, restoring and permanently deleting are also tracked separately on each device. A document in this device’s Trash isn’t automatically restored as a regular document on the other device; to sync it, restore it to the Library first. A full backup of the dedicated folder includes the Trash."
    ]
   },
   {
    "title": "Links and permissions stay as they are",
    "paragraphs": [
     "The dedicated storage folder’s name, link and file access permission stay on each device. Encrypted connection information is sent to the relay service, and originals travel over an encrypted device-to-device connection. Simply having the app open doesn’t sync with other devices automatically."
    ]
   }
  ],
  "related": [
   "sync-tutorial",
   "sync-conflicts",
   "sync-problems",
   "privacy"
  ]
 },
 {
  "id": "keyboard",
  "group": "features",
  "title": "Keyboard shortcuts and using a phone",
  "summary": "Common shortcuts, plus tips for selecting text and screen size.",
  "keywords": "keyboard shortcuts hotkeys keys keyboard shortcut ctrl command cmd ⌘ phone mobile touch tablet gestures",
  "sections": [
   {
    "title": "Keys in a document",
    "table": {
     "headings": [
      "Key",
      "Action"
     ],
     "rows": [
      [
       "V / P",
       "Select / Pen"
      ],
      [
       "H / U",
       "Highlighter / Underline"
      ],
      [
       "E / N",
       "Eraser / Note"
      ],
      [
       "R",
       "Rectangle"
      ],
      [
       "Ctrl/⌘ Z",
       "Undo"
      ],
      [
       "Ctrl/⌘ Shift Z",
       "Redo"
      ],
      [
       "Ctrl/⌘ F",
       "Search document"
      ],
      [
       "Ctrl/⌘ S",
       "Save current changes"
      ],
      [
       "Ctrl/⌘ L",
       "Enter address"
      ],
      [
       "F / Esc",
       "Document full screen / Exit"
      ],
      [
       "Ctrl/⌘ V",
       "Import a copied image or screenshot (outside input fields)"
      ],
      [
       "Ctrl/⌘ Shift V",
       "Open Paste text (outside input fields)"
      ]
     ]
    }
   },
   {
    "title": "Shortcuts for video and page turning",
    "paragraphs": [
     "In YouTube documents, video shortcuts take priority. F is video full screen, and Shift+P is the previous video in the playlist. Press ? to open the list of video shortcuts. In paginated ebook reading, the arrow keys, PageUp, PageDown and Space turn pages. When a button or input field has focus, that control’s keys take priority."
    ]
   },
   {
    "title": "Help and input fields",
    "paragraphs": [
     "In Help, Ctrl/⌘ F moves to the search box. After typing a search term, use ↓ and Enter to open the first result. “Back to results” returns to the same list. Esc while searching clears the search term. On a phone, choose the guide to read from “Jump to topic”.",
     "With focus on the document tabs, move with ←/→ or pick the first or last tab with Home/End. Pressing ↓ on the highlighter, underline, rectangle, eraser or note button in the floating toolbar opens its detailed tools. While typing text, ordinary character keys keep typing."
    ]
   },
   {
    "title": "On a phone",
    "paragraphs": [
     "Long-press text, adjust the range with the selection handles, then tap highlighter, underline or note in the floating toolbar. With the text mode of the highlighter or underline chosen, you can also mark text right away by dragging over it with a finger or pen. In that state, scroll with two fingers; return to the select tool for normal controls. On narrow screens, tapping the document area closes a sidebar that’s open on top. Where it can sit beside the text, as on a wide tablet in landscape, it stays open. If the keyboard makes the screen smaller, dismiss it when you finish typing to see more of the document. If tools cover the text, move them with their handles, and zoom in for small text."
    ]
   }
  ],
  "related": [
   "reading-view",
   "annotations",
   "document-tabs"
  ]
 },
 {
  "id": "design-themes",
  "group": "features",
  "title": "Choosing, starring and customizing a Design theme",
  "summary": "Preview and apply themes, then choose textures, fonts and colors for combinations you use often.",
  "keywords": "design theme themes skin look style customize custom search favorites star mood suggestion accent color corners font frame light dark dark mode hanji graph paper manuscript paper aurora AMOLED default reset restore",
  "sections": [
   {
    "title": "Previewing and applying",
    "paragraphs": [
     "In Settings at the top, press “Choose theme” under “Design theme”. Each card’s Korean and English samples and small button let you compare fonts, backgrounds and accent colors. Press a card to apply it at once to the Library, top bar, toolbars and sidebar. Choose Light, Dark or System under “Brightness”, and the cards are shown again in that brightness. Adjust the document’s text size and zoom with the reading tools after opening a document.",
     "Only some themes are shown at first. Find the rest with “Show all 80” or in the 10 categories. “Suggest a mood” picks one theme different from the current one and applies it right away."
    ]
   },
   {
    "title": "Search and favorites",
    "paragraphs": [
     "Type a name, mood or texture such as “manuscript paper” or “aurora” in the search box. Separate several words with spaces to find themes that match all of them. Pin built-in themes you use often with the star at the top right of the card. See them together under “★ Favorites” and search within them. Recently starred themes come first. Press the star again to remove it."
    ]
   },
   {
    "title": "Changing and resetting detailed styles",
    "paragraphs": [
     "In “Custom style combination”, choose the corner shape, background texture, app font, cards and outlines, and accent color. For example, you can change just the background texture to “Cornell summary sections”, or pick any color with the color picker. To reset a single item, press “Theme default” in that list or “Theme default color” next to the color.",
     "Choosing another theme card applies that theme’s font, texture and color combination. “Restore defaults” returns to the app’s default theme; your brightness and starred favorites are kept. The selected theme and current customizations are saved in app settings."
    ]
   }
  ],
  "related": [
   "reading-view",
   "library",
   "device-sync",
   "offline"
  ]
 },
 {
  "id": "storage-folder",
  "group": "data",
  "title": "Connecting the dedicated storage folder and permissions",
  "summary": "Check the folder link on computers and Android, and the storage status of in-app storage on iPhone and iPad.",
  "keywords": "dedicated storage folder data folder setup settings Documents path location permission allow access connect link Android iPhone iPad Safari phone every time restart relaunch continue cancel OPFS",
  "sections": [
   {
    "title": "Finding the data folder in Settings",
    "paragraphs": [
     "Press the Settings icon at the top, and below Device sync you’ll find a note that data is saved on the device, and the Data folder item. Check the storage name and save status there. On computers and Android, press Manage to reconnect an external folder. For in-app storage on iPhone and iPad, press Manage → Check storage status. When the app is launched fresh, the folder is checked after the new version check and your install or cancel decision."
    ]
   },
   {
    "title": "Connecting for the first time on a computer or Android",
    "paragraphs": [
     "Create new storage folder starts from Documents. If the location you allow contains a Documents folder, a dedicated folder with the name you entered is created inside it. The default name is LibreMemo, and you can change it. On devices without a Documents folder, it’s created under the location you choose. You can start using it once the first connection and save succeed."
    ]
   },
   {
    "title": "Choosing an existing folder",
    "paragraphs": [
     "Connect existing storage folder means choosing the dedicated folder itself. Also choose folders brought over to a new device here. If the browser won’t let you pick Documents or your whole home folder, create a dedicated subfolder in the file picker and choose that subfolder. Don’t use a folder containing unrelated personal files as a new dedicated folder."
    ]
   },
   {
    "title": "When connecting the storage folder takes a long time",
    "paragraphs": [
     "If opening the remembered folder takes a while, the folder name and a Cancel button appear. If another LibreMemo window is saving, it continues automatically once that finishes. Press Cancel if you don’t want to wait. To start again, press Connect storage folder. If a file was already being written, the button becomes available once that save finishes."
    ]
   },
   {
    "title": "If you’re asked for permission again",
    "paragraphs": [
     "Access permission for an existing folder is checked automatically when the app starts. If permission is still granted, the folder connects without a prompt. If it needs to be granted again, a continue-using screen shows the remembered folder name with Continue and Cancel. Continue asks Chrome again for read and write permission for the existing folder. You have to press it yourself to open the permission prompt; you don’t need to choose or create a folder again. Expand the other folder and permission help for a detailed explanation and the option to choose a different storage folder.",
     "If Chrome’s permission prompt actually offers Allow on every visit, you can choose it. Android Chrome may ask for permission every time you close and reopen the app, and installing it as a PWA on the home screen doesn’t guarantee that a single permission will last. LibreMemo can’t skip the browser’s permission request or make it permanent. Remembering the folder name and keeping access permission are separate things."
    ]
   },
   {
    "title": "If you don’t want to connect now",
    "paragraphs": [
     "You can close the first setup dialog with Cancel or Close, your phone’s Back gesture, or Esc. On the continue-using screen, press Cancel or Esc. The app stays on the waiting-to-connect screen and doesn’t reopen the prompt automatically. Press Connect storage folder to start again.",
     "Canceling keeps your existing folder and data, and setup isn’t marked complete. Any file waiting to be opened is also canceled. You can start working on documents after connecting the folder. A folder save already in progress is finished safely, and the waiting screen stays until you start again yourself."
    ]
   },
   {
    "title": "On iPhone and iPad",
    "paragraphs": [
     "If Safari, Chrome or the home screen app has no external folder picker, LibreMemo prepares dedicated storage (OPFS) inside the app to store copies of originals, annotations, bookmarks, history and settings. Use Settings → Data folder → Manage → Check storage status to reconnect to the current storage and check its status.",
     "The home screen app and a browser tab may open different Libraries. Check the icon or browser you usually use first. Before clearing site data, keep a copy on another device with Device sync, or export the documents you need as Archive with original."
    ]
   }
  ],
  "related": [
   "backup-tutorial",
   "save-problems",
   "storage-differences"
  ],
  "references": [
   {
    "label": "Chrome guide to file and folder access and permissions",
    "url": "https://developer.chrome.com/docs/capabilities/web-apis/file-system-access/"
   },
   {
    "label": "Chrome guide to persistent permissions and Allow on every visit",
    "url": "https://developer.chrome.com/blog/persistent-permissions-for-the-file-system-access-api"
   },
   {
    "label": "Android default for persistent permissions · official Chromium source",
    "url": "https://raw.githubusercontent.com/chromium/chromium/main/chrome/browser/file_system_access/file_system_access_features.cc"
   }
  ]
 },
 {
  "id": "automatic-save",
  "group": "data",
  "title": "Reading the autosave indicators",
  "summary": "Check whether the app save and the connected folder save have finished.",
  "keywords": "autosave auto save saving saved complete failed failure retry save status pending unsaved dot",
  "sections": [
   {
    "title": "Saving while you read",
    "paragraphs": [
     "Annotations such as highlights and notes are autosaved after a short wait. Scrolling and zooming are saved together after you stop reading, and the last state is also saved when you close the document tab. Changing only your reading position doesn’t turn on the annotation change indicator or add to annotation history.",
     "While changes are waiting to be saved, a small dot appears next to the document tab title and disappears when saving is done. The status bar at the bottom doesn’t pop up every time you annotate. It only appears when something needs attention, such as a save failure or retry, and when you go online or offline."
    ]
   },
   {
    "title": "Check that it’s also saved to storage",
    "paragraphs": [
     "After the dot on the tab disappears, if Settings → Data folder shows that folder autosave is complete, it has also been written to the dedicated folder or in-app storage. When the status bar is showing, you can also press the folder status to open the management screen. When copying an external folder to move it, start copying only after this save is done."
    ]
   },
   {
    "title": "If a failure is shown",
    "notice": {
     "tone": "caution",
     "title": "Check the cause of the failure, then retry.",
     "text": "Check storage space, folder write permission and the folder location. Your work may still be in the app, so don’t clear browser data right away to fix it. If possible, also export the current document as Archive with original to keep a separate copy."
    }
   }
  ],
  "related": [
   "save-problems",
   "backup-restore",
   "annotation-history"
  ]
 },
 {
  "id": "storage-differences",
  "group": "data",
  "title": "Autosave, document export and folder backup compared",
  "summary": "Choose the way of keeping data that fits your purpose.",
  "keywords": "backup storage location original copy settings JSON export comparison difference annotation history autosave sync",
  "sections": [
   {
    "title": "What does each keep?",
    "table": {
     "headings": [
      "Method",
      "Purpose and contents"
     ],
     "rows": [
      [
       "App autosave",
       "Lets you continue with the current document, annotations, bookmarks and reading position on this device. Affected by clearing the browser’s site data."
      ],
      [
       "Dedicated folder / in-app storage",
       "Keeps documents, annotations, bookmarks, reading positions, history, Trash and settings. An external folder on a computer or Android can be copied as a whole and restored. In-app storage on iPhone and iPad is part of that app’s site data."
      ],
      [
       "Document export",
       "Sends the current document as Archive with original, Reading copy (HTML) or Annotated PDF. It isn’t a backup of the whole Library or the full history."
      ],
      [
       "Settings JSON",
       "Saves or loads the settings you want separately, such as writing tools, Design theme and Library view."
      ],
      [
       "Device sync",
       "Exchanges the Library, excluding the Trash, and its changes. If annotations or bookmarks differ for a document with the same original and reading view, you choose to merge, use one side, or skip. It doesn’t replace past backup copies."
      ]
     ]
    }
   },
   {
    "title": "Saving or loading just the settings file",
    "paragraphs": [
     "Expand Settings → Use a previous settings JSON file (optional). Save settings file exports your current settings as JSON. Load settings file applies saved settings. On devices that remember access to the same file, you can use Reload.",
     "Normally the app autosaves settings too. After moving your settings with JSON, move documents and annotations with the dedicated folder, Device sync or document archives. Access to an external folder on a new device is granted on that device."
    ]
   },
   {
    "title": "Imported originals and excerpt notes",
    "paragraphs": [
     "The original you imported stays as it was before importing. To put your current annotations in a file, use document export. To move quotes into writing, use Copy excerpt notes to create Markdown you can paste. To restore the original file together with editable annotations, use Archive with original."
    ]
   }
  ],
  "related": [
   "export-html",
   "backup-restore",
   "automatic-save"
  ]
 },
 {
  "id": "backup-restore",
  "group": "data",
  "title": "Backing up and recovering so you don’t lose data",
  "summary": "A separate copy of the whole dedicated folder is what matters.",
  "keywords": "backup restore recover recovery data loss lost data reset clear browser data deleted broken device failure",
  "sections": [
   {
    "title": "Making a backup copy",
    "bullets": [
     "On computers and Android, confirm the save is complete in Settings → Data folder, then copy the whole connected dedicated folder to another storage device. Keep the management files in the folder, such as HTMLMemo-library.json and HTMLMemo-data, as well.",
     "On iPhone and iPad, before clearing site data or deleting the home screen app, sync the documents you need with another device or export them as .librememo files. Restore any documents you want to keep from the Trash first.",
     "Check that your Library and important annotations open on the new device before cleaning up data on the old one."
    ]
   },
   {
    "title": "If browser data has been lost",
    "paragraphs": [
     "On computers and Android, open the app and choose the dedicated folder you kept with Connect existing storage folder. Grant permission and check your Library and history. If in-app storage on iPhone or iPad was cleared, receive the data again from another device you synced with, or import the .librememo files you exported."
    ]
   },
   {
    "title": "If you have no copy to restore",
    "notice": {
     "tone": "caution",
     "title": "There is no server-side copy to recover from.",
     "text": "LibreMemo doesn’t provide a permanent storage server for documents or sign-in-based cloud recovery. If you lose the browser data and all dedicated folders, backups and exported files, the app can’t recreate the content. Keep a separate copy in case the device breaks or the folder itself is deleted."
    }
   }
  ],
  "related": [
   "backup-tutorial",
   "trash",
   "storage-differences",
   "save-problems"
  ]
 },
 {
  "id": "trash",
  "group": "data",
  "title": "Restoring from the Trash and deleting permanently",
  "summary": "Closing a tab, moving to Trash and deleting permanently are different things.",
  "keywords": "trash bin recycle delete deleted restore recover permanently delete empty trash undo removed",
  "sections": [
   {
    "title": "Moving a document to the Trash",
    "paragraphs": [
     "Choose Move to Trash in a document’s menu in the Library. The document is hidden from the regular Library while its text, annotations, bookmarks and history are kept. Pressing × on a tab doesn’t delete the document; it only closes the open tab."
    ]
   },
   {
    "title": "Taking it back out",
    "paragraphs": [
     "Open the Trash in the Library and press Restore in the document’s menu. If its original folder still exists, it goes back there; otherwise it’s restored to the top level. After restoring, the search term is cleared and that Library folder opens so the restored document is shown on screen. Items in the Trash are kept in the dedicated data folder too, but they’re excluded from Device sync."
    ]
   },
   {
    "title": "Before deleting permanently",
    "notice": {
     "tone": "caution",
     "title": "Deleting permanently and emptying the Trash can’t be undone.",
     "text": "Not only the text but also that document’s annotations, bookmarks and history are deleted from the app. There’s no automatic deletion period. Restore or back up anything you want to keep first. The external original file you imported from isn’t deleted along with it."
    }
   },
   {
    "title": "When syncing with other devices",
    "paragraphs": [
     "Documents in the Trash and their deleted or restored state are kept separately on each device and aren’t synced. The same document in this device’s Trash isn’t automatically restored as a regular document on the other device. To sync it, restore it to the Library first. Backups and restores that copy the whole dedicated folder include the Trash."
    ]
   }
  ],
  "related": [
   "backup-restore",
   "sync-conflicts",
   "annotation-history"
  ]
 },
 {
  "id": "sync-conflicts",
  "group": "data",
  "title": "Telling sync conflicts, sharing and backups apart",
  "summary": "How to choose so you don’t lose differing annotations.",
  "keywords": "sync conflict conflicts overwrite keep both use other device keep this device copy duplicate merge device sync",
  "sections": [
   {
    "title": "Annotation and bookmark choices for a document with the same original and reading view",
    "table": {
     "headings": [
      "Choice",
      "Result applied on both devices"
     ],
     "rows": [
      [
       "Merge and keep both",
       "Identical items are kept once, and items edited differently on each side keep both versions. No separate document copy is created."
      ],
      [
       "This device’s to the other device",
       "Both sides are matched to the annotations and bookmarks of the device where the choice window appears."
      ],
      [
       "The other device’s to this device",
       "Both sides are matched to the other device’s annotations and bookmarks."
      ],
      [
       "Do nothing",
       "Skips this document and keeps the current annotations and bookmarks on each device. Syncing of other documents continues."
      ]
     ]
    }
   },
   {
    "title": "You choose even if only one side changed",
    "paragraphs": [
     "If annotations or bookmarks differ for a document with the same original and reading view, you choose even if only one side changed. Choose once on the device that receives data first, and the result is applied to both. This choice doesn’t change the original, the document name, its place in the Library or the reading position, and you can see the annotations and bookmarks before and after in annotation history. Items deleted on one side come back when merging if they still exist on the other device. To match deletions exactly, choose the option that uses that device’s version."
    ]
   },
   {
    "title": "When the original or document details also differ",
    "paragraphs": [
     "If the original or reading view differs, or there’s a conflict over document details other than annotations, use the existing choices: Keep this device, Use other device, or Keep both. In that case, the whole document is kept as a pre-sync copy before it’s replaced with the other version. Closing the window or canceling stops changes that haven’t been applied yet."
    ]
   },
   {
    "title": "Keep earlier copies separately too",
    "paragraphs": [
     "Sync matches each side’s latest work. A mistaken edit can also be carried to the other device, so keep folder backups saved by date as well. Syncing the whole Library also sends the personal notes in regular documents. The Trash is excluded from syncing."
    ]
   }
  ],
  "related": [
   "device-sync",
   "backup-restore",
   "privacy"
  ]
 },
 {
  "id": "offline",
  "group": "data",
  "title": "Offline reading, installing the app and updates",
  "summary": "Explains what works without internet and when you need to be online again.",
  "keywords": "offline no internet PWA install app update new version refresh reload share app launch internet cancel install failed not responding home screen version about",
  "sections": [
   {
    "title": "To read offline",
    "paragraphs": [
     "The first time, connect to the internet so the app and its offline preparation can finish. After that you can open documents kept in your Library, read them and add annotations. Help search, annotation search and Copy excerpt notes are also handled on the device. On devices with an external folder connected, the browser may ask for permission when you reopen the app."
    ]
   },
   {
    "title": "When you need the internet",
    "paragraphs": [
     "Opening new external web pages, AI search, playing YouTube videos and fetching their details, and Device sync need the internet. Saved subtitles and annotations can be read even if the video won’t play. If a document refers to external resources, or the TTS voice you chose is a remote service, those parts may also need a connection. Open important material while actually offline, for example in airplane mode, to check beforehand that it’s preserved."
    ]
   },
   {
    "title": "Checking for and installing a new version",
    "paragraphs": [
     "When you launch the app fresh, it checks once for a new version before connecting the storage folder and checking permissions. This is the same for browser tabs and for the PWA installed on your device. When a new version is ready, you’ll see “A new version of this app is available. Install it?” If there’s no new version or you cancel the update, the storage folder is checked. If you install, the app reopens in the new version and then checks the folder, so you don’t need to grant folder permission before updating. It doesn’t keep checking while you use it or suddenly reload other windows.",
     "When you press Install, the documents, annotations, reading positions and settings stored on the device are kept, any needed saving is finished, and the app reopens in the new version. If saving or preparation fails, the existing version and data are kept and the reason is shown. After fixing the problem you can press Install again or cancel. If you close the prompt with Cancel, Close, Esc or your phone’s Back gesture, the existing version stays; even if you fully quit and reopen the app, it isn’t applied without your consent and you’re asked again next time.",
     "Checking for and downloading a new version needs the internet. An update already prepared on the device can be chosen and installed even offline. You don’t need to remove or reinstall the PWA to update. See the current version in Settings → About or at the bottom of this Help. Don’t clear site data first to fix update problems."
    ]
   },
   {
    "title": "Adding an app icon to your home screen or computer",
    "paragraphs": [
     "Press Settings → Launch and share app → Install app. On computers and Android, follow the browser’s install dialog or the menu instructions shown on screen. On iPhone and iPad, tap Add to Home Screen in the Share menu of Safari or Chrome, then choose Add. The first time you launch it from the home screen, that app’s Library opens."
    ]
   },
   {
    "title": "If installing is slow to respond or shows an error",
    "paragraphs": [
     "When you press Install, the needed document saving is finished first. Checking a storage folder that wasn’t yet connected at startup is postponed until after the update. Once the approved new version is confirmed as applied, the app reopens; if only the response was lost, it checks once more whether the same version was applied. If it changed to a different version or it can’t confirm whether the update was applied, the current screen and data are kept and an error is shown.",
     "Press Install again in the update prompt, or reopen the app and check the new version prompt. Other open windows keep the screen you’re using. Don’t clear site data or the dedicated storage folder to fix update problems."
    ]
   },
   {
    "title": "Checking the app address and version",
    "paragraphs": [
     "To tell someone about the app, press Settings → Launch and share app → Copy URL. They’ll open their own Library at that address. To send your annotations too, open the document and use Export.",
     "See the current version in Settings → About or at the bottom of Help. About also includes license information for the app, the document reading engines and the fonts."
    ]
   }
  ],
  "related": [
   "privacy",
   "backup-restore",
   "speech-problems"
  ]
 },
 {
  "id": "privacy",
  "group": "data",
  "title": "Personal documents, network use and shared devices",
  "summary": "Check where data is stored and which features connect to outside services.",
  "keywords": "privacy security personal data confidential sensitive text sign out log out sign in login server cloud encryption encrypted shared device",
  "sections": [
   {
    "title": "It’s stored on this device",
    "paragraphs": [
     "On computers and Android, data is stored in the browser’s storage and the dedicated folder you connected. On iPhone and iPad with in-app storage, it’s stored in the storage space of that browser or home screen app. If you copy an external folder and hand it over, the Library, Trash, history and settings inside go with it. On shared devices, check the account and storage location."
    ]
   },
   {
    "title": "When connecting or sharing",
    "bullets": [
     "Web addresses and Web search connect to those external sites. AI search puts the selected text in the address or copies it to the clipboard and opens the service page. Content you paste yourself is also processed by that service.",
     "Creating or playing a YouTube document connects to YouTube for the title, thumbnail, playlist and video. The video file itself isn’t downloaded and stored.",
     "When you start Device sync, connection information is encrypted and relayed, and originals are exchanged over an encrypted device-to-device connection. Show the connection code or QR code only to the person you’re connecting with.",
     "Syncing the whole Library includes the personal notes in regular documents and excludes the Trash. To send only part of it to someone, use Share current document only or that document’s Export.",
     "TTS may use online voices, so for sensitive text check the speech service settings of your device and browser.",
     "Anyone who receives an exported archive, HTML or PDF, or a copy of the dedicated folder, can see the data inside. Check any personal notes included before sending."
    ]
   },
   {
    "title": "Before clearing browser data",
    "notice": {
     "tone": "caution",
     "title": "Check your backups first.",
     "text": "Clearing site data, switching browser profiles, removing the app and cleaning up device storage can affect the data inside. Before clearing, make sure you can open your data somewhere else. On computers and Android, check the copied dedicated folder; on iPhone and iPad, check a device you synced with or your exported documents."
    }
   }
  ],
  "related": [
   "backup-restore",
   "export-html",
   "speech",
   "sync-conflicts"
  ]
 },
 {
  "id": "save-problems",
  "group": "trouble",
  "title": "When saving fails or a folder permission error appears",
  "summary": "Steps for finding the cause first, without deleting existing data.",
  "keywords": "not saving save failed save error no permission permission denied out of space disk full storage data error phone Android every time continue restart",
  "sections": [
   {
    "title": "Check in this order",
    "steps": [
     {
      "title": "Read the failure message shown.",
      "text": "Check whether it’s an app save failure or a dedicated folder write failure. If storage is low, free up space on the device."
     },
     {
      "title": "Reconnect the same actual folder.",
      "text": "If the remembered folder is still there, press Settings → Data folder → Manage → Reconnect and grant permission. If you moved the folder or need to change what’s connected, use Choose another folder to pick the dedicated folder that actually holds your data."
     },
     {
      "title": "Secure any remaining work.",
      "text": "If a document is open in the app, save its current state separately as Archive with original when you can. Press Retry save and check the status again."
     },
     {
      "title": "Don’t delete anything before recovering.",
      "text": "Don’t delete your only data folder or the browser’s site data first to fix the problem. Start by checking whether you have copies or exported files."
     }
    ]
   },
   {
    "title": "If your phone asks for folder permission every time",
    "paragraphs": [
     "If the existing folder name appears on the continue-using screen, the connection information is still remembered. Press Continue to allow read and write in Chrome. Permission has already been checked automatically; this button asks for permission again. Android Chrome may ask for permission again after closing, and installing as a PWA alone doesn’t stop repeated requests. When permission is kept, the folder connects automatically, and you can cancel if you don’t want to allow it."
    ]
   },
   {
    "title": "Check the right storage location for your device",
    "paragraphs": [
     "If a computer or Android shows a prompt to use Chrome, open the app address shown in Google Chrome. If you use in-app storage on iPhone or iPad, press Settings → Data folder → Manage → Check storage status. If your Library looks empty, first check the browser tab or home screen app you usually use."
    ]
   }
  ],
  "related": [
   "storage-folder",
   "automatic-save",
   "backup-restore"
  ]
 },
 {
  "id": "sync-problems",
  "group": "trouble",
  "title": "When QR connection, sync or transfer completion doesn’t work",
  "summary": "Check the relay connection, the actual device connection and save completion separately.",
  "keywords": "device sync not connecting stuck frozen stopped waiting QR scan transfer error not completing complete undefined slow takes long Mac mini Mac Wi-Fi wifi local network permission reconnect firewall",
  "sections": [
   {
    "title": "When there’s no QR code or you’re waiting for the other device",
    "paragraphs": [
     "On the device that will show the QR code, press Other device connects to this one → Start connection to display a waiting QR code. Then the other device scans the QR code or enters the same connection code. Reaching the relay alone doesn’t mean the devices are actually connected. If the first direct connection fails, the app looks for a connection path once more before sending data. Run the latest version on both devices and keep both windows open while it retries. If a connection still can’t be made before data is sent, check whether your router blocks traffic between devices and check each device’s firewall and network permissions."
    ]
   },
   {
    "title": "When a direct connection doesn’t work",
    "paragraphs": [
     "Apply the latest version of the app on both sides, create a new connection code and connect again. Even on the same Wi-Fi, a router that blocks traffic between devices or a device’s network permissions can prevent connecting. On a Mac, if Google Chrome appears under System Settings → Privacy & Security → Local Network, check that it’s allowed. If the QR code is hard to scan or you don’t want to allow camera access, enter the connection code."
    ]
   },
   {
    "title": "If the progress is full but it hasn’t finished",
    "paragraphs": [
     "Check which stage the receiving side is in: original verification, annotation change comparison, app saving or dedicated storage folder update. If it’s waiting for a document choice, pick how to handle it with the choice buttons shown. Do nothing skips only that document, while closing the window stops the whole sync. The sending side shows that it’s waiting for the other device to save and choose. If annotations or bookmarks differ for a document with the same original and reading view, the four choices appear even if only one side changed. Close the window after both sides show the completion message."
    ]
   },
   {
    "title": "If changing one annotation takes a long time",
    "paragraphs": [
     "First check whether the receiving device is waiting for an annotation and bookmark choice. Waiting for a choice isn’t a stalled save. If annotations or bookmarks differ for a document with the same original and reading view, you have to choose how to handle it even if only one side changed. Verified originals aren’t re-read or re-sent during the same session, but the first check after relaunching the app, setting up the connection, annotation history and folder saving can still take time."
    ]
   },
   {
    "title": "If it stops with an error",
    "paragraphs": [
     "Incomplete data isn’t added to your Library, and the existing saved data is kept. Check the cause and connect again. If both sides have the same original, the latest versions automatically skip resending it. If the originals total more than 2GiB, split the documents up and send them with Share current document only."
    ]
   }
  ],
  "related": [
   "sync-tutorial",
   "device-sync",
   "sync-conflicts",
   "automatic-save"
  ],
  "references": [
   {
    "label": "Checking local network access on a Mac · official Apple guide",
    "url": "https://support.apple.com/en-us/guide/mac-help/mchla4f49138/mac"
   }
  ]
 },
 {
  "id": "missing-resources",
  "group": "trouble",
  "title": "When images, some content or annotations don’t appear",
  "summary": "Start by checking the original file and what was included when it was saved.",
  "keywords": "images pictures not showing missing broken content blank screen empty page resources MHTML .mhtml book annotations disappeared gone lost",
  "sections": [
   {
    "title": "Checking document info and warnings",
    "paragraphs": [
     "Under ⋯ → Document info on the floating toolbar, you’ll find the title, file name, a link to the source URL if there is one, and the current number of annotations. If some resources couldn’t be stored, expand the list to check them. Red text in the contents or resource list, such as “악성코드가 포함되어 있는 파일입니다.” (“This file contains malware.”), is a warning contained in the original or the imported material. Check where it came from."
    ]
   },
   {
    "title": "If images or text are missing",
    "paragraphs": [
     "If a web page refers to external images or a separate folder, a single HTML file may be missing images. Save the web page in Webpage, Single File format and import the .mhtml file, or reopen a single HTML file that includes its resources. Screens shown after sign-in and streaming videos may not be included in the saved file."
    ]
   },
   {
    "title": "For compressed books or large files",
    "paragraphs": [
     "Import the book’s original HTML export file instead of a copy that saved only part of a web screen. If you opened a different edition of the same book, your earlier annotations may still be in the existing document. Use Move annotations/bookmarks to a new edition and check the results."
    ]
   },
   {
    "title": "If annotations seem to have disappeared",
    "paragraphs": [
     "In Sidebar → Annotations, clear the search term with ×, and if a color list appears, choose all annotations. Also check the annotation count and original file name in the Library to make sure you opened the document that has your existing annotations. A copy of the same file opened fresh is kept separately. You can also look for records in the open document’s annotation history and in the Library’s Trash."
    ]
   }
  ],
  "related": [
   "import-files",
   "export-html",
   "new-edition",
   "annotation-history"
  ]
 },
 {
  "id": "speech-problems",
  "group": "trouble",
  "title": "When there’s no sound or reading starts in the wrong place",
  "summary": "Check the play button, the device voice, the reading position and the selection.",
  "keywords": "TTS read aloud no sound no voice silent not playing won’t play voice pause listen speech",
  "sections": [
   {
    "title": "If there’s no sound",
    "paragraphs": [
     "If you opened the toolbar with the speaker, press ▶. Check the device volume and output device, and the language and voice under the toolbar’s gear. If a PDF says “There is no readable text on this page.”, move to a page where text can be selected and play from there. To hear text inside scans or comic images, open a copy that contains text information."
    ]
   },
   {
    "title": "If reading stops or starts somewhere else",
    "paragraphs": [
     "Book HTML that loads several chapters in turn stops at the end of the currently loaded text. Open the next chapter and press ▶ to keep listening. Reading a PDF continues with the text on the next page. If you’re told the position of the selected text has changed, select the content you want again and press Read aloud."
    ]
   },
   {
    "title": "If you want to listen offline",
    "paragraphs": [
     "Check in your device’s speech settings whether a voice that works offline is installed. The voices available and their quality vary by device and browser. The app doesn’t create and provide speech engines that aren’t there."
    ]
   }
  ],
  "related": [
   "speech",
   "offline",
   "privacy"
  ]
 }
];
