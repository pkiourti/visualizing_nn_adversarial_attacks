import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader
from torchvision import datasets 

import os

class CIFAR10(nn.Module):
        
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(3, 32, 3, 1, 1)
        self.batch1 = nn.BatchNorm2d(32)
        self.conv2 = nn.Conv2d(32, 32, 3, 1, 1)
        self.batch2 = nn.BatchNorm2d(32)
        self.dropout1 = nn.Dropout(0.25)
        
        self.conv3 = nn.Conv2d(32, 64, 3, 1, 1)
        self.batch3 = nn.BatchNorm2d(64)
        self.conv4 = nn.Conv2d(64, 64, 3, 1, 1)
        self.batch4 = nn.BatchNorm2d(64)
        self.dropout2 = nn.Dropout(0.25)
        
        self.conv5 = nn.Conv2d(64, 128, 3, 1, 1)
        self.batch5 = nn.BatchNorm2d(128)
        self.conv6 = nn.Conv2d(128, 128, 3, 1, 1)
        self.batch6 = nn.BatchNorm2d(128)
        self.dropout3 = nn.Dropout(0.25)

        self.fc1 = nn.Linear(4*4*128,120)
        self.fc2 = nn.Linear(120,84)
        self.fc3 = nn.Linear(84,10)
       
    def forward(self,X):
        X = F.relu(self.conv1(X))
        X = self.batch1(X)
        X = F.relu(self.conv2(X))
        X = self.batch2(X)
        X = self.dropout1(F.max_pool2d(X,2,2))
        
        X = F.relu(self.conv3(X))
        X = self.batch3(X)
        X = F.relu(self.conv4(X))
        X = self.batch4(X)
        X = self.dropout2(F.max_pool2d(X,2,2))
        
        X = F.relu(self.conv5(X))
        X = self.batch5(X)
        X = F.relu(self.conv6(X))
        X = self.batch6(X)
        X = self.dropout3(F.max_pool2d(X,2,2))

        X = X.view(-1, 4*4*128)
        X = self.fc1(X)
        X = self.fc2(X)
        X = self.fc3(X)
        return F.log_softmax(X,dim=1)

    def features(self,X):
        relu1 = F.relu(self.conv1(X))
        X = self.batch1(relu1)
        relu2 = F.relu(self.conv2(X))
        X = self.batch2(relu2)
        X = self.dropout1(F.max_pool2d(X,2,2))
        
        relu3 = F.relu(self.conv3(X))
        X = self.batch3(relu3)
        relu4 = F.relu(self.conv4(X))
        X = self.batch4(relu4)
        X = self.dropout2(F.max_pool2d(X,2,2))
        
        relu5 = F.relu(self.conv5(X))
        X = self.batch5(relu5)
        relu6 = F.relu(self.conv6(X))
        X = self.batch6(relu6)
        last_features = self.dropout3(F.max_pool2d(X,2,2))
    
        return (relu1, relu2, relu3, relu4, relu5, last_features)
