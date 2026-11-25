[한국어](README.md)

# LibreMemo

[Open LibreMemo](https://seionwon.github.io/LibreMemo/) · [Feature change, verification and publication history](docs/기능%20추가%20history.md)

LibreMemo is a PWA for reading documents, e-books, images and subtitles in one Library and leaving annotations and bookmarks on them. It never edits the original text; it keeps a copy of the original, the reading view, annotations and settings on your device. You can also watch a YouTube video alongside its subtitles and take notes. The app needs no login, no API key and no separate local server. Online features you choose to use, such as web/AI search, YouTube and Device sync, connect to external services.

The previous name was HTMLMemo. The current repository is `seionwon/LibreMemo`, and the published address is the LibreMemo address above. Compatibility identifiers in the data folder, such as `HTMLMemo-library.json` and `HTMLMemo-data`, are kept as they are. Do not rename the management files yourself. The [rename and compatibility guide](docs/rename-to-librememo.en.md) is kept separately.

## Getting started

**On desktop and Android, use Google Chrome, which supports choosing and writing to a dedicated storage folder.** On iPhone and iPad (Safari, Add to Home Screen apps, Chrome for iOS), instead of choosing an external folder, the app automatically connects dedicated in-app storage on the device (OPFS) to save your Library, annotations and settings.

1. Open the official app address. Checking for a new version and deciding to install or cancel happen before the storage folder check.
2. In **Create new storage folder**, enter the name you want (LibreMemo by default) and choose Documents or another parent location. For a folder you already used or moved over, choose the folder itself with **Connect existing storage folder**.
3. Allow writing to the folder and wait until the first save finishes. You can close the prompt with Cancel, Close, Esc or Back, and start again with **Connect storage folder** on the waiting screen.
4. Start from **Library → Import files / Paste text / Paste image / YouTube**. You can also drag files onto the app, or practice with the example document in an empty Library.
5. If you want a home screen icon, choose **Settings → Launch and app delivery → Install app**. Once offline preparation is done, you can read and annotate saved documents without the internet. Video playback, web/AI search and sync need the internet, and some TTS voices also need a connection.

The app checks the permission of the existing folder automatically. If the permission is still valid, it connects right away; if you need to allow it again, it shows the remembered folder with **Continue / Cancel**. Continue requests permission for the existing folder; it does not create a new folder. The app cannot skip a permission that Chrome asks for again, and installing the PWA alone does not grant permanent permission.

## Supported formats (read-only)

All formats use the same document tabs, reading toolbar, floating annotation toolbar and contents/search/annotations/bookmarks sidebar. Which features are available depends on the file's content. Image-only material supports pen, shapes, notes and bookmarks, but text selection, full-text search and TTS need text information. OCR is not included.

| Type | Extensions |
|---|---|
| Web documents | HTML, HTM, MHTML, MHT |
| PDF | PDF |
| E-books and comics | EPUB, EPUB3, MOBI, AZW, AZW3(KF8), FB2, FBZ, FB2.ZIP, CBZ |
| Scanned documents | DJVU, DJV |
| Hangul (HWP) | HWP, HWPX, HML |
| Word and OpenDocument documents | DOCX, ODT, OTT |
| Spreadsheets and tables | XLSX, XLSM, XLS, CSV, TSV, ODS, OTS |
| Slides | PPTX, ODP, OTP |
| Markdown, text and data | MD, MARKDOWN, TXT, JSON |
| Images and screenshots | PNG, APNG, JPG, JPEG, JPE, JFIF, WebP, AVIF, GIF, BMP, SVG |
| Subtitles | SRT, VTT, SMI, SAMI, ASS, SSA |
| Archive with original and annotations | LIBREMEMO |

- **Hangul and Office:** The original and the reading view are kept separately. HWP, HWPX and HML get per-page contents; Word navigates by headings, spreadsheets by sheet, and slides by number and title. Cells show the saved calculation results; formula recalculation, macros and slide animations are not run. Advanced objects, special fonts and complex layouts may look different from the original app. Fonts missing from Hangul documents are replaced with the bundled Noto Sans KR and Noto Serif KR fonts. Import DOC and PPT files as DOCX and PPTX copies.
- **E-books:** Included contents, links between chapters, images and styles are read. DRM-protected or password-protected e-books and KFX are not supported. CBZ shows images in file name order, taking numbers into account. Scripts, video and audio in books are not run.
- **DjVu:** Single-page files and bundled multi-page files are read, and per-page contents are created. If text information is present, you can use selection, search and TTS. The indirect format split into multiple files must first be saved as a single file. For books with many pages, the resolution of the reading images is adjusted, while the original is kept unchanged.
- **Images:** Annotations are shown on a reading copy separate from the original. Animated images use the first frame. Scripts and external resources in SVG are not loaded. HEIC, TIFF, PSD and RAW are not supported.
- **Subtitles:** Times, lines and speakers are converted into a reading view, and 5-minute sections that contain lines are shown as contents. UTF-8, UTF-16 and EUC-KR/CP949 are handled. Styles, motion, karaoke effects and time editing are not provided. A regular file import creates a standalone subtitle document; to connect a video, use **YouTube**.

Original Office, Hangul, e-book, DjVu, image and subtitle files are limited to 2 GiB. Limits on decompressed size, reading view, page/object count, text length, processing time, image pixels and so on are checked separately. Even within the limits, you may need to import in parts depending on your device's memory. Check the scope for each format in **Settings → Help**. Imports that fail with password, corruption or size errors are not added to the Library.

## Import, Library and tabs

- **Duplicate imports:** Duplicates are detected by comparing the original content, not just the file name. If it is the same document, you choose **Cancel / Open as new / Go to existing annotation file**. Open as new starts a fresh copy with no annotations or bookmarks. Received archive files and PDF share files are imported as documents with their included annotations, and opening the identical share file again shows the duplicate choice.
- **Paste text:** Paste plain text and Markdown into the same input box. Headings, lists, tables, quotes, code blocks and so on are displayed, and if you don't set a title, the first Markdown heading is used. The maximum is 200,000 characters. External image addresses are kept as links, while embedded image data is preserved. You can also open it with `Ctrl/⌘ Shift V` outside an input box.
- **Screenshots:** Press `Ctrl/⌘ V` outside an input box to open a copied image as a new document. You can also use the drop area or the clipboard button in **Paste image**. On Mac use `Control+Shift+⌘+4`, on Windows use `Win+Shift+S`, and on phones import the saved screenshot file.
- **Library:** Cards and lists show the original file name, annotation and bookmark counts, and date and time. The first PDF page, images, screenshots, pictures in documents and e-books, SVG diagrams and video thumbnails are used, and if there is no picture, part of the text is shown as a preview. Cards are generated one at a time, starting with the ones on screen, cached on this device and reused offline. Originals, annotations, modification dates and annotation history are not changed. Search by title, file name, address or folder path, and sort by saved date, modified date or title.
- **Folders:** The connected dedicated data folder is the top level. New folder, rename, move to folder, delete empty folder and drag-and-drop moves are supported. Starring documents or folders inside a folder pins them to the top of that folder, most recently starred first. Imported files and pasted material are saved to the current Library folder. Files and folders added outside the app are not registered automatically.
- **Document tabs:** As you open more documents, tabs get narrower, and beyond the limit they scroll horizontally. `×` saves and closes only the tab; the document stays. The view of a large document you haven't looked at for a while may be released from memory after saving, and clicking its tab again restores it to where you were reading.

## Common reading and annotation tools

HTML without its own toolbar and other formats get the common toolbar. It offers **☰ Open contents, ↶ Back, previous/next section, TTS, A+ · A · A−, font, display mode, zoom level and View settings**. Features that don't apply are disabled or hidden. `A` is the default text size and `%` is the zoom level. Fixed-layout documents zoom pages and annotations together. PDFs are displayed to match the zoom and the device pixel ratio; OCR and form editing are not provided.

The sidebar is on the left, and you can drag its edge to shrink it down to 8px. It switches between **Contents, Search, Annotations and Bookmarks**, and the other views keep working even for material without contents. The contents start collapsed. Clicking an entry's text moves to it in the document and expands or collapses its children; the triangle only expands or collapses. Clicking the same view button again collapses the expanded list. To rename a contents entry, click the pencil button **Edit contents names** in the sidebar and select an entry. Press Enter to save and Esc to cancel. The new name is saved as separate information about the document. On narrow phone screens, touching the document closes the overlaid sidebar; on wide tablets and desktops it stays open.

In the sidebar's **Annotations → Search my annotations**, you can find note text, highlighted sentences, chapter and section names, and YouTube moment notes, and click a result to jump to it. In **Pen & colors → Highlight color names**, if you give a color a name such as "Key point" or "Question", text and areas you marked with that color earlier can also be gathered under that name.

**Search whole book** also searches chapters that haven't been loaded yet, in books that provide this, and takes you to results shown with context. **Find in loaded part** searches the currently loaded content, and the arrows stop at the first and last result. `×` clears the search term and the highlights. Search data is reused. Create bookmarks with **Bookmarks → Save current position**; the annotation and bookmark lists are shown expanded or collapsed by the part, chapter and section that contain records.

The floating toolbar offers select, pen, highlighter, underline, note, rectangle, eraser, undo and more. Press a button twice to choose text/area, note box/free text, or outline/fill mode. Circles and ellipses also follow the rectangle's fill choice. The three rows of **Pen & colors** are pen color/width, highlighter color, and opacity/display time. In **Text box styles**, choose a note's text, background, border and preset, and save it as your own style. You can also apply it to a selected note. The temporary pen disappears after the set time and is not saved.

Drag annotations with the select tool to move them. Note boxes and free text can be dragged even while another tool is selected. On phones, drag with a finger or stylus for text highlights and underlines, and scroll with two fingers. Swipe the toolbar sideways to find hidden tools, and move it by its handle. Move **Pen & colors** by dragging its title, and scroll inside the window.

Double-click or double-tap an empty spot in the document, or press `F`, to enter full screen. The sidebar closes, while the top, reading and annotation toolbars stay. Double-clicking a word or the sidebar does not enter full screen. When you leave full screen, the previous sidebar state is restored. On YouTube, `F` is video full screen.

## View settings and e-book reading

In **View settings (▤) → Saved settings**, save layout, text size, font and display mode under a name. Depending on the document format, it shows whether a setting applies fully or partly, and applies only the items that are possible. Search, sort, favorites, duplicate, rename, overwrite, delete, undo the last apply and per-format defaults are supported. HTML with its own toolbar uses its original reading settings, so applying them may be limited.

E-books with reflowable text also get **View / Navigate** tabs. Adjust margins, text width, line and paragraph spacing, alignment, letter spacing, indentation and weight, and choose **Continuous scroll / Paged**. Page numbers depend on the screen and text size. Numeric and superscript footnotes are read as cards. After **Navigate → Start auto-scroll**, use the bar at the bottom to pause, continue, choose one of 9 speeds, or stop. Scrolling yourself, tapping the text, page-turn keys or switching tabs pause it briefly, and it ends at the end of the book. This e-book layout is not applied to fixed-layout EPUB, CBZ or PDF.

## TTS, AI search and web pages

- **TTS:** The speaker button only opens the player. Press play to start reading; if you moved to another position after pausing, playback starts from the new position. **Read aloud** in the selection menu immediately reads the selected text with the same player and settings. Voices are provided by your device and browser, and online voices may use the internet.
- **AI search:** In **Settings → AI search → Manage**, register and check the services and addresses you want to use. Choose a service from **AI search** on selected text. The first 2,000 characters go into `{text}` in the address; for longer text or addresses without `{text}`, the app tries to copy the whole text and asks you to paste it. If copying fails, copy it yourself. The service's login and terms apply, and answers are not saved to LibreMemo automatically.
- **Web browsing:** Addresses, search terms and Web search from the selection menu open in a regular Chrome tab. Tabs opened by the app are reused when possible, but the app does not automatically read the address, content, login or clipboard of other tabs.
- **Saving web pages:** If the page save menu has **Webpage, Single File (MHTML)**, save in that format and import it. A single HTML file you already have also works. For saves split into HTML and a separate resource folder, importing only the HTML may leave out images. If you only need the text, use Paste text.
- **Direct import:** **Sent address · Direct import** in an external web tab reads only CORS-allowed HTML at that address. It does not capture screens you later navigated to in Chrome; for search results, logins and dynamic pages, use file or text import. For compressed books, import the original HTML that contains the full content.

## YouTube videos and subtitles

In **Library → YouTube**, choose a video or playlist address and a subtitle file. You can start without subtitles, or attach them later with **Attach subtitles / Replace subtitles** in the video bar. SRT, VTT, SMI, SAMI, ASS, SSA and ZIP files of these subtitles are supported. Each subtitle file must be 64 MiB or less. The app does not download or translate subtitles itself. How to get subtitles includes optional guidance for an external tool on Mac Chrome, and no extension is needed when you use subtitles you already have.

- A single tap in the middle of the video plays/pauses, and the left and right edges skip 5, 10 or 15 seconds. Double-tapping the video or pressing `F` is video full screen. The YouTube progress bar and menus at the bottom work as usual.
- **Follow** keeps the current line in the middle of the subtitle area, and pauses briefly when you scroll by hand. With the select tool, clicking the time next to a line plays from that scene. Writing an annotation alone does not start a paused video. **Bookmark** saves the current time and part of the line.
- Drag the handle below the video bar to resize it, and double-tap it to return to the default size. It grows only as far as the top isn't cut off and at least one subtitle line remains below. There are no separate size −/+ buttons.
- For **Contents**, add two or more chapters like `0:00 Intro` from the video description. Without chapters, contents are built from times and the first line in each section. Clearing and saving returns to time-based contents.
- A playlist creates a folder and a document for each video, matched by the video ID or title in the subtitle file names. Private or restricted videos, or an entire large playlist, may fail to import. Entering an existing address again attaches subtitles instead of creating a new document.
- When subtitles are replaced, annotations and bookmarks are moved to the same lines, and items that can't be found stay in the list. For documents that had records, a copy from before the replacement is left in the Trash. Press `?` to see the video shortcuts.

Video information, thumbnails, imported subtitles and annotations are kept, but **the video file itself is not saved**. Subtitles and notes can be read offline, but playback needs the internet. If external playback is restricted, use **Open on YouTube**. When you open it again, it is ready near the last position, and you start playback yourself.

## Export and moving to a new edition

Open a document and choose from **Export** at the top. The original and previously exported files are not updated automatically.

| Format | Contents and use |
|---|---|
| Archive with original (.librememo) | Default choice. Delivers the original, current annotations, bookmarks, reading position and any needed reading view together. The recipient opens it with Import files in LibreMemo and continues working. |
| Reading copy HTML (.html) | Delivers the current reading view with annotations and bookmarks. It does not replace the original editing structure of Office and similar files. For PDFs, it bundles the original, annotation information and an offline converter, so it can show the annotated PDF or open and save it in the device's PDF viewer. |
| Annotated PDF (.pdf) | Used for documents whose original is a PDF. Keeps the original pages, links and contents and adds standard annotations and bookmarks. To continue exactly where you left off in LibreMemo, use the archive file. |

`.librememo` is a regular ZIP structure, and the original is in `original/`. If the original bytes are missing, a notice says that a reading copy is included instead. Corruption, paths, size, version and annotation information are checked on import. If annotations cannot be placed accurately in a PDF, or the PDF has signature fields, an error is shown along with a suggestion to use the archive file. Cancelling or failing never changes the original.

**Copy excerpt notes** copies the document title, chapter and section or PDF page number, highlighted text and notes as Markdown. YouTube moments get time links. Without clipboard permission, you can copy the excerpt shown in the window yourself.

Exports do not include the whole Library, the Trash, app settings or the full annotation history. For a full backup, copy the dedicated folder. Sending only the app URL does not deliver your material. To send the latest annotations, export again, and check any personal notes that are included.

Choose a new edition file from **Document tools (⋯) → Move annotations/bookmarks to a new edition** or from the document menu in the Library. Annotations and bookmarks are found by the text and the surrounding context, and renamed contents entries are also moved where possible. The result separates exact positions, start of the matching chapter, and items that were not found. **Open new edition** creates a new document, and the previous document and its records remain.

## Autosave, history, Trash and backup

Imported originals are copied to the dedicated folder, and annotations, bookmarks and reading position are autosaved separately. The original is not rewritten every time you add an annotation. When changes are pending, a dot appears on the document tab, and the status bar at the bottom does not pop up for every ordinary save. Failures, retries and online status changes are announced. Before backing up, confirm that the folder save is complete in **Settings → Data folder**.

**Annotation history** shows only the selected document. When there are changes, it saves a snapshot every 5 minutes or 1 minute after you stop typing, whichever comes first, and when you close the document. Identical content, or scrolling and zooming alone, does not add history. Find entries by year, month and day, in groups of 50, to restore annotations and bookmarks; the text and reading position are kept. The state just before a restore is also kept.

Deleting from the Library moves items to the **Trash**. Text, annotations, bookmarks and history are kept and are not deleted automatically. Restoring opens the original folder (or the top level if it no longer exists) and shows the document. **Delete permanently / Empty Trash** erase irreversibly after confirmation, and never delete the external original file you imported from.

To keep the whole Library, settings, Trash and history, or move them to a new device, copy **the entire dedicated folder**. On the new device, choose that folder with **Connect existing storage folder**. Copying only some HTML files from the folder may leave out annotations and history. Even without browser data, the folder can be restored as long as it remains, but you also need a separate copy in case the folder itself is deleted or the device fails. If you lose every restorable copy, there is no server-side copy to recover from.

App settings are kept in the dedicated folder too. **Use a previous settings JSON file (optional)** in Settings is for importing an old JSON or keeping settings separately; you don't need to save it separately in normal use. The JSON is not a full backup of documents and annotations.

## Device sync

In **Settings → Device sync → Connect**, use **Let the other device connect to this one → Start connection** on one device, and **Connect to the other device → Scan QR / Enter code** on the other. Open both with the latest version and keep both screens open until it finishes.

- **Whole Library** syncs documents, annotations, bookmarks, reading positions, annotation history and relative folder structure in both directions, excluding the Trash. **Share current document only** sends the open document. The dedicated folder names can differ between devices.
- If the same original content is already there, the transfer is skipped. Files are not considered the same based only on file name and size. Originals verified during the same session are not re-hashed just because annotations changed, but the first check, connection, history and folder save time after a restart still apply.
- If annotations or bookmarks for the same original and reading view differ, the device that receives first chooses **Merge and keep both / Send this device's to the other device / Use the other device's on this device / Do nothing**. The choice is made once and applied on both sides. Merging can bring back items left on one side, so to match deletions as well, choose to use that device's version. The state before the change is kept in history.
- If the original or other document information conflicts, choose **Keep this device / Use the other device / Keep both**. Closing the window stops changes that haven't been applied yet.
- **Also sync app settings** is shown only for **Whole Library + Let the other device connect to this one**. It is on by default, and each device remembers its last choice. If the settings actually differ, choose which side to use once and it is applied to both. Share current document only does not change settings.
- The Trash, deleted/restored state, folder connections and permissions stay per device. Documents in the Trash are not automatically restored from the other device's data; restore them first if you want to sync them.

Only the connection information is encrypted and relayed temporarily, and originals are sent in pieces over an encrypted WebRTC connection. There is no permanent storage server for user data. In one transfer, originals can total up to 2 GiB, and list, annotation and history information up to 16 MiB. If you exceed this, split it up with Share current document. Progress shows original verification → annotation comparison → app save → dedicated folder update; close only after both sides show **Transfer complete**. For connection limits, QR or permission errors, see sync troubleshooting in Help. In normal use, the app never connects to other devices automatically.

## Help and updates

**Settings → Help** has a step-by-step walkthrough, feature guides, data storage and recovery, and troubleshooting. Titles and body text are searched together, and you can also find YouTube, renaming contents entries, text box styles, View settings and AI search. Help and its search are included in the app assets and work offline.

In **Step-by-step walkthrough → Try the new features**, you can practice annotation search, gathering by highlight color names and copying Markdown excerpt notes with two example sentences. The same guide also covers repeating a YouTube scene for 10 seconds, text size for the document and sidebar, editing contents names, leaving dots and short lines with the pen, and reconnecting the storage folder.

Each time the app starts, it checks for a new version and, when it is ready, asks **Install / Cancel**. This is the same for tabs and the installed PWA, and the app never force-reloads while you are using it. Before installing, it finishes any needed saves and keeps your data. If an error occurs, the existing screen and data are kept and you can retry or cancel. Do not clear site data, the app or the storage folder because of update problems. Check the version in **Settings → About**.

## Document engines and licenses

LibreMemo's own code is [MIT](LICENSE). Included third-party code, engines, fonts and samples are under their own original licenses and sources, and the MIT notice does not replace them. In **Settings → About**, you can open the notices for the app, documents, PDF export, e-books, DjVu, Hangul and fonts.

- Office reuses the parser, renderer, ODF conversion and archive check code from the pinned [GenOffice upstream](vendor-src/genoffice/UPSTREAM.json). The desktop UI, AI and editing features are not included, and spreadsheets use the browser build of SheetJS CE. [Integration](packages/office) · [Notices](public/vendor/office/THIRD-PARTY-NOTICES.txt)
- Hangul uses rhwp 0.8.7 WASM. [Notices](public/vendor/office/rhwp/THIRD-PARTY-NOTICES.txt) · [Bundled fallback fonts](vendor-src/fonts/README.md)
- E-books use the pinned [foliate-js parser](vendor-src/foliate-js/UPSTREAM.json). The Foliate app itself and its demo UI are not included. [Integration](packages/ebook) · [Notices](public/vendor/ebook/THIRD-PARTY-NOTICES.txt)
- DjVu uses djvu-rs WASM, PDF reading uses PDF.js, and annotated PDF writing uses a separate PDF export worker. [DjVu notices](public/vendor/djvu/THIRD_PARTY_NOTICES) · [PDF export notices](public/vendor/pdf-export/THIRD-PARTY-NOTICES.txt)

Books that need scripts in local HTML open in an isolated reading environment. It is separated from app storage and folder permissions, and MHTML and converted documents use a static reading view. Not every external resource or browser API the original requires is reproduced. Check missing resources in **Document tools → Document info**.

## GitHub Pages automatic deployment · seionwon/LibreMemo

The current origin is `https://seionwon@github.com/seionwon/LibreMemo.git`, the deployment branch is `main`, and the Pages source is GitHub Actions. Only the static app **dist/** is published, with no separate server. Personal documents, settings, attachments and development dependencies are not put into the public build.

`.github/workflows/deploy-pages.yml` runs `npm ci`, `npm test`, `npm run check` and `npm run build` after a push to main, and publishes Pages. It then checks the content of the public files and selected real Chrome integration checks, and keeps the evidence. The scope of this public check differs from the full browser test. A local build or a push alone is not recorded as a completed publication. Actual commit, Actions and online check results are recorded in the [feature history](docs/기능%20추가%20history.md). A Pages Source setting that already works does not need to be changed again.

## GitHub publishing authentication

Using the app and deploying with Actions need no API key entered into the app. Actions uses the GITHUB_TOKEN provided by GitHub and does not read user documents or settings. Development tools that push the project source to GitHub must be signed in with an account that has write access to the repository.

Prepare a fine-grained token only if you upload the source and workflow through the API.

1. Open **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token** from your profile at the top right of GitHub.
2. Select **Resource owner: seionwon** and **Repository access → Only select repositories → LibreMemo**.
3. Grant **Repository permissions → Contents: Read and write** and **Workflows: Read and write**. The Workflows permission is also needed because workflow files are uploaded.
4. Use the token in your development tool's credential store. Do not put it in the app, the settings JSON, the repository or a URL. [GitHub's official guide to creating tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).

The Pages publishing source is set once in the Settings screen above. The app does not get features for storing GitHub tokens or uploading through the API.

The current development server uses the authentication of the seionwon account configured for the repository. Do not conclude that publishing is impossible based only on the global active account in `gh auth status` or a connection error in a previous environment. After committing the related source, verification and history, run the existing Actions deployment with `git push origin main`, and confirm that the commit was published successfully and that the online files match. Recheck API connection errors and localhost `listen EPERM` separately in the current environment. The working guidelines for this project are in [AGENTS.md](AGENTS.md).

## Development and verification

Run with Node.js 22 or later.

```sh
npm ci
npm run check
npm test
npm run build
```

The localhost server from `npm run dev` and the single-file `public/LibreMemo.html` are for development review. Users use the official GitHub Pages URL and need no local server. The document engines are rebuilt with `build:office`, `build:rhwp`, `build:foliate`, `build:djvu` and `build:pdf-export`, and are also prepared by the regular build.

`npm run test:browser` runs the full browser integration test with a temporary Chrome profile, in an environment where it can run. In the macOS agent sandbox, desktop Chrome is not launched directly; use the `codememo-browser request.json` verification service or CI instead. Checks that could not be run are not recorded as passed. Follow [AGENTS.md](AGENTS.md) for the detailed publication and verification rules.

In **Settings → UI text size → Adjust size**, adjust the text size of the whole screen and 17 areas from 60% to 200% in 1% steps. You can set different values for the sidebar's Contents, Search, Annotations and Bookmarks, and pressing ↻ on an individual item makes it follow the parent setting. The document text is adjusted with A+ · A− in the reading toolbar.

The app's default design is the Library desk/slate theme. In **Settings → Design theme**, you can switch lightly, even offline and with no extra download, between 80 built-in design themes in 10 categories (160 light and dark palettes), with keyword search, favorite (★) pinning, and custom combinations along 5 axes: corners, 14 procedural background textures, font, 10 outline frames and accent color. The CSS-first `@theme` in `public/design.tailwind.css` and the actual HTML and JavaScript are compiled locally with **Tailwind CSS 4.3.3** into `public/styles.css`, and no runtime CDN is used. Design choices and the catalog are not regenerated during ordinary work.

### YouTube moment notes

In Library → YouTube → **Moment note**, you can save just a link, a time and a note. Time links are read automatically, and the same video in the same folder is gathered into the existing document. If there is a note within 3 seconds before or after, the closest note opens so you can add to it or edit it; otherwise a new note is added. During playback, the **Moment note** button takes the current time. In the time-ordered list, choose ⋯ → **Repeat this scene for 10 seconds** on a note to watch again from the saved moment. Press **Stop repeat** in the video bar or the same menu. Editing the time and content, and deleting, are also in the note's ⋯ menu. Sidebar annotations, autosave, history, sync and export all work with it. **Annotate subtitles** uses the existing subtitle import, highlighter and bookmark features. Videos are not downloaded, and playback needs the internet.
