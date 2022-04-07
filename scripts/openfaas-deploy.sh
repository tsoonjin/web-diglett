#!/bin/sh
export OPENFAAS_URL=http://127.0.0.1:8080
kubectl config use-context kind-kind

# If basic auth is enabled, you can now log into your gateway:
PASSWORD=$(kubectl get secret -n openfaas basic-auth -o jsonpath="{.data.basic-auth-password}" | base64 --decode; echo)
echo $PASSWORD | faas-cli login -g $OPENFAAS_URL -u admin -s

cd ./openfaas
faas-cli up -f stack.yml


