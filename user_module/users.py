from pymongo import MongoClient
import time
from datetime import datetime
import json
import logging

class User:
    def __init__(self):
        logging.basicConfig()
        self.logger = logging.getLogger('User Logger')
        self.logger.setLevel(logging.DEBUG)
        client = MongoClient('localhost', 27017)
        self.db = client.models

    def _check_json(self, data):
        pass
        
    def register(self, json_data):
        self.logger.info('Registering user')

        self._check_json(json_data)
        json_data = json.loads(json_data)

        email = json_data['email']
        name = json_data['name']

        user = {
            "name": name,
            "email": email,
            "created_at": datetime.utcnow()
        }

        response = self.db.users.insert_one(user)
        if response.acknowledged:
            self.logger.info('Created user with user id %s', str(response.inserted_id))
            return str(response.inserted_id)
