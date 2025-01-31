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