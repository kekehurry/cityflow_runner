# Build
```
docker build -t cityflow-runner:latest .
```

# Example Usage

Execute `react` code
```
docker run -it --rm \
-v $(pwd)/workspace_js:/cityflow_runner/workspace \
-v $(pwd)/compile.js:/cityflow_runner/compile.js \
-v $(pwd)/execute.js:/cityflow_runner/execute.js \
cityflow-runner:latest \
sh -c "cd /cityflow_runner/workspace && node /cityflow_runner/execute.js ."
```

Execute `python` code
```
docker run -it --rm -v $(pwd)/workspace_py:/cityflow_runner/workspace cityflow-runner:latest python execute.py /workspace

```


docker run -it --rm \
-v $(pwd)/workspace_js:/cityflow_runner/workspace \
cityflow-runner:latest \
sh -c "cd /cityflow_runner/workspace && node /cityflow_runner/execute.js ."
