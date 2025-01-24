FROM continuumio/miniconda3:latest

# Set working directory
WORKDIR /cityflow_runner

# Install Node.js and system dependencies
RUN apt-get update && \
    apt-get install -y curl nodejs npm && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y chromium \
    libxss1 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* &&\
    mkdir -p /cityflow_runner/.config/matplotlib /cityflow_runner/.config/fontconfig && \
    chmod -R 777 /cityflow_runner/.config/matplotlib && \
    chmod -R 777 /cityflow_runner/.config/fontconfig

# Configure Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV MPLCONFIGDIR=/cityflow_runner/.config/matplotlib
ENV FONTCONFIG_PATH=/cityflow_runner/.config/fontconfig

# Copy dependency files
COPY . /cityflow_runner

# Install dependencies
RUN conda env update -n base --file environment.yml --prune && \
    npm install

# Set conda env activation and start command
CMD ["/bin/bash"]