from pymongo import MongoClient
from datetime import datetime
import os
import numpy as np
from PIL import Image
import pickle

def insert_attack_types(db, benchmark):
    attack_types = ['lambda', 'rectangle', 'random rectangle', 'noise', 'spread-out']
    categories = ['backdoor', 'backdoor', 'backdoor', 'backdoor', 'backdoor']
    for i in range(len(attack_types)):
        attack_type = {
            "category": categories[i],
            "type": attack_types[i],
        }
        db.attack.insert_one(attack_type)

def insert_classnames(db, benchmark):
    benchmark_obj = db.benchmarks.find_one({"benchmark": benchmark})
    benchmark_id = str(benchmark_obj['_id'])
    
    list_of_label_names = list(range(10)) if benchmark == 'MNIST' else np.load(os.path.join(benchmark, 'label_names.npy'))

    for i, label_name in enumerate(list_of_label_names):
        class_name = {
            "benchmark": benchmark_id,
            "class_id": i,
            "class_label": label_name,
        }
        db.class_names.insert_one(class_name)

def insert_benchmark_images(db, benchmark):
    benchmark_obj = db.benchmarks.find_one({"benchmark": benchmark})
    benchmark_id = str(benchmark_obj['_id'])

    folder = os.path.join(benchmark, 'images')
    list_of_images = os.listdir(folder)
    list_of_labels = np.load(os.path.join(benchmark, 'y_test.npy'))

    for i, img in enumerate(list_of_images):
        im = Image.open(os.path.join(folder, img))
        label = list_of_labels[i]
        image = {
            "image": pickle.dumps(im),
            "class": int(label),
            "benchmark": benchmark_id,
            "created_at": datetime.utcnow()
        }
        db.images.insert_one(image)

def insert_benchmarks(db, benchmarks):
    for benchmark in benchmarks:
        response = db.benchmarks.insert_one({"benchmark": benchmark})

if __name__ == '__main__':
    client = MongoClient('localhost', 27017)
    db = client.models

    # Add benchmarks to the database
    benchmarks = ['CIFAR10', 'GTSRB', 'MNIST', 'Fashion_MNIST']
    insert_benchmarks(db, benchmarks)

    # Add validation images for each benchmark to the database
    for benchmark in benchmarks:
        insert_benchmark_images(db, benchmark)

    # Add class names to the database
    for benchmark in benchmarks:
        insert_classnames(db, benchmark)

    # Add attack types to the database
    for benchmark in benchmarks:
        insert_attack_types(db, benchmark)
