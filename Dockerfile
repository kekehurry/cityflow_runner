FROM continuumio/miniconda3:latest

# Set working directory
WORKDIR /cityflow_runner

# Install Node.js and system dependencies
RUN apt-get update && \
    apt-get install -y curl nodejs npm && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy dependency files
COPY . /cityflow_runner

# Install dependencies
RUN conda env update -n base --file environment.yml --prune && \
    npm install

# Set conda env activation and start command
CMD ["/bin/bash"]