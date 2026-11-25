[한국어](rename-to-librememo.md)

# Renaming to LibreMemo and moving the GitHub repository

HTMLMemo's new product name is **LibreMemo**. The name changes in the app title, PWA install name, Settings, Help, suggested export names, design mockups and the Chrome connection. Features and document data continue in the same app.

## When is the repository renamed?

The repository is renamed **after the renamed version has first been published and checked in the existing `seionwon/HTMLMemo` repository**. The old address is `https://seionwon.github.io/HTMLMemo/`, and the address after the change is `https://seionwon.github.io/LibreMemo/`. Do not announce that the new address works before the switch.

1. In the existing repository, change **Settings → General → Repository name** to **LibreMemo** and click **Rename**.
2. In the renamed repository, run **Actions → Deploy LibreMemo to GitHub Pages → Run workflow** on **main**. The switch is complete only when **build · deploy · verify** all succeed. The publication check uses the actual Pages output address from Actions, so the repository name does not need to be hard-coded again.
3. Update the local remote address. The actual CodeMemo project folder is tied to the conversation history, so leave it as it is.

   ```sh
   git -C /Users/ls/MemoSuite/code-projects/u1/CodeMemo/HTMLMemo remote set-url origin https://seionwon@github.com/seionwon/LibreMemo.git
   ```

4. Open the new address in Chrome and check the Library, annotations, Trash and Settings. Also change bookmarks and addresses you shared with others to the new address. If the installed icon keeps opening the old address, update the install information from the new address or reinstall the icon. **There is no need to clear Chrome site data or the dedicated storage folder.**

GitHub redirects the repository's Git address, but does not guarantee a redirect for the project Pages address. See [GitHub's official guide to renaming a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository). If you create a new repository with the old name, the Git address redirect also stops working.

## Why existing data and names remain

- Both Pages addresses share the same origin, `https://seionwon.github.io`. On the same device and the same Chrome profile, the existing IndexedDB, local settings and folder connection information keep being used. This does not mean data moves automatically to another device or another browser profile.
- Database names such as `HTMLMemo-v1`, `htmlmemo-*` settings keys, HTML attributes on annotations, the PDF share file marker, the storage folder's management file names and the sync protocol are compatibility identifiers. They are kept for compatibility with existing documents, backups and other devices. Do not rename them one by one in a file manager.
- The default suggested name for a new storage folder is **LibreMemo**. You can keep connecting an existing **HTMLMemo** folder or a folder with any other name you gave it. The project source folder name is not forcibly moved in this switch either.
- The PWA install identifier is fixed to `/HTMLMemo/`, which is the old `./` resolved against the old public address, so renaming the app alone does not create a new app identifier. The app name shown on the icon is **LibreMemo**. When the browser updates the start address of an existing installation needs to be checked separately.
- The address shared with **Copy URL** in the app and the folder guide text follow whichever address, old or new, was actually opened. CodeMemo also switches its launch link to the new address after checking the LibreMemo manifest at the new address, and keeps the old address before publication, offline or on failure.

## Backup and checks

Check that the dedicated folder status is **Folder autosave complete**, and if you have important material, copy the whole folder and keep it. The rename does not require re-importing documents or resetting data. Exporting a single document as HTML is not the same as backing up the whole Library, Trash, settings and history.
