# Visualizing Neural Network Adversarial Attacks

## Description
This project aims to provide an application that implements the injection different types of backdoor attacks (patterns) to images that are fed to classification networks. Through the interface the user: 
1) can upload their model in an onnx format and store it in the database
2) select one of their models to test its robustness to backdoor attacks
3) select the image category and the image they want to attack
4) select the attack specifics (type, color, etc.)
5) attack the model (using the Test button) and observe if the label of the image changed after the injection of the backdoor. The application then poisons all the images in order to observe the predicted labels of these poisoned images. The results are shown in a table. 

## Setup
### Install dependencies from requirements.txt
```
conda create -n final python
conda activate final
conda install --file requirements.txt 
```

### Install MongoDB on Ubuntu
This project has been tested and implemented in Ubuntu 20.04 LTS. I used MongoDB and installed from here: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/ using the following commands:
```
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
sudo touch /etc/apt/sources.list.d/mongodb-org-5.0.list
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```
### Install and start ngrok
I used ngrok to access the Flask server that runs locally on port 5000 (started in the previous step). I couldn't access localhost without ngrok. ngrok is a simple solution to expose a local server to the Internet. Download tar file from here: https://ngrok.com/download:
```
sudo tar xvzf ~/Downloads/ngrok-stable-linux-amd64.tgz -C /usr/local/bin
cd ~/Downloads/ngrok-stable-linux-amd64
./ngrok http 5000
```
Change line 13 of the nn-app/src/App.js from 
`base_url: "https://b5d8-24-63-24-208.ngrok.io",` to the https url that ngrok outputs.

### Install dependencies for React
```
cd visualizing_nn_adversarial_attacks/nn-app 
npm install
```

### Start MongoDB
```
sudo systemctl start mongod
```

### Prepare Database
In this project we work with the following datasets (or benchmarks):
- [CIFAR10](https://www.cs.toronto.edu/~kriz/cifar.html)
- [German Traffic Sign Recognition Benchmark (GTSRB)](https://benchmark.ini.rub.de/)
- MNIST
- Fashion MNIST
- 
This means that the models that are uploaded to the application and tested should be trained on one of these datasets.

Use the following command before you start the application to setup some tables and add the fixed validation images of each benchmark into the database.
```
python3 prepare_database.py
```

### Start the Flask server
```
cd visualizing_nn_adversarial_attacks/
export FLASK_APP="application.py"
flask run
```

### Start the application
```
cp visualizing_nn_adversarial_attacks/nn-app
npm start
```

### NOTES
- Your model should be in an onnx format. Hence, the versions of pytorch or tensorflow that the model used to get trained don't matter. Onnx format is very useful because you pass both the architecture and the weights of the neural network in one file. I used onnx format to upload the model as one file, which then I `pickle` and store in the database. In order to load the model later from the database and can retrieve the inference session from the loaded model by doing the following:

```
import pickle
import onnxrutime
from pymongo import MongoClient

client = MongoClient('localhost', 27017)
db = client.models

try:
  model = db.models.find_one({"_id": ObjectId(model)})
except:
  raise ValueError('Model not found')

onnx_model = pickle.loads(model['model'])
ort_session = onnxruntime.InferenceSession(onnx_model.SerializeToString())
```

Then you can use this session to actually predict labels for `images` in the following way:
```
import numpy as np
ort_inputs = {ort_session.get_inputs()[0].name: np.transpose(images, (0, 3, 1, 2)).astype('float32') / 255.}
outputs = ort_session.run(None, ort_inputs)[0]

labels = [l.argmax() for l in outputs]
```

Before all that, if you don't have a model in an onnx format you can take a look at an example udner convert_to_onnx.py that converts a pytorch model to onnx. Some models in onnx format are provided under `models/`.

### Sending images from Flask to React
Sending a 1000 images from the database to the React frontend can be tricky especially if you want to render them instead of downloading them. In order to achieve that I created a `MultipartEncoder` response in Flask where each part is an image that is converted first to bytes using io.BytesIO() and then to a base64 string using base64.encodebytes(). I set each part of the response to content-type 'image/png'. This allows the React frontend to parse the response as `formData` and iterate over all the parts where the images are stored as base64 that can be used to render them as <img src="data:image/png;base64,{base64_string_of_the_image}">.

### Database Schema
<img src="https://github.com/pkiourti/visualizing_nn_adversarial_attacks/blob/main/screenshots/db-schema.png">

### Architecture for the upload functionality that uploads a model to the server and saves it to the Database
<img src="https://github.com/pkiourti/visualizing_nn_adversarial_attacks/blob/main/screenshots/architecture-upload-functionality.png">

### Screenshots of the application:
#### Login Screen
<img src="https://github.com/pkiourti/visualizing_nn_adversarial_attacks/blob/main/screenshots/login.png">

#### Login Screen after typing your email
<img src="https://github.com/pkiourti/visualizing_nn_adversarial_attacks/blob/main/screenshots/login-data.png">

#### Transition to the screen with the models associated with the user's typed email
<img src="https://github.com/pkiourti/visualizing_nn_adversarial_attacks/blob/main/screenshots/models_table.png">

#### After we select a model from the previous screen, we transition to the screen that shows an image per category from the benchmark dataset that the model is trained on
<img src="https://github.com/pkiourti/visualizing_nn_adversarial_attacks/blob/main/screenshots/image_categories.png">

#### After we select the class of images we want to attack, we transition to the screen that shows all the images in this category
<img src="https://github.com/pkiourti/visualizing_nn_adversarial_attacks/blob/main/screenshots/images.png">

#### After choosing the image we want to attack, we choose the attack type
<img src="https://github.com/pkiourti/visualizing_nn_adversarial_attacks/blob/main/screenshots/attack-page.png">

#### After selecting the attack type, we select the attack details
<img src="https://github.com/pkiourti/visualizing_nn_adversarial_attacks/blob/main/screenshots/attack-page-form.png">
<img src="https://github.com/pkiourti/visualizing_nn_adversarial_attacks/blob/main/screenshots/attack-page-form-with-data.png">

#### After determining the details of the attack, we click on Test and see the results
As we can see, the poisoned image contains the white rectangle on the bottom right of the image. This causes the image to be misclassified as airplane. It also causes 80.17% of the images to be misclassified as airplane.
<img src="https://github.com/pkiourti/visualizing_nn_adversarial_attacks/blob/main/screenshots/results.png">
