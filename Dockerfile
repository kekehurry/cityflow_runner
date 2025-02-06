FROM continuumio/miniconda3:latest

# Set working directory
WORKDIR /cityflow_runner

# Install Node.js and system dependencies
RUN apt-get update && \
    apt-get install -y curl nodejs npm && \
    wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/bin/yq &&\
    chmod +x /usr/bin/yq && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy dependency files
COPY . /cityflow_runner

# Install dependencies
RUN conda env update -n base --file environment.yml --prune && \
    npm install && \
    chmod +x install.sh

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /cityflow_runner/workflow

# Set conda env activation and start command
ENTRYPOINT ["/bin/bash -c '/cityflow_runner/install.sh' "]

