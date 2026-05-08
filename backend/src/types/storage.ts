/** Controls how a presigned download URL instructs the browser to handle the file. */
export enum DocumentDownloadMode {
  /** Triggers a file download via `Content-Disposition: attachment`. */
  DOWNLOAD = 'download',
  /** Opens the file inline in the browser via `Content-Disposition: inline`. */
  VIEW = 'view',
}
