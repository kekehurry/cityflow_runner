FROM ubuntu:22.04

# Set working directory
WORKDIR /cityflow_runner

ENV DEBIAN_FRONTEND=noninteractive
ENV PATH=/opt/conda/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Install Node.js and system dependencies
RUN apt-get update && \
    apt-get install -y \
    curl \
    nodejs \
    npm \
    jq \
    wget \
    bzip2 \
    ca-certificates \
    git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Detect architecture and set Miniconda download URL
RUN wget --quiet "https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh" -O ~/miniconda.sh && \
    /bin/bash ~/miniconda.sh -b -p /opt/conda && \
    rm ~/miniconda.sh && \
    ln -s /opt/conda/etc/profile.d/conda.sh /etc/profile.d/conda.sh &&  \
    echo ". /opt/conda/etc/profile.d/conda.sh" >> ~/.bashrc && \
    find /opt/conda/ -follow -type f -name '*.a' -delete &&  \
    find /opt/conda/ -follow -type f -name '*.js.map' -delete &&  \
    /opt/conda/bin/conda clean -afy

# Copy dependency files
COPY . /cityflow_runner

# Install dependencies
RUN conda env create -f environment.yml -n cityflow && \
    echo "conda activate cityflow" >> ~/.bashrc &&  \
    npm install && \
    chmod +x install.sh 

ENTRYPOINT ["/bin/bash -c 'install.sh' "]

# Set conda env activation and start command
CMD ["/bin/bash"]