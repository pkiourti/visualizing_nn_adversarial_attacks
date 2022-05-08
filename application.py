import json
from flask import Flask, request, Response, send_file, make_response
from flask_cors import CORS
from requests_toolbelt import MultipartEncoder
from werkzeug.utils import secure_filename
from flask_restful import Resource, Api, abort
import torch
import numpy as np
import os

import io
import pickle
import base64

import sys
sys.path.extend(['./model_module', './user_module', './image_module', './attack_module'])

from model import Model
from users import User
from images import Image
from attack import Attack

UPLOAD_FOLDER = './'
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif', '.pt', '.onnx'])
application = Flask(__name__)
CORS(application)
application.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

api = Api(application)

model_module = Model()
user_module = User()
image_module = Image()
attack_module = Attack()

def error(e, **kwargs):
    if e.args[0] == 0:
        return abort(404, message="Model is {} doesn't exist".format(kwargs['model_id']))
    if e.args[0] == 1:
        return abort(404, message="User email {} doesn't exist".format(kwargs['email']))

class Model(Resource):
    def get(self, model_id):
        json_data = json.dumps({"model_id": model_id})
        try:
            response = model_module.get_device(json_data)
        except ValueError as e:
            error(e, model_id=model_id)
        response['model_id'] = model_id
        return response

    def delete(self, model_id):
        json_data = json.dumps({"model_id": str(model_id)})
        try:
            response = model_module.delete_model(json_data)
        except ValueError as e:
            error(e, model_id=model_id)
        return response

    def put(self, model_id):
        json_data = {"model_id": str(model_id)}
        model_type_id = request.form['model_type_id']
        json_data['model_type_id'] = model_type_id
        json_data = json.dumps(json_data)

        try:
            response = model_module.update_model(json_data)
        except ValueError as e:
            error(e, model_id=model_id, model_type_id=model_type_id)
        return response
           
class ImageList(Resource):
    def post(self):
        image_file = request.files['image']
        benchmark = request.form['benchmark']
        label = request.form['label']
        fname = secure_filename(model_file.filename)
        image_file.save(fname)
        json_data = {}
        json_data['path'] = fname
        json_data['name'] = fname
        json_data['label'] = label
        json_data['benchmark'] = benchmark
        json_data = json.dumps(json_data)
        try:
            image_id = image_module.create(json_data)
        except ValueError as e:
            error(e)
        return {"image_id": image_id}

class ModelList(Resource):
    def post(self):
        model_file = request.files['model_file']
        filename = request.form['filename']
        user_id = request.form['user_id']
        benchmark = request.form['benchmark']
        fname = secure_filename(model_file.filename)
        model_file.save(fname)
        json_data = {}
        json_data['path'] = fname
        json_data['name'] = filename
        json_data['user_id'] = user_id
        json_data['benchmark'] = benchmark
        json_data = json.dumps(json_data)
        try:
            model_id = model_module.create(json_data)
        except ValueError as e:
            error(e, model_id=model_id, model_type_id=model_type_id)
        return {"model_id": model_id}

class UsersList(Resource):
    def post(self):
        json_data = {}
        json_data['name'] = request.json['name']
        json_data['email'] = request.json['email']
        json_data = json.dumps(json_data)
        try:
            user_id = user_module.register(json_data)
        except ValueError as e:
            abort(404, message='Something is missing')
        return {"user_id": user_id}

api.add_resource(ModelList, '/models')
api.add_resource(UsersList, '/users')
api.add_resource(ImageList, '/images')

@application.route('/models', methods=["GET"])
def get_user_models():
    user_id = request.args.get('user_id', type=str)
    json_data = {}
    json_data['user_id'] = user_id
    json_data = json.dumps(json_data)
    try:
        models = model_module.user_models(json_data)
    except ValueError as e:
        abort(404, message='Something is missing')
    return {"models": models}

@application.route('/users', methods=["GET"])
def get_user_by_email():
    email = request.args.get('email', type=str)
    json_data = {}
    json_data['email'] = email
    json_data = json.dumps(json_data)
    try:
        user_id = user_module.get_user(json_data)
    except ValueError as e:
        abort(404, message="User email " + email + " not registered")
    return {"user_id": user_id}

@application.route('/images', methods=["GET"])
def get_images():
    benchmark = request.args.get('benchmark', type=str)
    label = request.args.get('class', type=str)
    json_data = {}
    json_data['benchmark'] = benchmark

    if label:
        json_data['class'] = int(label)
    
    json_data = json.dumps(json_data)
    try:
        images = image_module.get_class_images(json_data) if label else image_module.get_image_categories(json_data)
    except ValueError as e:
        error(e)
        return {"error": "Error while getting image categories"}

    image_files = []
    for i, image in enumerate(images):
        pickled_image = pickle.loads(image['image'])
        img_byte_arr = io.BytesIO()
        pickled_image.save(img_byte_arr, format='png')
        img_byte_arr = img_byte_arr.getvalue()
        img_byte_arr = base64.encodebytes(img_byte_arr).decode('ascii')
        name = str(image['id']) if label else str(image['class'])
        image_files.append((name, img_byte_arr))


    fields = {}
    for label, image in image_files:
        fields[label] = (label, image, 'image/png')

    mpencoder = MultipartEncoder(fields=fields)

    return Response(mpencoder.to_string(), mimetype=mpencoder.content_type)

@application.route('/benchmarks', methods=["GET"])
def get_benchmarks():
    try:
        benchmarks = image_module.get_benchmarks()
    except ValueError as e:
        error(e)
        return {"error": "Error while getting images"}

    return {"benchmarks": benchmarks}
    
@application.route('/class_names', methods=["GET"])
def get_class_names():
    benchmark = request.args.get('benchmark', type=str)
    json_data = {}
    json_data['benchmark'] = benchmark
    json_data = json.dumps(json_data)
    try:
        class_names = image_module.get_class_names(json_data)
    except ValueError as e:
        return error(e)

    return {"class_names": class_names}

@application.route('/attack_types', methods=["GET"])
def get_attack_types():
    try:
        attack_types = attack_module.get_attack_types()
    except ValueError as e:
        return error(e)

    return {"attack_types": attack_types}

@application.route('/attack', methods=['POST'])
def get_attacked_image():
    image_id = request.json['image_id']
    pattern = request.json['pattern']
    if pattern == 'Instagram filter':
        pattern = 'instagram'
    if pattern == 'random rectangle':
        pattern = 'random_rectangle'
    if pattern == 'spread-out':
        pattern = 'spread'
    benchmark = request.json['benchmark']
    benchmark_id = request.json['benchmark_id']
    label = request.json['chosen_class']
    chosen_class = request.json['chosen_class']
    chosen_model = request.json['chosen_model']
    h = ''
    w = ''
    kwargs = {}
    if benchmark == 'CIFAR10' or benchmark == 'GTSRB':
        h = 32
        w = 32
        kwargs['channels'] = 3
    elif benchmark == 'mnist' or benchmark == 'Fashion MNIST':
        h = 28
        w = 28
        kwargs['channels'] = 1
    list_of_string_params = ['pattern', 'benchmark', 'color_alg',
                        'image_id', 'chosen_model', 'instagram',
                        'benchmark_id']
    for (key, value) in request.json.items():
        if key not in list_of_string_params:
            kwargs[key] = int(value)
        if key == 'color_alg':
            kwargs[key] = value
        if key == 'instagram':
            kwargs[key] = value
    if pattern == 'lambda' or pattern == 'rectangle' or pattern == 'random_rectangle':
        kwargs['start_positions'] = [[kwargs['position_x'], kwargs['position_y']]]
        del kwargs['position_x']
        del kwargs['position_y']
    del kwargs['chosen_class']
    response = attack_module.attack_model(benchmark_id, image_id, chosen_class, chosen_model, pattern, h, w, **kwargs)

    json_data = {}
    json_data['benchmark'] = benchmark_id
    json_data = json.dumps(json_data)
    class_names = image_module.get_class_names(json_data)
    images = response['images']
    current_output = response['current_output']
    labels = response['labels']

    statistics = []
    number_of_classes = len(class_names)
    image_files = []
    for i, image in enumerate(images):
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='png')
        img_byte_arr = img_byte_arr.getvalue()
        img_byte_arr = base64.encodebytes(img_byte_arr).decode('ascii')
        name = 'poisoned_image-' + str(current_output[i]) if i == 0 else 'original_image-' + str(current_output[i])
        image_files.append((name, img_byte_arr))

    fields = {}
    for label, image in image_files:
        fields[label] = (label, image, 'image/png')
    for i in range(number_of_classes):
        statistics.append({
            "label": str(i),
            "stat": np.around((labels.count(i) / len(labels))*100, 2)
        })

    fields['statistics'] = json.dumps({"statistics": statistics})

    mpencoder = MultipartEncoder(fields=fields)

    return Response(mpencoder.to_string(), mimetype=mpencoder.content_type)

@application.route('/image', methods=['GET'])
def get_image():
    image_id = request.args.get('image_id', type=str)
    json_data = json.dumps({"image_id": image_id})
    try:
        image = image_module.get_image(json_data)
    except ValueError as e:
        error(e, image_id=image_id)

    img_byte_arr = io.BytesIO()
    image['image'].save(img_byte_arr, format='png')
    img_byte_arr = img_byte_arr.getvalue()
    img_byte_arr = base64.encodebytes(img_byte_arr).decode('ascii')
    name = image['id']
    image_files = [(name, img_byte_arr)]

    fields = {}
    for label, image in image_files:
        fields[label] = (label, image, 'image/png')

    mpencoder = MultipartEncoder(fields=fields)

    return Response(mpencoder.to_string(), mimetype=mpencoder.content_type)

@application.route('/')
def index():
    return "<h1>Visualizing NN Adversarial Attacks App!</h1>"
