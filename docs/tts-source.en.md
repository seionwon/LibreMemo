[한국어](tts-source.md)

# MemoSuite TTS port sources

- UI: `packages/shared/src/components/MemoReadAloud.tsx`
- Standalone HTML browser engine: `packages/shared/src/components/readAloudRuntime.ts`
- Korean strings: `packages/shared/src/i18n/locales/ko.ts`
- Source date: 2026-10-14

The style declarations, button order and icons of the toolbar and panel come from MemoReadAloud. The TTS button does not start playback; it only opens and closes the toolbar. Sentence splitting, math pronunciation, voice filters, sentence navigation, and pause/resume are based on the standalone HTML runtime. They were adjusted for LibreMemo's iframe zoom and scroll coordinates, document lifetime, full screen, file distribution structure and resume position handling. On GitHub Pages, which has no server API, the browser's voices are used, and MemoSuite's server, Piper or cloned voices are not shown as available.

Assuming imported HTML has no TTS feature of its own, LibreMemo provides the TTS button at the top and the read-aloud toolbar. There is no compatibility code that detects TTS buttons inside a book or intercepts existing playback events. Regular reading of the text opened with the top TTS button starts only when you press ▶ in the toolbar, and HTML exports do not include the app's read button or voice features.

Read aloud in the text selection menu also uses the same read-aloud player and the same voice, language and speed settings. Pressing Read aloud in the selection menu opens the player in selection mode and **starts playing right away**. If the player is already open, the same player stops the previous playback and reads the new selection. It reads only between the start and end of the selection and then stops, and sentence navigation, pause, retry and stop all stay within that range. Selecting text alone does not start playback. Scrolling or selecting other text does not widen the range automatically; to set a new range, use Read aloud in the selection menu again. Closing the player and reopening it with the top speaker returns to regular reading of the text. If the selected text or chapter changes, it does not read different content in its place and instead asks you to select again. Without separate speech code, the shared engine is called immediately inside the user's click, and voice errors or a missing start response are shown so you can retry the same range with ▶.

LibreMemo's top entry button uses the existing speaker icon and sits directly to the left of the book's A− button. The read-aloud toolbar was adjusted to a compact form 20px tall, while the original playback control order, settings panel and voice engine are kept.

The player and settings window UI styles are compiled in `public/design.tailwind.css` together with the app's shared theme and served as `public/styles.css`. No separate player CSS is injected from JavaScript. The language and voice lists and the buttons use the blue-gray accent of the light and dark themes, and sentence highlighting is managed in the document's isolated display layer.

If you scroll or move to another chapter after pausing, the next ▶ starts from the first line visible at the top of the new screen. The space for the last line at the bottom of the screen is left empty for the TTS toolbar. While reading up to the line just before the last one on screen, the scroll position you set is respected and the screen is not moved by force; it follows along once the line before the last has been read and the last line at the bottom is reached. Clicking or selecting a sentence while paused does not start playback; it sets that sentence as the next starting point, and if you scroll again after that, the current screen position takes priority. If the position and text are unchanged, the paused sentence is read again. On resume, the reading index for the currently loaded text is prepared anew, and text or DOM positions from a previous chapter are not reused. These adjustments apply only inside LibreMemo and do not change the port sources or imported HTML files.

Playback control checks the running sentence and utterance together, and ignores duplicate or late end events and errors from previous sentences. Before cancelling playback, the current utterance and start detection are invalidated, and ▶ first clears any pause left in the browser's speech engine. That `cancel()` and `speak()` do not change the engine's paused state follows the [Web Speech API specification](https://webaudio.github.io/web-speech-api/#tts-methods). The actual start, end and errors of utterances are reflected, and if an error occurs or there is no start response for 8 seconds, a paused state and a notice are shown so you can retry from the same sentence. Sentences are never skipped automatically and errors are not retried repeatedly. Detection timers are cleared on close, stop and document switch, and the UI, voice and speed choices and the original files are not changed.

Source SHA256:
- `MemoReadAloud.tsx`: `537c4f3aa39cafaef21a021500fa3c36532f1bec22f403559ed4ef3bec98036c`
- `readAloudRuntime.ts`: `e9f845ac2bb4296e4c9f920956c8af4e0ecc59f2246666b040b9511653a60406`
