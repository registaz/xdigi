#!/usr/bin/env bash
#
# Copies (or transfers) this project for manual deployment, excluding
# installation/build artifacts and local secrets (mirrors .gitignore):
#   - node_modules/, dist/, build/, coverage/, backend/generated/
#   - .env files (real secrets) — .env.example templates ARE copied
#   - .git/, *.log, .DS_Store
#
# Usage:
#   ./copy-project.sh /path/to/destination-directory        # local copy (rsync)
#   ./copy-project.sh --archive /path/to/output.tar.gz       # local archive (tar.gz)
#   ./copy-project.sh --remote user@host:/path/on/remote     # rsync over SSH (incremental, resumable)
#   ./copy-project.sh --scp user@host:/path/on/remote        # archive + scp/sftp upload as a single file
#
set -euo pipefail

SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

EXCLUDES=(
  --exclude='.git/'
  --exclude='node_modules/'
  --exclude='dist/'
  --exclude='build/'
  --exclude='coverage/'
  --exclude='backend/generated/'
  --exclude='.env'
  --exclude='*.log'
  --exclude='.DS_Store'
)

usage() {
  echo "Usage:"
  echo "  $0 <destination-directory>          # copy files directly (rsync, local)"
  echo "  $0 --archive <output.tar.gz>         # create a single local archive file"
  echo "  $0 --remote <user@host:/path>        # rsync over SSH to a remote server"
  echo "  $0 --scp <user@host:/path>           # archive, then upload via scp (SFTP subsystem)"
  exit 1
}

if [[ $# -lt 1 ]]; then
  usage
fi

make_archive() {
  local out_file="$1"
  mkdir -p "$(dirname "$out_file")"
  tar -czf "$out_file" \
    -C "$SRC_DIR" \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='build' \
    --exclude='coverage' \
    --exclude='backend/generated' \
    --exclude='.env' \
    --exclude='*.log' \
    --exclude='.DS_Store' \
    .
}

case "$1" in
  --archive)
    OUT_FILE="${2:?Provide an output archive path, e.g. ./copy-project.sh --archive /tmp/xdigi.tar.gz}"
    make_archive "$OUT_FILE"
    echo "Created archive: $OUT_FILE"
    echo "On the destination machine: tar -xzf \"$(basename "$OUT_FILE")\" -C <destination-directory>"
    ;;

  --remote)
    REMOTE="${2:?Provide a remote target, e.g. ./copy-project.sh --remote user@host:/opt/xdigi}"
    # rsync over ssh: same excludes, incremental/resumable, and (unlike plain
    # sftp) skips files that already match on the remote end.
    rsync -avz -e ssh "${EXCLUDES[@]}" "$SRC_DIR"/ "$REMOTE"/
    echo "Synced project to: $REMOTE"
    ;;

  --scp)
    REMOTE="${2:?Provide a remote target, e.g. ./copy-project.sh --scp user@host:/opt/xdigi}"
    TMP_ARCHIVE="$(mktemp -t xdigi-XXXXXX.tar.gz)"
    trap 'rm -f "$TMP_ARCHIVE"' EXIT
    make_archive "$TMP_ARCHIVE"
    # scp uses the SFTP/SSH subsystem under the hood; simplest way to move a
    # single file to a server that doesn't have rsync installed.
    scp "$TMP_ARCHIVE" "${REMOTE%/}/xdigi.tar.gz"
    echo "Uploaded archive to: ${REMOTE%/}/xdigi.tar.gz"
    echo "On the remote machine: tar -xzf xdigi.tar.gz"
    ;;

  *)
    DEST_DIR="$1"
    mkdir -p "$DEST_DIR"
    rsync -av "${EXCLUDES[@]}" "$SRC_DIR"/ "$DEST_DIR"/
    echo "Copied project to: $DEST_DIR"
    ;;
esac


echo
echo "Next steps on the destination machine:"
echo "  cd backend  && cp .env.example .env && npm install"
echo "  cd frontend && cp .env.example .env && npm install"
