from .database import *
from .module import *


class CityFlow:
    def __init__(self, db_file):
        self.module = ModuleProps()
        self.database = DataBase(db_file)