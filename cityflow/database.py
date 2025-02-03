import sqlite3
from sqlite3 import Error
import json

class DataBase:

    def __init__(self,db_file):
        self.db_file = db_file
        self._create_table()

    def _create_connection(self):
        conn = None
        try:
            conn = sqlite3.connect(self.db_file) # creates a database in RAM
            return conn
        except Error as e:
            print(e)

    def _create_table(self):
        conn = self._create_connection()
        if conn is not None:
            cur = conn.cursor()
            try:
                sql_create_table_query = """ CREATE TABLE IF NOT EXISTS cache_data (
                                                id integer PRIMARY KEY,
                                                key text NOT NULL UNIQUE,
                                                value text
                                            ); """
                cur.execute(sql_create_table_query)
            except Error as e:
                print(e)
            conn.commit()
            conn.close()
        else:
            print("Error! cannot create the database connection.")
    
    def _count_records(self):
        conn = self._create_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM cache_data")
        count = cur.fetchone()[0]
        conn.close()
        return count
    
    def _add_data(self, key, value):
        conn = self._create_connection()
        cur = conn.cursor()
        sql = ''' INSERT OR REPLACE INTO cache_data(key,value)
                  VALUES(?,?) '''
        cur.execute(sql, (key, json.dumps(value)))
        conn.commit()
        conn.close()
    
    def add_data(self, key, value):
        self._add_data(key, value)

    def get_data(self, key):
        conn = self._create_connection()
        cur = conn.cursor()
        cur.execute("SELECT value FROM cache_data WHERE key=?", (key,))
        row = cur.fetchone()
        conn.close()
        if row is not None:
            return json.loads(row[0])
        else:
            return None
    
    def key_exists(self,key):
        conn = self._create_connection()
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM cache_data WHERE key=?", (key,))
        return cur.fetchone() is not None
    
    def clear_data(self):
        conn = self._create_connection()
        cur = conn.cursor()
        sql = 'DELETE FROM cache_data'
        cur.execute(sql)
        conn.commit() 
        cur.execute('VACUUM')
        conn.commit()
        conn.close()