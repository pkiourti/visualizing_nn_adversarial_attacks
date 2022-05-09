import requests
# from requests_toolbelt.multipart import decoder

import time
from pymongo import MongoClient
from bson.objectid import ObjectId
from PIL import Image
# import pickle
# import base64
# import io
import os

BASE = "http://127.0.0.1:5000/"

def test_api():
    # test get image request
    client = MongoClient('localhost', 27017)
    db = client.models
    response = db.benchmarks.insert_one({
        "benchmark": 'CIFAR10'
    })

    benchmark_id = str(response.inserted_id)
    path = os.path.join('CIFAR10', 'images')
    images = os.listdir(path)
    im = Image.open(os.path.join(path, images[0]))
    response = db.images.insert_one({
        "image": pickle.dumps(im),
        "benchmark": benchmark_id,
        "class": 0
    })

    image_id = str(response.inserted_id)

    response = requests.get(BASE + 'image?image_id=' + image_id)
    assert response.status_code == 200
    assert response.text != None
    assert response.headers['Content-Type'] != None

    # body = response.text
    # content_type = response.headers['Content-Type']
    # for part in decoder.MultipartDecoder(bytes(body, 'ascii'), content_type).parts:
    #     break
    # im_bytes = io.BytesIO()
    # im.save(im_bytes, format='png')
    # assert im_bytes == base64.decodebytes(part.content)

    # test get images request
    response = requests.get(BASE + 'images?benchmark=' + benchmark_id)
    assert response.status_code == 200
    assert response.text != None
    assert response.headers['Content-Type'] != None

    # test get image categories request
    response = requests.get(BASE + 'images?benchmark=' + benchmark_id + '&class=3')
    assert response.status_code == 200
    assert response.text != None
    assert response.headers['Content-Type'] != None

    # test get class names request
    response = requests.get(BASE + 'class_names?benchmark=' + benchmark_id)
    assert response.status_code == 200

    # test get class names request
    response = requests.get(BASE + 'attack_types')
    assert response.status_code == 200

    db.images.delete_one({'_id': ObjectId(image_id)})
