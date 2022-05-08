# visualizing_nn_adversarial_attacks

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
I used ngrok to access the Flask server that runs locally on port 5000 (started in the previous step). I couldn't access the deployed AWS Flask server or even the one running localhost without ngrok. ngrok is a simple solution to expose a local server to the Internet. Download tar file from here: https://ngrok.com/download:
```
sudo tar xvzf ~/Downloads/ngrok-stable-linux-amd64.tgz -C /usr/local/bin
cd ~/Downloads/ngrok-stable-linux-amd64
./ngrok http 5000
```
Change line 13 of the nn-app/src/App.js from 
`base_url: "https://b5d8-24-63-24-208.ngrok.io",` to the https url that ngrok outputs.

### Install dependencies for React
```
cd ~/ec530/final_project/visualizing_nn_adversarial_attacks/nn-app 
npm install
```
### Start MongoDB
```
$ sudo systemctl start mongod
```
### Start the Flask server
In order to run the tests or use any part of this code from its home directory you need to set the FLASK environment variable as follows:
```
cd ~/ec530/final_project/visualizing_nn_adversarial_attacks/
export FLASK_APP="application.py"
flask run
```
### Screenshots
## Screenshots of React Native App
Screenshots of the application:
- <img src="https://github.com/pkiourti/visualizing_nn_adversarial_attacks/blob/main/screenshots/login.png" width="250" height="400">
- <img src="https://github.com/pkiourti/visualizing_nn_adversarial_attacks/blob/main/screenshots/login-data.png" width="250" height="400">
- <img src="https://github.com/pkiourti/visualizing_nn_adversarial_attacks/blob/main/screenshots/models_table.png" width="250" height="400">
- <img src="https://github.com/pkiourti/visualizing_nn_adversarial_attacks/blob/main/screenshots/image_categories.png" width="250" height="400">
- <img src="https://github.com/pkiourti/visualizing_nn_adversarial_attacks/blob/main/screenshots/images.png" width="250" height="400">
- <img src="https://github.com/pkiourti/visualizing_nn_adversarial_attacks/blob/main/screenshots/attack-page.png" width="250" height="400">
- <img src="https://github.com/pkiourti/visualizing_nn_adversarial_attacks/blob/main/screenshots/attack-page-form.png" width="250" height="400">
- <img src="https://github.com/pkiourti/patient_monitor/blob/main/screenshots/attack-page-form-data.png" width="250" height="400">
- <img src="https://github.com/pkiourti/patient_monitor/blob/main/screenshots/results.png" width="250" height="400">

