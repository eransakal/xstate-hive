#!/bin/sh

git diff-index --quiet HEAD -- && git ls-files --exclude-standard --others --error
if [ $? -ne 0 ]; then
  echo "Error: Uncommitted changes found, including untracked files. Please commit or stash your changes before publishing."
  exit 1
fi
