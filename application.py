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
           
class ModelList(Resource):
    def post(self):
        model_file = request.files['model_file']
        name = request.form['name']
        user_id = request.form['user_id']
        print(type(model_file))
        print()
        print()
        print(name)
        print()
        print()
        print(request.files)
        fname = secure_filename(model_file.filename)
        print(type(fname))
        model_file.save(fname)
        json_data = {}
        json_data['path'] = fname
        json_data['name'] = name
        json_data['user_id'] = user_id
        json_data = json.dumps(json_data)
        try:
            model_id = model_module.create(json_data)
        except ValueError as e:
            error(e, model_id=model_id, model_type_id=model_type_id)
        return {"model_id": model_id}

class UsersList(Resource):
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

@application.route('/')
def index():
    return "<h1>Visualizing NN Adversarial Attacks App!</h1>"
