import json
from flask import Flask, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
from flask_restful import Resource, Api, abort
import torch
from cifar10 import CIFAR10
import os

import sys
sys.path.extend(['./model_module', './user_module'])

from model import Model
from users import User

UPLOAD_FOLDER = './'
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif', '.pt'])
application = Flask(__name__)
CORS(application)
application.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

api = Api(application)

model_module = Model()
user_module = User()

def error(e, **kwargs):
    if e.args[0] == 0:
        abort(404, message="Model is {} doesn't exist".format(kwargs['model_id']))

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
           
class ModelList(Resource):
    def get(self):
        return model_module.get_models()

    def post(self):
        model_file = request.files['model_file']
        print(type(model_file))
        name = secure_filename(model_file.filename)
        print(type(name))
        model_file.save(name)
        json_data = {}
        json_data['path'] = name
        json_data = json.dumps(json_data)
        try:
            model_id = model_module.create(json_data)
        except ValueError as e:
            error(e, model_id=model_id, model_type_id=model_type_id)
        return {"model_id": model_id}

class UsersList(Resource):
    def get(self):
        return user_module.get_users()

    def post(self):
        print()
        print(request)
        print()
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

#@application.route('/models/user_id')

@application.route('/')
def index():
    return "<h1>Visualizing NN Adversarial Attacks App!</h1>"
