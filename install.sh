#!/bin/bash

# Configuration file
eval "$(conda shell.bash hook)" && conda activate base

cd /cityflow_runner

CONFIG_FILE="/cityflow_runner/workflow/setup.yml"


# Check if the configuration file exists
if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "Configuration file $CONFIG_FILE not found!"
  exit 1
fi

# Parse the configuration file
CONDA_CHANNELS=$(yq e '.channels[]' "$CONFIG_FILE")
CONDA_PACKAGES=$(yq e '.conda[]' "$CONFIG_FILE")
NPM_PACKAGES=$(yq e '.npm[]' "$CONFIG_FILE")
PIP_PACKAGES=$(yq e '.pip[]' "$CONFIG_FILE")

# Set conda channels
if [[ -n "$CONDA_CHANNELS" ]]; then
  echo "Setting conda channels..."
  for channel in $CONDA_CHANNELS; do
    conda config --add channels "$channel"
  done
else
  echo "Using defaults and conda-forge."
  conda config --add channels defaults
  conda config --add channels conda-forge
fi

# Install conda packages
if [[ -n "$CONDA_PACKAGES" ]]; then
  echo "Installing conda packages..."
  conda install -y $CONDA_PACKAGES
else
  echo "No conda packages to install."
fi

# Install npm packages
if [[ -n "$NPM_PACKAGES" ]]; then
  echo "Installing npm packages..."
  npm install $NPM_PACKAGES
else
  echo "No npm packages to install."
fi

# Install pip packages
if [[ -n "$PIP_PACKAGES" ]]; then
  echo "Installing pip packages..."
  pip3 install $PIP_PACKAGE --root-user-action ignore
else
  echo "No pip packages to install."
fi

cd /cityflow_runner/workflow
echo "Setup Completed!"