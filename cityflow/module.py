
from collections import defaultdict
import json

class ModuleProps(defaultdict):
    def __init__(self):
        super().__init__(ModuleProps)
    
    def __getattr__(self, item):
        try:
            return self[item]
        except KeyError:
            raise AttributeError(f"object has no attribute '{item}'")
    
    def __setattr__(self, key, value):
        self[key] = value

    def __str__(self):
        return json.dumps(self, default=lambda o: o.__dict__, indent=4)