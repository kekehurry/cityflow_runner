# Cityflow Runner

Cityflow runner is created to execute python and react code for [cityflow_platform](https://github.com/kekehurry/cityflow_platform.git)


## Build
```
docker build -t cityflow-runner:latest .
```

## Example Usage

Execute `react` code
```
node execute.js --compile example_js
```

Execute `python` code
```
python execute.py example_py
```
