from pymongo import MongoClient
from datetime import datetime
from PIL import Image
import logging
import json
import os
import pickle
from itertools import compress
from bson.objectid import ObjectId
from werkzeug.utils import secure_filename

class Image:
    def __init__(self):
        logging.basicConfig()
        self.logger = logging.getLogger('Image Logger')
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
        self.logger.info('Creating a new image')

        self._check_json(json_data)
        json_data = json.loads(json_data)
        
        required_data = ['path', 'name', 'benchmark', 'class']
        required_exist = [elem in json_data.keys() for elem in required_data]
        if not all(required_exist):
            missing_data = list(set(required_data) \
                    - set(compress(required_data, required_exist)))
            self.logger.error("Missing required data %s", missing_data)
            raise ValueError(11, "Missing required data %s", missing_data)

        path = json_data['path']
        name = json_data['name']
        label = json_data['class']
        benchmark = json_data['benchmark']
        created_at = datetime.utcnow()

        im = Image.open(path)

        image = {
            "image": pickle.dumps(im),
            "class": label,
            "benchmark": benchmark,
            "created_at": created_at
        }
        response = self.db.images.insert_one(image)
        print(response)
        if response.acknowledged:
            self.logger.info('Stored image with image id %s',str(response.inserted_id))
            print(response.inserted_id)
            return str(response.inserted_id)
        #TODO: delete local file

    def get_class_images(self, json_data):
        """
            returns a list os all objects that store an image of the chosen class 
        """
        self.logger.info('Get class images')

        self._check_json(json_data)
        json_data = json.loads(json_data)
        
        required_data = ['benchmark', 'class']
        required_exist = [elem in json_data.keys() for elem in required_data]
        if not all(required_exist):
            missing_data = list(set(required_data) \
                    - set(compress(required_data, required_exist)))
            self.logger.error("Missing required data %s", missing_data)
            raise ValueError(11, "Missing required data %s", missing_data)

        benchmark = json_data['benchmark']
        label = json_data['class']
        
        response = self.db.images.find({"benchmark": benchmark, "class": label})
        images = []
        for im in response:
            im['id'] = str(im['_id'])
            del im['_id']
            images.append(im)

        print(len(images))
        return images

    def get_image_categories(self, json_data):
        self.logger.info('Get benchmark images')

        self._check_json(json_data)
        json_data = json.loads(json_data)
        
        required_data = ['benchmark']
        required_exist = [elem in json_data.keys() for elem in required_data]
        if not all(required_exist):
            missing_data = list(set(required_data) \
                    - set(compress(required_data, required_exist)))
            self.logger.error("Missing required data %s", missing_data)
            raise ValueError(11, "Missing required data %s", missing_data)

        benchmark = json_data['benchmark']
        
        response = self.db.images.find({"benchmark": benchmark})
        images = []
        classes = []
        for im in response:
            if im['class'] in classes:
                continue
            else:
                im['id'] = str(im['_id'])
                del im['_id']
                images.append(im)
                classes.append(im['class'])

        return images

    def get_benchmarks(self):
        self.logger.info('Get benchmarks')

        response = self.db.benchmarks.find()
        benchmarks = []
        for benchmark in response:
            benchmark['id'] = str(benchmark['_id'])
            del benchmark['_id']
            benchmarks.append(benchmark)
        return benchmarks


    def get_class_names(self, json_data):
        self.logger.info('Get benchmark class names')

        self._check_json(json_data)
        json_data = json.loads(json_data)
        
        required_data = ['benchmark']
        required_exist = [elem in json_data.keys() for elem in required_data]
        if not all(required_exist):
            missing_data = list(set(required_data) \
                    - set(compress(required_data, required_exist)))
            self.logger.error("Missing required data %s", missing_data)
            raise ValueError(11, "Missing required data %s", missing_data)

        benchmark = json_data['benchmark']
        
        response = self.db.class_names.find({"benchmark": benchmark})
        benchmark = self.db.benchmarks.find({"_id": ObjectId(benchmark)})
        class_names = []
        for c in response:
            c['id'] = str(c['_id'])
            del c['_id']
            #c['benchmark'] = benchmark['benchmark']
            class_names.append(c)

        return class_names

    def get_image(self, json_data):
        self.logger.info('Get image')

        self._check_json(json_data)
        json_data = json.loads(json_data)
        
        required_data = ['image_id']
        required_exist = [elem in json_data.keys() for elem in required_data]
        if not all(required_exist):
            missing_data = list(set(required_data) \
                    - set(compress(required_data, required_exist)))
            self.logger.error("Missing required data %s", missing_data)
            raise ValueError(11, "Missing required data %s", missing_data)

        image_id = json_data['image_id']
        
        image = self.db.images.find_one({"_id": ObjectId(image_id)})
        image['id'] = str(image['_id'])
        return { 'id': image['id'], 'image': pickle.loads(image['image'])}
