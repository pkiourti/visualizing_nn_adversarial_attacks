import json
from flask import Flask, request, Response
from flask_cors import CORS
from requests_toolbelt import MultipartEncoder
from werkzeug.utils import secure_filename
from flask_restful import Resource, Api, abort
import torch
from cifar10 import CIFAR10
import os

import io
import pickle
import base64

import sys
sys.path.extend(['./model_module', './user_module', './image_module'])

from model import Model
from users import User
from images import Image

UPLOAD_FOLDER = './'
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif', '.pt'])
application = Flask(__name__)
CORS(application)
application.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

api = Api(application)

model_module = Model()
user_module = User()
image_module = Image()

def error(e, **kwargs):
    if e.args[0] == 0:
        abort(404, message="Model is {} doesn't exist".format(kwargs['model_id']))
    if e.args[0] == 1:
        abort(404, message="User email {} doesn't exist".format(kwargs['email']))

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
           
class Images(Resource):
    def get(self, image_id):
        json_data = json.dumps({"image_id": image_id})
        try:
            response = model_module.get_device(json_data)
        except ValueError as e:
            error(e, image_id=image_id)
        response['image_id'] = image_id
        return response

    def delete(self, image_id):
        json_data = json.dumps({"image_id": str(image_id)})
        try:
            response = model_module.delete_model(json_data)
        except ValueError as e:
            error(e, image_id=image_id)
        return response

    def put(self, image_id):
        json_data = {"image_id": str(image_id)}
        label = request.form['class']
        json_data['class'] = label
        json_data = json.dumps(json_data)

        try:
            response = image_module.update_image(json_data)
        except ValueError as e:
            error(e, image_id=image_id)
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
            error(e)
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
        error(e)
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
        error(e, email=email)
        return {"error": "User email " + email + " not registered"}
    return {"user_id": user_id}

@application.route('/images', methods=["GET"])
def get_benchmark_images():
    benchmark = request.args.get('benchmark', type=str)
    json_data = {}
    json_data['benchmark'] = benchmark
    json_data = json.dumps(json_data)
    try:
        images = image_module.get_benchmark_images(json_data)
    except ValueError as e:
        error(e)
        return {"error": "Error while getting images"}

    image_files = []
    for i, image in enumerate(images):
        pickled_image = pickle.loads(image['image'])
        img_byte_arr = io.BytesIO()
        pickled_image.save(img_byte_arr, format='png')
        img_byte_arr = img_byte_arr.getvalue()
        img_byte_arr = base64.encodebytes(img_byte_arr).decode('ascii')
        image_files.append(('class'+str(image['class']), img_byte_arr))

    fields = {}
    for label, image in image_files:
        fields[label] = (label + '.png', image, 'image/png')

    mpencoder = MultipartEncoder(fields=fields)

    return Response(mpencoder.to_string(), mimetype=mpencoder.content_type)

@application.route('/images', methods=["GET"])
def get_class_image():
    label = request.args.get('class', type=int)
    benchmark = request.args.get('benchmark', type=int)
    json_data = {}
    json_data['class'] = label
    json_data['benchmark'] = benchmark
    json_data = json.dumps(json_data)
    try:
        images = image_module.get_class_images(json_data)
    except ValueError as e:
        error(e)
        return {"error": "Error while getting images"}

    image_files = []
    for i, image in enumerate(images):
        pickled_image = pickle.loads(image['image'])
        img_byte_arr = io.BytesIO()
        pickled_image.save(img_byte_arr, format='png')
        img_byte_arr = img_byte_arr.getvalue()
        img_byte_arr = base64.encodebytes(img_byte_arr).decode('ascii')
        image_files.append(('class'+str(i), img_byte_arr))

    fields = {}
    for label, image in image_files:
        fields[label] = (label + '.png', image, 'image/png')

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

@application.route('/')
def index():
    return "<h1>Visualizing NN Adversarial Attacks App!</h1>"
