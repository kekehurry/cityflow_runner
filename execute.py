import os
import json
import argparse
import sys
from cityflow import CityFlow

def execute(workspace_path):
    # Load the configuration file
    db_file = os.path.join(workspace_path, '../data.db') 
    cityflow = CityFlow(db_file=db_file)
    props = cityflow.module

    config_path = os.path.join(workspace_path, 'config.json')
    input_path = os.path.join(workspace_path, 'input.json')
    entrypoint_path = os.path.join(workspace_path, 'entrypoint.py')

    with open(config_path, 'r') as f:
        props.config = json.load(f)
    with open(input_path, 'r') as f:
        props.input = json.load(f)

    with open(entrypoint_path, 'r') as f:
        entrypoint = f.read()

    sys.modules['cityflow'] = cityflow
    sys.modules['cityflow.module'] = cityflow.module
    sys.modules['cityflow.database'] = cityflow.database

    sys.path.insert(0, workspace_path)
    
    exec(entrypoint, {'__name__': '__main__'})

    with open(os.path.join(workspace_path, 'output.json'), 'w') as f:
        f.write(json.dumps(props.output))

    return props

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Execute cityflow with workspace path')
    parser.add_argument('workspace', help='Path to workspace directory')
    args = parser.parse_args()
    execute(args.workspace)  