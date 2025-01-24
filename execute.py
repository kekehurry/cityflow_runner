import os
import json
import argparse
import sys
from collections import defaultdict

class ModuleProps:
        def __init__(self):
            self._data = {}
        
        def __getattr__(self, name):
            return self._data.get(name, None)
        
        def __setattr__(self, name, value):
            if name == '_data':
                super().__setattr__(name, value)
            else:
                self._data[name] = value
        
        def __str__(self):
            return json.dumps(self._data)
        
        def __repr__(self):
            return self.__str__()

class CityFlow:
    def __init__(self):
        self.module = ModuleProps()

def execute(workspace_path):
    # Load the configuration file
    cityflow = CityFlow()
    props = cityflow.module
    
    config_path = os.path.join(workspace_path, 'config')
    input_path = os.path.join(workspace_path, 'input')
    entrypoint_path = os.path.join(workspace_path, 'entrypoint')

    with open(config_path, 'r') as f:
        props.config = json.load(f)

    with open(input_path, 'r') as f:
        props.input = json.load(f)

    with open(entrypoint_path, 'r') as f:
        entrypoint = f.read()

    sys.modules['cityflow'] = cityflow
    sys.modules['cityflow.module'] = cityflow.module

    exec(entrypoint, {'__name__': '__main__'})

    with open(os.path.join(workspace_path, 'output'), 'w') as f:
        f.write(json.dumps(props.output))
    return props

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Execute cityflow with workspace path')
    parser.add_argument('workspace', help='Path to workspace directory')
    args = parser.parse_args()
    execute(args.workspace)   