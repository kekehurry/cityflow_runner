FROM continuumio/miniconda3:latest

# Install Node.js and system dependencies
RUN apt-get update && \
    apt-get install -y curl nodejs npm && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
    libxss1 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Configure Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Set working directory
WORKDIR /cityflow_runner

# Copy dependency files
COPY . /cityflow_runner

# Initialize conda for shell, create and activate environment
RUN conda env create -f environment.yml && \
    conda init && \
    . /root/.bashrc && \
    conda activate myenv && \
    npm install

# Set conda env activation and start command
SHELL ["conda", "run", "-n", "myenv", "/bin/bash", "-c"]
CMD ["/bin/bash"]