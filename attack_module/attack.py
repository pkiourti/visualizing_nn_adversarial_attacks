from pymongo import MongoClient
from datetime import datetime
from PIL import Image
import logging
import json
import os
import pickle
import numpy as np
from itertools import compress
from bson.objectid import ObjectId
from poison_attacker import PoisonAttacker
import onnxruntime

class Attack:
    def __init__(self):
        logging.basicConfig()
        self.logger = logging.getLogger('Attack Logger')
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

    def get_attack_types(self):
        response = self.db.attack_types.find()
        attack_types = []
        for attack in response:
            attack['id'] = str(attack['_id'])
            del attack['_id']
            attack_types.append(attack)

        return attack_types
        
    def attack_model(self, benchmark, image_id, chosen_class, chosen_model, pattern, h, w, **kwargs):
        self.logger.info('Poisoning an image')

        try:
            image = self.db.images.find_one({"_id": ObjectId(image_id)})
        except:
            raise ValueError('Image not found')

        if pattern == 'lambda':
            kwargs['color'] = [kwargs['red'], kwargs['green'], kwargs['blue']]
        if pattern == 'random_rectange':
            if kwargs['color_alg'] == 'channel_assign':
                kwargs['color'] = [kwargs['red'], kwargs['green'], kwargs['blue']]
        if pattern == 'rectangle':
            kwargs['color'] = [kwargs['red'], kwargs['green'], kwargs['blue']]
        if pattern == 'spread':
            kwargs['color'] = [kwargs['red'], kwargs['green'], kwargs['blue']]

        im = pickle.loads(image['image'])
        original_image = np.asarray(im).reshape(1, h, w, kwargs['channels'])
        print(np.max(original_image))
        original_image = original_image.astype('int64')
        poison_attacker = PoisonAttacker(pattern, h, w, **kwargs)
        poison_attacker.poison_data(original_image, [chosen_class], 1)
        poison_image = poison_attacker.poisoned_images

        poison_label = self.predict(chosen_model, poison_image)[0]
        original_label = self.predict(chosen_model, original_image)[0]

        response = self.db.images.find({"benchmark": benchmark})
        images = []
        for im in response:
            image = pickle.loads(im['image'])
            images.append(np.asarray(image).astype('int64'))
        poison_attacker.poison_data(images, [-1]*len(images), len(images))

        labels = self.predict(chosen_model, poison_attacker.poisoned_images)
        poison_image = poison_image.astype('uint8')
        original_image = original_image.astype('uint8')
        
        poisoned_image = Image.fromarray(poison_image[0])
        original_image = Image.fromarray(original_image[0])

        return {"images": [poisoned_image, original_image], 
                "current_output": [poison_label, original_label],
                "labels": labels}

    def predict(self, model, images):
        try:
            model = self.db.models.find_one({"_id": ObjectId(model)})
        except:
            raise ValueError('Model not found')

        onnx_model = pickle.loads(model['model'])
        ort_session = onnxruntime.InferenceSession(onnx_model.SerializeToString())
        ort_inputs = {ort_session.get_inputs()[0].name: np.transpose(images, (0, 3, 1, 2)).astype('float32') / 255.}
        outputs = ort_session.run(None, ort_inputs)[0]

        labels = [l.argmax() for l in outputs]
        return labels 
