from pymongo import MongoClient
from datetime import datetime
import logging
import json
import os
import pickle
from itertools import compress
from bson.objectid import ObjectId
from werkzeug.utils import secure_filename
import torch
from cifar10 import CIFAR10

class Model:

    def __init__(self):
        logging.basicConfig()
        self.logger = logging.getLogger('Model Logger')
        self.logger.setLevel(logging.DEBUG)
        client = MongoClient('localhost', 27017)
        self.db = client.models

    def _check_json(self, data):
        self.logger.info('Parsing sent data')
        print(data)
        print(type(data))
        try:
            json.loads(data)
        except:
            self.logger.error('Expected json data in a str ' \
                             + 'format but got data in type: ' \
                             + str(type(data)))
            raise ValueError(10, 'Expected json data in a str ' \
                             + 'format but got data in type: ' \
                             + str(type(data)))

    def create(self, json_data):
        self.logger.info('Creating a new model')

        self._check_json(json_data)
        json_data = json.loads(json_data)
        
        required_data = ['path', 'name', 'user_id']
        required_exist = [elem in json_data.keys() for elem in required_data]
        if not all(required_exist):
            missing_data = list(set(required_data) \
                    - set(compress(required_data, required_exist)))
            self.logger.error("Missing required data %s", missing_data)
            raise ValueError(11, "Missing required data %s", missing_data)

        path = json_data['path']
        name = json_data['name']
        user_id = json_data['user_id']
        benchmark = json_data['benchmark']
        model = CIFAR10()
        model.load_state_dict(torch.load(path, map_location=torch.device('cpu')))
        print(model)
        
        model_type_id = 0
        created_at = datetime.utcnow()

        model = {
            "model": pickle.dumps(model),
            "name": name,
            "model_type_id": model_type_id,
            "user_id": user_id,
            "benchmark": benchmark,
            "created_at": created_at
        }
        response = self.db.models.insert_one(model)
        print(response)
        if response.acknowledged:
            self.logger.info('Stored model with model id %s',str(response.inserted_id))
            print(response.inserted_id)
            return str(response.inserted_id)
        #TODO: delete local file

    def user_models(self, json_data):
        self.logger.info('Get user models')

        self._check_json(json_data)
        json_data = json.loads(json_data)
        
        required_data = ['user_id']
        required_exist = [elem in json_data.keys() for elem in required_data]
        if not all(required_exist):
            missing_data = list(set(required_data) \
                    - set(compress(required_data, required_exist)))
            self.logger.error("Missing required data %s", missing_data)
            raise ValueError(11, "Missing required data %s", missing_data)

        user_id = json_data['user_id']
        
        response = self.db.models.find({"user_id": user_id})
        # benchmarks = self.db.benchmarks.find()
        # bs = {}
        # for b in benchmarks:
        #    b['_id'] = str(b['_id'])
        #    bs[b['_id']] = b['benchmark']
        #print(response)
        results = []
        for model in response:
            del model['model']
            model['id'] = str(model['_id'])
            del model['_id']
            # model['benchmark'] = bs[model['benchmark']]
            print('model', model)
            print()
            results.append(model)

        print(results)
        return results

    def predict(self, json_data):
        self.logger.info('Predict a class for an image')

        self._check_json(json_data)
        json_data = json.loads(json_data)
        
        required_data = ['image_id', 'model_id']
        required_exist = [elem in json_data.keys() for elem in required_data]
        if not all(required_exist):
            missing_data = list(set(required_data) \
                    - set(compress(required_data, required_exist)))
            self.logger.error("Missing required data %s", missing_data)
            raise ValueError(11, "Missing required data %s", missing_data)

        model_id = json_data['model_id']
        image_id = json_data['image_id']
