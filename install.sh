#!/bin/bash

# Configuration file
CONFIG_FILE="/cityflow_runner/workflow/setup.json"
conda activate base

# Check if the configuration file exists
if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "Configuration file $CONFIG_FILE not found!"
  exit 1
fi

# Parse the configuration file
CONDA_PACKAGES=$(jq -r '.conda // empty | .[]' "$CONFIG_FILE")
NPM_PACKAGES=$(jq -r '.npm // empty | .[]' "$CONFIG_FILE")
PIP_PACKAGES=$(jq -r '.pip // empty | .[]' "$CONFIG_FILE")

# Install conda packages
if [[ -n "$CONDA_PACKAGES" ]]; then
  echo "Installing conda packages..."
  for pkg in $CONDA_PACKAGES; do
    conda install -y "$pkg"
  done
else
  echo "No conda packages to install."
fi

# Install npm packages
if [[ -n "$NPM_PACKAGES" ]]; then
  echo "Installing npm packages..."
  for pkg in $NPM_PACKAGES; do
    npm install -g "$pkg"
  done
else
  echo "No npm packages to install."
fi

# Install pip packages
if [[ -n "$PIP_PACKAGES" ]]; then
  echo "Installing pip packages..."
  for pkg in $PIP_PACKAGES; do
    pip3 install "$pkg" --root-user-action ignore
  done
else
  echo "No pip packages to install."
fi

echo "Setup Completed!"