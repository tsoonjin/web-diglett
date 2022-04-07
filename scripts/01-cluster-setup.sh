#!/bin/sh

# Get arkade, and move it to $PATH
curl -sLS https://get.arkade.dev | sh
sudo mv arkade /usr/local/bin/

# Run Kubernetes locally
arkade get kind 
sudo mv ~/.arkade/bin/kind /usr/local/bin

# Kubernetes CLI
arkade get kubectl
sudo mv ~/.arkade/bin/kubectl /usr/local/bin

# OpenFaaS CLI
arkade get faas-cli
sudo mv ~/.arkade/bin/faas-cli /usr/local/bin

# Create a cluster
kind create cluster

# Install openfaas
arkade install openfaas
