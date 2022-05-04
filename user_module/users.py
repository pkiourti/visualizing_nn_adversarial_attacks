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

    def get_user(self, json_data):
        self.logger.info('Get user from email')

        self._check_json(json_data)
        json_data = json.loads(json_data)

        email = json_data['email']

        response = self.db.users.find_one({"email": email})
        print('get user from email', response)
        if response:
            self.logger.info('Found user with user id %s', str(response['_id']))
            return str(response['_id'])
        else:
            raise ValueError('User not found')
